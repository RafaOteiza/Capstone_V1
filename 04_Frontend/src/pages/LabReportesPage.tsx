import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { FileText, TrendingUp } from "lucide-react";

// Datos dummy hasta que tengamos endpoint de reportes real
const dataFallas = [
  { name: 'Pantalla Oscura', cantidad: 12 },
  { name: 'No Enciende', cantidad: 8 },
  { name: 'Touch Dañado', cantidad: 5 },
  { name: 'Conector Roto', cantidad: 3 },
  { name: 'Software', cantidad: 15 },
];

export default function LabReportesPage() {
  return (
    <div className="panel animate-fade-in">
      <h2 className="title">Laboratorio · Reportes</h2>
      <p className="muted">Métricas de rendimiento y fallas frecuentes.</p>
      
      <div className="hr" />

      <div className="grid" style={{ gap: 20, gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
        
        {/* KPI Card */}
        <div className="card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', gap: 15, alignItems: 'center', marginBottom: 15 }}>
                <div style={{ padding: 10, background: 'rgba(16, 185, 129, 0.1)', borderRadius: 8, color: '#10B981' }}>
                    <TrendingUp size={24} />
                </div>
                <div>
                    <div className="muted small">EFICIENCIA SEMANAL</div>
                    <div className="title" style={{ fontSize: '1.5rem', margin: 0 }}>92%</div>
                </div>
            </div>
            <p className="small muted">Equipos reparados vs ingresados esta semana.</p>
        </div>

        {/* Gráfico */}
        <div className="card" style={{ padding: 20, gridColumn: 'span 2' }}>
            <h3 style={{ marginTop: 0, fontSize: '1.1rem' }}>Top 5 Fallas Recurrentes</h3>
            <div style={{ height: 300, width: '100%', marginTop: 20 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dataFallas} layout="vertical" margin={{ left: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.1} horizontal={false} />
                        <XAxis type="number" stroke="var(--text-muted)" fontSize={12} />
                        <YAxis dataKey="name" type="category" stroke="var(--text-muted)" fontSize={12} width={100} />
                        <Tooltip 
                            contentStyle={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 8 }}
                            itemStyle={{ color: 'var(--text-main)' }}
                        />
                        <Bar dataKey="cantidad" fill="#3B82F6" radius={[0, 4, 4, 0]} barSize={20} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>

      </div>
    </div>
  );
}