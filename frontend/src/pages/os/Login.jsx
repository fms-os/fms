import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "sonner";

export default function OSLogin() {
  const nav = useNavigate();
  const { login, user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  React.useEffect(() => { if (user) nav("/os"); }, [user, nav]);
  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const r = await login(email, password);
    setLoading(false);
    if (r.ok) { toast.success("Bienvenue."); nav("/os"); }
    else toast.error(r.error || "Identifiants invalides");
  };
  return (
    <div className="os-shell min-h-screen flex items-center justify-center px-6" style={{ background: "#0A0A0A" }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="text-white public-serif text-4xl">FMS OS</div>
          <div className="os-data-label text-neutral-500 mt-2">Factory Maker Studio — Operating System</div>
        </div>
        <form onSubmit={submit} className="os-card p-8 space-y-4" style={{ background: "#141416", borderColor: "#26262A" }}>
          <div>
            <label className="os-data-label block mb-2 text-neutral-400">Email</label>
            <input type="email" data-testid="os-login-email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 rounded-md bg-[#0A0A0A] border border-[#26262A] text-white" />
          </div>
          <div>
            <label className="os-data-label block mb-2 text-neutral-400">Mot de passe</label>
            <input type="password" data-testid="os-login-password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 rounded-md bg-[#0A0A0A] border border-[#26262A] text-white" />
          </div>
          <button disabled={loading} data-testid="os-login-submit" className="w-full py-3 rounded-md bg-[#A78BFA] hover:bg-[#8B5CF6] text-black font-medium transition-colors">{loading ? "…" : "Se connecter"}</button>
          <div className="text-xs text-neutral-500 pt-2 border-t border-[#26262A]">
            <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-amber-500" /> Frek-ID SSO · <span className="text-amber-500">NOT_CONNECTED</span></div>
          </div>
        </form>
      </div>
    </div>
  );
}
