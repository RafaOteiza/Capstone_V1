import React, { useState } from "react";
import { changeMyPassword } from "../api/auth";

export default function SettingsPage() {
  const [pw1, setPw1] = useState("");
  const [pw2, setPw2] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const save = async () => {
    setErr(null);
    setInfo(null);
    if (!pw1 || pw1 !== pw2) {
      setErr("Las contraseñas no coinciden o están vacías");
      return;
    }
    setBusy(true);
    try {
      await changeMyPassword(pw1);
      setInfo("Contraseña actualizada correctamente.");
      setPw1("");
      setPw2("");
    } catch (ex: any) {
      const detail = ex?.response?.data?.detail ?? ex?.response?.data?.error ?? ex?.message;
      setErr(detail ?? "No se pudo cambiar la contraseña");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="panel">
      <h2 className="title">Ajustes</h2>
      <p className="muted">Preferencias de cuenta.</p>

      <div className="hr" />

      <div className="card">
        <h3 style={{ marginTop: 0 }}>Seguridad</h3>
        <p className="muted">Cambia tu contraseña (afecta a tu sesión actual).</p>

        {err ? <p className="small" style={{ color: "var(--red)" }}>{err}</p> : null}
        {info ? <p className="small" style={{ color: "var(--green)" }}>{info}</p> : null}

        <label className="small">Nueva contraseña</label>
        <input className="input" type="password" value={pw1} onChange={(e) => setPw1(e.target.value)} />
        <div style={{ height: 10 }} />
        <label className="small">Confirmar contraseña</label>
        <input className="input" type="password" value={pw2} onChange={(e) => setPw2(e.target.value)} />

        <div style={{ marginTop: 12 }}>
          <button className="btn" onClick={save} disabled={busy || !pw1 || !pw2}>
            {busy ? "Guardando..." : "Cambiar contraseña"}
          </button>
        </div>
      </div>
    </div>
  );
}
