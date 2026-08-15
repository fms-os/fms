import React, { useEffect, useState } from "react";
import api, { formatApiError } from "../../lib/api";
import { toast } from "sonner";

export default function News() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState(null);
  useEffect(() => { api.get("/public/news").then((r) => setItems(r.data || [])).catch(() => setItems([])); }, []);
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
      <div className="mx-auto max-w-[1100px]">
        <div className="public-eyebrow text-neutral-500 mb-4">Actus</div>
        <h1 className="public-serif text-6xl lg:text-8xl mb-10 text-neutral-950 leading-none">Nos<br /><span className="italic text-[#D4AF37]">actualités.</span></h1>

        {items === null && <div className="text-neutral-500">Chargement…</div>}
        {items && items.length === 0 && (
          <div data-testid="news-empty" className="border border-dashed border-neutral-300 rounded-lg p-12 bg-neutral-50/50 mb-12">
            <div className="public-serif text-2xl text-neutral-800 mb-2">Aucune actu publiée pour le moment.</div>
            <p className="text-neutral-600 text-sm">Inscrivez-vous à la newsletter pour recevoir nos prochaines annonces (sorties, castings, sessions ouvertes, opportunités).</p>
          </div>
        )}
        {items && items.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            {items.map((n) => (
              <article key={n.id} data-testid={`news-${n.id}`} className="border-t border-neutral-200 pt-6">
                {n.cover_url && <div className="aspect-[16/9] rounded-md overflow-hidden mb-4 bg-neutral-100"><img src={n.cover_url} alt={n.title} className="w-full h-full object-cover" /></div>}
                {n.publish_date && <div className="public-eyebrow text-neutral-500 mb-2">{new Date(n.publish_date).toLocaleDateString("fr-FR")}</div>}
                <h2 className="public-serif text-3xl text-neutral-950 mb-2">{n.title}</h2>
                {n.excerpt && <p className="text-neutral-600 text-sm leading-relaxed">{n.excerpt}</p>}
              </article>
            ))}
          </div>
        )}

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
