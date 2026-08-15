import React, { useEffect, useState } from "react";
import api from "../../lib/api";
import { Link } from "react-router-dom";
export default function Artists() {
  const [items, setItems] = useState(null);
  useEffect(() => { api.get("/public/artists").then((r) => setItems(r.data || [])).catch(() => setItems([])); }, []);
  return (
    <div className="pt-32 pb-24 px-6 lg:px-10 bg-white">
      <div className="mx-auto max-w-[1400px]">
        <div className="public-eyebrow text-neutral-500 mb-4">Artistes</div>
        <h1 className="public-serif text-6xl lg:text-8xl mb-10 text-neutral-950 leading-none">Les voix<br /><span className="italic text-[#D4AF37]">qu'on accompagne.</span></h1>
        {items === null && <div className="text-neutral-500">Chargement…</div>}
        {items && items.length === 0 && (
          <div data-testid="artists-empty" className="border border-dashed border-neutral-300 rounded-lg p-16 bg-neutral-50/50 max-w-3xl">
            <div className="public-serif text-3xl text-neutral-800 mb-3">Roster en construction.</div>
            <p className="text-neutral-600 leading-relaxed mb-6">Nous annonçons nos artistes au fur et à mesure des signatures et projets vérifiés. Rien de spéculatif ne sera affiché ici.</p>
            <Link to="/contact" className="inline-flex items-center gap-2 border border-neutral-950 text-neutral-950 px-6 py-3 rounded-full public-eyebrow hover:bg-neutral-950 hover:text-white transition-colors">Contact A&R</Link>
          </div>
        )}
        {items && items.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {items.map((a) => (
              <div key={a.id} data-testid={`artist-${a.id}`} className="group">
                <div className="aspect-square rounded-md overflow-hidden bg-neutral-100">
                  {a.avatar_url ? <img src={a.avatar_url} alt={a.stage_name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" /> : <div className="w-full h-full bg-gradient-to-br from-neutral-200 to-neutral-300" />}
                </div>
                <div className="mt-3">
                  <div className="public-serif text-2xl text-neutral-950">{a.stage_name}</div>
                  <div className="text-xs text-neutral-500 mt-1 uppercase tracking-wider">{[a.genre, a.territory].filter(Boolean).join(" · ")}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
