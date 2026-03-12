import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getOs, OrdenServicio } from "../api/os";
import { postDiagnostico, postProtocoloIngenieria, postCierreLab } from "../api/lab";
import { qaRecepcionSonda } from "../api/qa";

export default function OsDetailPage() {
  const { id } = useParams();
  const osId = id ?? "";

  const [os, setOs] = useState<OrdenServicio | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // forms
  const [hallazgos, setHallazgos] = useState("");
  const [acciones, setAcciones] = useState("");
  const [protocolo, setProtocolo] = useState("");
  const [resultado, setResultado] = useState("REPARADO");
  const [obs, setObs] = useState("");
  const [ubicacionQa, setUbicacionQa] = useState("LAB_QA_SONDA");

  const load = async () => {
    setErr(null);
    setBusy(true);
    try {
      const data = await getOs(osId);
      setOs(data);
    } catch (ex: any) {
      setErr(ex?.response?.data?.detail ?? ex?.message ?? "Error cargando OS");
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => { if (osId) load(); }, [osId]);

  const act = async (fn: () => Promise<any>) => {
    setErr(null);
    setBusy(true);
    try {
      await fn();
      await load();
    } catch (ex: any) {
      setErr(ex?.response?.data?.detail ?? ex?.message ?? "Acción fallida");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container">
      <div className="card">
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <h2 className="title" style={{ margin: 0 }}>Detalle OS: {osId}</h2>
          <button className="btn secondary" onClick={load} disabled={busy}>
            {busy ? "Cargando..." : "Refrescar"}
          </button>
        </div>

        {err ? <p className="small" style={{ color: "#b91c1c" }}>{err}</p> : null}

        <hr className="hr" />

        <div className="row">
          <div className="col card">
            <h3 style={{ marginTop: 0 }}>Datos</h3>
            <p className="small">Estado: {os?.estado ? <span className="badge">{os.estado}</span> : "-"}</p>
            <p className="small">Tipo: {os?.equipo_tipo ?? "-"}</p>
            <p className="small">Terminal: {os?.terminal ?? "-"}</p>
            <p className="small">Técnico: {os?.tecnico_asignado ?? "-"}</p>
          </div>

          <div className="col card">
            <h3 style={{ marginTop: 0 }}>QA - Recepción Sonda</h3>
            <p className="small muted">
              Útil para flujos tipo: EN_TRANSITO_A_SONDA → EN_CERTIFICACION_SONDA
            </p>
            <label className="small">Ubicación</label>
            <input className="input" value={ubicacionQa} onChange={(e) => setUbicacionQa(e.target.value)} />
            <div style={{ marginTop: 10 }}>
              <button
                className="btn"
                disabled={busy}
                onClick={() => act(() => qaRecepcionSonda({ os_ids: [osId], ubicacion: ubicacionQa }))}
              >
                Ejecutar Recepción QA
              </button>
            </div>
          </div>
        </div>

        <hr className="hr" />

        <div className="row">
          <div className="col card">
            <h3 style={{ marginTop: 0 }}>Lab - Diagnóstico</h3>
            <label className="small">Hallazgos</label>
            <input className="input" value={hallazgos} onChange={(e) => setHallazgos(e.target.value)} />
            <div style={{ height: 10 }} />
            <label className="small">Acciones</label>
            <input className="input" value={acciones} onChange={(e) => setAcciones(e.target.value)} />
            <div style={{ marginTop: 10 }}>
              <button
                className="btn"
                disabled={busy || !hallazgos || !acciones}
                onClick={() => act(() => postDiagnostico({ os_id: osId, hallazgos, acciones }))}
              >
                Guardar Diagnóstico
              </button>
            </div>
          </div>

          <div className="col card">
            <h3 style={{ marginTop: 0 }}>Lab - Protocolo Ingeniería</h3>
            <label className="small">Protocolo</label>
            <input className="input" value={protocolo} onChange={(e) => setProtocolo(e.target.value)} />
            <div style={{ marginTop: 10 }}>
              <button
                className="btn"
                disabled={busy || !protocolo}
                onClick={() => act(() => postProtocoloIngenieria({ os_id: osId, protocolo }))}
              >
                Guardar Protocolo
              </button>
            </div>
          </div>

          <div className="col card">
            <h3 style={{ marginTop: 0 }}>Lab - Cierre</h3>
            <label className="small">Resultado</label>
            <input className="input" value={resultado} onChange={(e) => setResultado(e.target.value)} />
            <div style={{ height: 10 }} />
            <label className="small">Observación</label>
            <input className="input" value={obs} onChange={(e) => setObs(e.target.value)} />
            <div style={{ marginTop: 10 }}>
              <button
                className="btn"
                disabled={busy || !resultado}
                onClick={() => act(() => postCierreLab({ os_id: osId, resultado, observacion: obs }))}
              >
                Cerrar en Lab
              </button>
            </div>
          </div>
        </div>

        <p className="small muted" style={{ marginTop: 14 }}>
          Nota: si tus rutas reales tienen otros paths/inputs, ajustas SOLO los archivos de <code>src/api</code>.
        </p>
      </div>
    </div>
  );
}
