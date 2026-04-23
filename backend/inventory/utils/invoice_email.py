from io import BytesIO
from decimal import Decimal

from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils import timezone

from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas


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
    if invoice.invoice_type != "SERVICING":
        return []

    return [
        item for item in invoice_items(invoice)
        if getattr(item, "item_type", "") == "SERVICE"
        or getattr(item, "source_type", "") == "MANUAL"
    ]


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


def _draw_wrapped_text(pdf, text, x, y, max_width=500, line_height=14, font_name="Helvetica", font_size=10):
    """
    Draw wrapped text line by line and return updated y position.
    """
    if not text:
        return y

    pdf.setFont(font_name, font_size)
    words = str(text).split()
    line = ""

    for word in words:
        test_line = f"{line} {word}".strip()
        if pdf.stringWidth(test_line, font_name, font_size) <= max_width:
            line = test_line
        else:
            pdf.drawString(x, y, line)
            y -= line_height
            line = word

    if line:
        pdf.drawString(x, y, line)
        y -= line_height

    return y


def _draw_multiline_preserve_breaks(pdf, text, x, y, max_width=500, line_height=13, font_name="Helvetica", font_size=10):
    """
    Keep user line breaks and still wrap long lines.
    """
    if not text:
        return y

    for raw_line in str(text).splitlines():
        if not raw_line.strip():
            y -= line_height
            continue
        y = _draw_wrapped_text(
            pdf,
            raw_line,
            x,
            y,
            max_width=max_width,
            line_height=line_height,
            font_name=font_name,
            font_size=font_size,
        )
    return y


