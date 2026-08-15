import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../lib/api";
import { Play, ArrowUpRight } from "lucide-react";

export default function Projects() {
  const [items, setItems] = useState(null);
  useEffect(() => { api.get("/public/projects").then((r) => setItems(r.data || [])).catch(() => setItems([])); }, []);
  return (
    <div className="pt-32 pb-24 px-6 lg:px-10 bg-white">
      <div className="mx-auto max-w-[1400px]">
        <div className="public-eyebrow text-neutral-500 mb-4">Réalisations</div>
        <h1 className="public-serif text-6xl lg:text-8xl mb-10 text-neutral-950 leading-none">Nos<br /><span className="italic text-[#D4AF37]">réalisations vérifiées.</span></h1>
        {items === null && <div className="text-neutral-500">Chargement…</div>}
        {items && items.length === 0 && (
          <div data-testid="projects-empty" className="border border-dashed border-neutral-300 rounded-lg p-16 bg-neutral-50/50 max-w-3xl">
            <div className="public-serif text-3xl text-neutral-800 mb-3">Portfolio en construction.</div>
            <p className="text-neutral-600 leading-relaxed mb-6">
              Nous choisissons de ne rien afficher tant que nos réalisations ne sont pas vérifiées et publiées explicitement.
              Pour découvrir notre travail en avant-première ou discuter d'une collaboration, contactez-nous directement.
            </p>
            <Link to="/contact" className="inline-flex items-center gap-2 bg-neutral-950 text-white px-6 py-3 rounded-full public-eyebrow hover:bg-neutral-800 transition-colors">Nous contacter <ArrowUpRight size={14} /></Link>
          </div>
        )}
        {items && items.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((p) => (
              <a key={p.id} href={p.external_url || "#"} target={p.external_url ? "_blank" : "_self"} rel="noreferrer" data-testid={`project-${p.id}`} className="group block">
                <div className="relative aspect-[4/3] rounded-md overflow-hidden bg-neutral-100">
                  {p.cover_url ? <img src={p.cover_url} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" /> : <div className="w-full h-full bg-neutral-200" />}
                  {p.external_url && (<div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors"><div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center"><Play size={16} className="ml-0.5" fill="currentColor" /></div></div>)}
                </div>
                <div className="mt-3">
                  <div className="text-sm font-medium uppercase tracking-wide text-neutral-950">{p.name}</div>
                  <div className="text-xs text-neutral-500">{[p.role, p.year, p.type].filter(Boolean).join(" · ")}</div>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
