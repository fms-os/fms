import React, { useState } from "react";
import api, { formatApiError } from "../../lib/api";
import { toast } from "sonner";

export default function News() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/public/newsletter", { email });
      toast.success("Inscription confirmée. Merci !");
      setEmail("");
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail));
    } finally { setLoading(false); }
  };
  return (
    <div className="pt-32 pb-24 px-6 lg:px-10 bg-white">
      <div className="mx-auto max-w-[900px]">
        <div className="public-eyebrow text-neutral-500 mb-4">Actus</div>
        <h1 className="public-serif text-6xl lg:text-8xl mb-10 text-neutral-950 leading-none">Nos<br /><span className="italic text-[#D4AF37]">actualités.</span></h1>
        <p className="text-neutral-600 mb-12">Restez au courant des dernières sorties, projets, castings et opportunités.</p>
        <form onSubmit={submit} className="border border-neutral-200 rounded-lg p-8">
          <div className="public-eyebrow text-neutral-500 mb-3">Newsletter</div>
          <div className="flex flex-col md:flex-row gap-3">
            <input type="email" required data-testid="newsletter-email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="votre@email.com" className="flex-1 px-4 py-3 border border-neutral-300 rounded-md bg-white text-neutral-950" />
            <button data-testid="newsletter-submit" disabled={loading} className="px-6 py-3 rounded-full bg-neutral-950 hover:bg-neutral-800 text-white public-eyebrow transition-colors">{loading ? "…" : "S'inscrire"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