def render_invoice_pdf(invoice):
    """
    Lightweight Railway-safe PDF generator using reportlab.
    Clean A4 layout.
    """
    buffer = BytesIO()
    pdf = canvas.Canvas(buffer, pagesize=A4)

    width, height = A4
    left = 40
    right = width - 40
    y = height - 40

    def new_page():
        nonlocal y
        pdf.showPage()
        y = height - 40

    def ensure_space(min_y=80):
        nonlocal y
        if y < min_y:
            new_page()

    # Header
    pdf.setTitle(f"{document_label(invoice)} {getattr(invoice, 'invoice_number', '')}")

    pdf.setFont("Helvetica-Bold", 18)
    pdf.drawString(left, y, "YARIS AUTOCARE")
    pdf.setFont("Helvetica", 9)
    pdf.drawString(left, y - 14, "Car Rental • Mechanical Services • Auto Parts")
    pdf.drawString(left, y - 27, "16 Legana Park Drive, Legana TAS 7277")
    pdf.drawString(left, y - 40, "0449 828 749   |   yarisautocare@gmail.com")

    pdf.setFont("Helvetica-Bold", 16)
    pdf.drawRightString(right, y, document_label(invoice))
    pdf.setFont("Helvetica", 9)
    pdf.drawRightString(right, y - 14, f"No: {getattr(invoice, 'invoice_number', '-')}")
    created_at = getattr(invoice, "created_at", None)
    pdf.drawRightString(
        right,
        y - 27,
        f"Date: {timezone.localtime(created_at).strftime('%d/%m/%Y') if created_at else '-'}"
    )
    pdf.drawRightString(right, y - 40, f"Type: {format_invoice_type(getattr(invoice, 'invoice_type', ''))}")

    y -= 58
    pdf.line(left, y, right, y)
    y -= 20

    # Customer and vehicle
    pdf.setFont("Helvetica-Bold", 11)
    pdf.drawString(left, y, "Customer Details")
    pdf.drawString(left + 290, y, "Vehicle Details")
    y -= 16

    pdf.setFont("Helvetica", 10)
    customer_lines = [
        f"Customer: {getattr(invoice, 'customer_name', '-') or '-'}",
        f"Phone: {getattr(invoice, 'customer_phone', '-') or '-'}",
        f"Email: {getattr(invoice, 'customer_email', '-') or '-'}",
        f"Address: {getattr(invoice, 'customer_address', '-') or '-'}",
    ]

    vehicle_lines = [
        f"Rego: {getattr(invoice, 'rego', '-') or '-'}",
        f"Make: {getattr(invoice, 'make', '-') or '-'}",
        f"Model: {getattr(invoice, 'model', '-') or '-'}",
        f"VIN: {getattr(invoice, 'vin', '-') or '-'}",
        f"Odometer: {str(getattr(invoice, 'odometer', '-') or '-')}",
    ]

    customer_y = y
    for line in customer_lines:
        customer_y = _draw_wrapped_text(pdf, line, left, customer_y, max_width=240, line_height=13)

    vehicle_y = y
    for line in vehicle_lines:
        vehicle_y = _draw_wrapped_text(pdf, line, left + 290, vehicle_y, max_width=230, line_height=13)

    y = min(customer_y, vehicle_y) - 10
    ensure_space()

    # Service details
    service_detail = getattr(invoice, "service_detail", None)
    if getattr(invoice, "invoice_type", "") == "SERVICING":
        pdf.setFont("Helvetica-Bold", 11)
        service_heading = "Service Details"
        template_type = service_template_type(invoice)
        if template_type:
            service_heading += f" - {template_type}"
        pdf.drawString(left, y, service_heading)
        y -= 16

        pdf.setFont("Helvetica", 10)
        service_lines = [
            f"Service At KM: {getattr(service_detail, 'service_at_km', '-') or '-'}",
            f"Next Service At KM: {getattr(service_detail, 'next_service_at_km', '-') or '-'}",
            f"Next Service Date: {getattr(service_detail, 'next_service_date', '-') or '-'}",
        ]
        for line in service_lines:
            pdf.drawString(left, y, line)
            y -= 13

        checklist = service_checklist(invoice)
        if checklist:
            y -= 4
            pdf.setFont("Helvetica-Bold", 10)
            pdf.drawString(left, y, "Service Checklist")
            y -= 14
            pdf.rect(left, y - 68, right - left, 68, stroke=1, fill=0)
            y -= 10
            pdf.setFont("Helvetica", 9)
            y = _draw_multiline_preserve_breaks(
                pdf,
                checklist,
                left + 8,
                y,
                max_width=(right - left) - 16,
                line_height=11,
                font_size=9,
            )
            y -= 8

        service_notes = getattr(service_detail, "service_notes", "") if service_detail else ""
        if service_notes:
            ensure_space(120)
            pdf.setFont("Helvetica-Bold", 10)
            pdf.drawString(left, y, "Service Notes")
            y -= 14
            pdf.rect(left, y - 50, right - left, 50, stroke=1, fill=0)
            y -= 10
            pdf.setFont("Helvetica", 9)
            y = _draw_multiline_preserve_breaks(
                pdf,
                service_notes,
                left + 8,
                y,
                max_width=(right - left) - 16,
                line_height=11,
                font_size=9,
            )
            y -= 8

    ensure_space(170)

    # Items table
    items = extra_items(invoice) if getattr(invoice, "invoice_type", "") == "SERVICING" else invoice_items(invoice)

    title = "Extra Items" if getattr(invoice, "invoice_type", "") == "SERVICING" else "Invoice Details"
    pdf.setFont("Helvetica-Bold", 11)
    pdf.drawString(left, y, title)
    y -= 16

    # Table headers
    col_x = [left, left + 28, left + 265, left + 330, left + 375, left + 440, left + 500, right]
    row_height = 18

    pdf.setFont("Helvetica-Bold", 9)
    pdf.rect(left, y - row_height, right - left, row_height, stroke=1, fill=0)
    headers = ["#", "Description", "Type", "Qty", "Amount", "Disc.", "Total"]
    header_positions = [
        left + 10,
        left + 38,
        left + 280,
        left + 338,
        left + 388,
        left + 452,
        left + 515,
    ]
    for i, header in enumerate(headers):
        pdf.drawString(header_positions[i], y - 12, header)

    y -= row_height

    pdf.setFont("Helvetica", 8.8)

    if not items:
        pdf.rect(left, y - 18, right - left, 18, stroke=1, fill=0)
        pdf.drawString(left + 10, y - 12, "No items.")
        y -= 18
    else:
        for index, item in enumerate(items, start=1):
            ensure_space(120)

            name = getattr(item, "name", "") or "-"
            description = getattr(item, "description", "") or ""
            item_type = getattr(item, "item_type", "") or getattr(item, "source_type", "") or "ITEM"
            qty = getattr(item, "quantity", 0) or 0
            unit_price = money(getattr(item, "unit_price", 0))
            discount = money(getattr(item, "discount", 0))
            line_total = money(getattr(item, "line_total", 0))

            desc_lines = [name]
            if description:
                desc_lines += description.splitlines()

            line_count = max(1, len(desc_lines))
            dynamic_height = max(20, 10 + (line_count * 10))

            pdf.rect(left, y - dynamic_height, right - left, dynamic_height, stroke=1, fill=0)

            # vertical separators
            for vx in col_x[1:-1]:
                pdf.line(vx, y, vx, y - dynamic_height)

            pdf.drawString(left + 8, y - 12, str(index))

            text_y = y - 10
            pdf.setFont("Helvetica-Bold", 8.8)
            pdf.drawString(left + 34, text_y, name[:48])
            pdf.setFont("Helvetica", 8.3)

            if description:
                desc_y = text_y - 10
                for line in description.splitlines():
                    if desc_y < y - dynamic_height + 6:
                        break
                    pdf.drawString(left + 34, desc_y, line[:48])
                    desc_y -= 9

            pdf.drawString(left + 272, y - 12, str(item_type)[:10])
            pdf.drawRightString(left + 370, y - 12, str(qty))
            pdf.drawRightString(left + 435, y - 12, f"${unit_price}")
            pdf.drawRightString(left + 495, y - 12, f"${discount}")
            pdf.drawRightString(right - 8, y - 12, f"${line_total}")

            y -= dynamic_height

    y -= 10
    ensure_space(130)

    # Notes
    notes = cleaned_notes(invoice)
    if notes:
        pdf.setFont("Helvetica-Bold", 11)
        pdf.drawString(left, y, "Notes")
        y -= 14
        pdf.rect(left, y - 55, right - left, 55, stroke=1, fill=0)
        y -= 10
        pdf.setFont("Helvetica", 9)
        y = _draw_multiline_preserve_breaks(
            pdf,
            notes,
            left + 8,
            y,
            max_width=(right - left) - 16,
            line_height=11,
            font_size=9,
        )
        y -= 10

    ensure_space(140)

    # Footer boxes
    left_box_width = 300
    right_box_width = 200
    footer_top = y

    # Payment box
    pdf.rect(left, footer_top - 80, left_box_width, 80, stroke=1, fill=0)
    pdf.setFont("Helvetica-Bold", 10)
    pdf.drawString(left + 8, footer_top - 14, "Payment Details")
    pdf.setFont("Helvetica", 8.8)
    payment_lines = [
        "Bank: ANZ Pty. Ltd.",
        "Account Name: Pyramid Enterprises AU Pty Ltd",
        "BSB: 013270",
        "Account No: 430088057",
        "Please email remittance to yarisautocare@gmail.com",
    ]
    py = footer_top - 28
    for line in payment_lines:
        pdf.drawString(left + 8, py, line)
        py -= 11

    # Totals box
    box_x = right - right_box_width
    pdf.rect(box_x, footer_top - 80, right_box_width, 80, stroke=1, fill=0)
    pdf.setFont("Helvetica", 9)

    totals = [
        ("Subtotal", f"${money(getattr(invoice, 'subtotal', 0))}"),
        ("GST Included", f"${money(getattr(invoice, 'gst_amount', 0))}"),
        ("Paid Amount", f"${money(getattr(invoice, 'paid_amount', 0))}"),
        ("Total Amount", f"${money(getattr(invoice, 'total_amount', 0))}"),
        ("Balance Due", f"${money(getattr(invoice, 'balance_due', 0))}"),
    ]

    ty = footer_top - 14
    for label, value in totals:
        if label in ("Total Amount", "Balance Due"):
            pdf.setFont("Helvetica-Bold", 9.5)
        else:
            pdf.setFont("Helvetica", 9)

        pdf.drawString(box_x + 8, ty, label)
        pdf.drawRightString(box_x + right_box_width - 8, ty, value)
        ty -= 13

    pdf.showPage()
    pdf.save()

    buffer.seek(0)
    return buffer.read()


def send_invoice_email(invoice) -> None:
    recipient = (invoice.customer_email or "").strip()
    if not recipient:
        raise ValueError("Customer email is missing.")

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