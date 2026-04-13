import React from 'react';
import { BarChart3, TrendingUp, Package, AlertTriangle, ArrowUpRight, Car } from 'lucide-react';

const StatCard = ({ title, val, trend, icon, color }) => (
  <div style={card}>
    <div style={{display: 'flex', justifyContent: 'space-between'}}>
      <div style={{backgroundColor: color + '22', color: color, padding: '10px', borderRadius: '12px'}}>{icon}</div>
      <div style={{fontSize: '12px', color: '#22c55e', fontWeight: '700', display: 'flex', alignItems: 'center'}}>{trend} <ArrowUpRight size={14}/></div>
    </div>
    <div style={{marginTop: '20px'}}>
      <div style={{fontSize: '13px', color: '#64748b', fontWeight: '600'}}>{title}</div>
      <div style={{fontSize: '28px', fontWeight: '900', color: '#0f172a'}}>{val}</div>
    </div>
  </div>
);

export default function HomePage() {
  return (
    <div>
      <div style={{marginBottom: '30px'}}>
        <h2 style={{fontSize: '26px', fontWeight: '900', color: '#0f172a', margin: 0}}>Yard Control Panel</h2>
        <p style={{color: '#64748b', margin: '5px 0 0 0'}}>Real-time overview of Yaris Autocare Legana.</p>
      </div>

      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px'}}>
        <StatCard title="Total Revenue" val="$14,205" trend="+12%" icon={<BarChart3/>} color="#ef4444" />
        <StatCard title="Used Inventory" val="3,102" trend="+5%" icon={<Package/>} color="#0f172a" />
        <StatCard title="Donor Cars" val="14" trend="Yard" icon={<Car/>} color="#3b82f6" />
        <StatCard title="Low Stock" val="18" trend="Alert" icon={<AlertTriangle/>} color="#f59e0b" />
      </div>

      <div style={{marginTop: '40px', backgroundColor: '#fff', padding: '30px', borderRadius: '20px', border: '1px solid #e2e8f0', textAlign: 'center'}}>
        <h3 style={{margin: 0, fontSize: '18px', fontWeight: '900', color: '#0f172a'}}>Yard Activity Stream</h3>
        <p style={{color: '#64748b', fontSize: '14px', marginBottom: '30px'}}>Database sync active with Railway Cloud.</p>
        <div style={{height: '150px', border: '2px dashed #e2e8f0', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontWeight: '600'}}>
          Live activity feed will appear here as you dismantle cars...
        </div>
      </div>
    </div>
  );
}

const card = { backgroundColor: '#fff', padding: '25px', borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' };
