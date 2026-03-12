import React, { useEffect, useState } from "react";
import { getQaQueue, processQa, QaTicket } from "../api/qa";
import { RefreshCw, CheckCircle, XCircle, Search, Microscope, UserCheck } from "lucide-react";

export default function QaPage() {
  const [tickets, setTickets] = useState<QaTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await getQaQueue();
      setTickets(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleProcess = async (os: string, accion: 'APROBAR' | 'RECHAZAR') => {
    if (!confirm(`¿Estás seguro de ${accion} el equipo ${os}?`)) return;
    
    setProcessing(os);
    try {
      await processQa(os, accion);
      setTickets(prev => prev.filter(t => t.codigo_os !== os)); // Remover de la lista
    } catch (error) {
      alert("Error al procesar QA");
    } finally {
      setProcessing(null);
    }
  };

  return (
    <div className="panel animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 }}>
        <div>
          <h2 className="title" style={{ fontSize: '1.8rem', marginBottom: 5 }}>Control de Calidad (QA)</h2>
          <p className="muted" style={{ margin: 0 }}>Certificación técnica de equipos reparados.</p>
        </div>
        <button onClick={load} className="btn ghost" disabled={loading}>
            <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      <div className="grid" style={{ gap: 20 }}>
        {tickets.length === 0 && !loading && (
            <div className="card" style={{ padding: 40, textAlign: 'center' }}>
                <UserCheck size={48} style={{ opacity: 0.2, margin: '0 auto 15px' }} />
                <p className="muted">No hay equipos esperando certificación QA.</p>
            </div>
        )}

        {tickets.map(t => (
            <div key={t.codigo_os} className="card" style={{ padding: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20, borderLeft: '4px solid #8B5CF6' }}>
                
                <div style={{ display: 'flex', gap: 20, alignItems: 'center', flex: 1 }}>
                    <div style={{ padding: 12, borderRadius: 12, backgroundColor: 'rgba(139, 92, 246, 0.1)', color: '#8B5CF6' }}>
                        <Microscope size={24} />
                    </div>
                    <div>
                        <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 5 }}>
                            <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{t.codigo_os}</span>
                            <span className="badge">{t.tipo_equipo}</span>
                        </div>
                        <div className="muted small">
                            Serie: <strong style={{color: 'var(--text-main)'}}>{t.serie}</strong> • Reparado por: {t.tecnico_reparador || 'Desconocido'}
                        </div>
                        <div style={{ marginTop: 8, fontSize: '0.9rem' }}>
                            <span style={{color: '#F59E0B'}}>Falla Original:</span> {t.falla}
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                    <button 
                        className="btn"
                        disabled={!!processing}
                        onClick={() => handleProcess(t.codigo_os, 'RECHAZAR')}
                        style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', border: '1px solid rgba(239, 68, 68, 0.2)', display: 'flex', gap: 8, alignItems: 'center' }}
                    >
                        {processing === t.codigo_os ? '...' : <><XCircle size={18} /> Rechazar</>}
                    </button>

                    <button 
                        className="btn"
                        disabled={!!processing}
                        onClick={() => handleProcess(t.codigo_os, 'APROBAR')}
                        style={{ backgroundColor: '#10B981', color: 'white', border: 'none', display: 'flex', gap: 8, alignItems: 'center' }}
                    >
                        {processing === t.codigo_os ? '...' : <><CheckCircle size={18} /> Aprobar</>}
                    </button>
                </div>
            </div>
        ))}
      </div>
    </div>
  );
}