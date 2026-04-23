from io import BytesIO
from decimal import Decimal
from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils import timezone
from rest_framework.exceptions import ValidationError
from xhtml2pdf import pisa


def money(value):
    try:
        return f"{Decimal(value or 0):.2f}"
    except Exception:
        return "0.00"


def format_invoice_type(invoice_type: str) -> str:
    if not invoice_type:
        return "Invoice"
    if invoice_type == "USED_PART":
        return "Parts Sale"
    if invoice_type == "REPAIR":
        return "Workshop Invoice"
    return str(invoice_type).replace("_", " ").title()


def document_label(invoice) -> str:
    notes = (invoice.notes or "").upper()
    return "QUOTE" if "DOCUMENT TYPE: QUOTE" in notes else "TAX INVOICE"


def service_template_type(invoice) -> str:
    notes = (invoice.notes or "").upper()
    if "SERVICE TYPE: MAJOR" in notes:
        return "Major Service"
    if "SERVICE TYPE: REGULAR" in notes:
        return "Regular Service"
    return ""


def cleaned_notes(invoice) -> str:
    raw = (invoice.notes or "").strip()
    if not raw:
        return ""

    lines = [
        line.strip()
        for line in raw.split("\n")
        if line.strip()
        and not line.strip().upper().startswith("DOCUMENT TYPE:")
        and not line.strip().upper().startswith("SERVICE TYPE:")
    ]
    return "\n\n".join(lines)


def invoice_items(invoice):
    rel = getattr(invoice, "items", None)
    if rel is None:
        return []
    try:
        return list(rel.all())
    except Exception:
        return []


def service_items(invoice):
    return [
        item for item in invoice_items(invoice)
        if getattr(item, "item_type", "") == "SERVICE"
        or getattr(item, "source_type", "") == "MANUAL"
    ] if invoice.invoice_type == "SERVICING" else []


def extra_items(invoice):
    if invoice.invoice_type != "SERVICING":
        return invoice_items(invoice)

    result = []
    for item in invoice_items(invoice):
        if not (
            getattr(item, "item_type", "") == "SERVICE"
            or getattr(item, "source_type", "") == "MANUAL"
        ):
            result.append(item)
    return result


def service_checklist(invoice) -> str:
    items = service_items(invoice)
    if not items:
        return ""
    return getattr(items[0], "description", "") or ""


def invoice_context(invoice):
    service_detail = getattr(invoice, "service_detail", None)

    return {
        "invoice": invoice,
        "document_label": document_label(invoice),
        "invoice_type_label": format_invoice_type(getattr(invoice, "invoice_type", "")),
        "service_template_type": service_template_type(invoice),
        "service_detail": service_detail,
        "items": invoice_items(invoice),
        "extra_items": extra_items(invoice),
        "service_checklist": service_checklist(invoice),
        "cleaned_notes": cleaned_notes(invoice),
        "frontend_url": getattr(settings, "FRONTEND_URL", "").rstrip("/"),
        "generated_at": timezone.localtime(),
        "money": money,
    }


def render_invoice_pdf(invoice) -> bytes:
    context = invoice_context(invoice)
    html = render_to_string("emails/invoice_pdf.html", context)

    output = BytesIO()
    pdf = pisa.CreatePDF(src=html, dest=output)
    if pdf.err:
        raise ValidationError("Failed to generate invoice PDF.")

    return output.getvalue()


def send_invoice_email(invoice) -> None:
    recipient = (invoice.customer_email or "").strip()
    if not recipient:
        raise ValidationError("Customer email is missing.")

    context = invoice_context(invoice)

    subject = f"Yaris Autocare {context['document_label']} {invoice.invoice_number}"
    text_body = render_to_string("emails/invoice_email.txt", context)
    html_body = render_to_string("emails/invoice_email.html", context)

    email = EmailMultiAlternatives(
        subject=subject,
        body=text_body,
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[recipient],
    )
    email.attach_alternative(html_body, "text/html")

    pdf_bytes = render_invoice_pdf(invoice)
    filename = f"{invoice.invoice_number}.pdf"
    email.attach(filename, pdf_bytes, "application/pdf")

    email.send(fail_silently=False)