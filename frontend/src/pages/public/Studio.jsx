import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../lib/api";
export default function Studio() {
  const [cfg, setCfg] = useState({});
  useEffect(() => { api.get("/public/site-config").then((r) => setCfg(r.data || {})); }, []);
  return (
    <div className="pt-32 pb-24 px-6 lg:px-10 bg-white">
      <div className="mx-auto max-w-[1400px] grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div>
          <div className="public-eyebrow text-neutral-500 mb-4">Studio</div>
          <h1 className="public-serif text-5xl lg:text-7xl mb-8 text-neutral-950 leading-none">Notre studio,<br /><span className="italic text-[#D4AF37]">votre laboratoire.</span></h1>
          <p className="text-neutral-700 leading-relaxed mb-6">Situé au cœur de Fort-de-France, le studio Factory Maker est équipé pour l'enregistrement musical, la production vidéo, la post-production, le mix et le mastering aux standards internationaux.</p>
          <p className="text-neutral-600 text-sm mb-8">12/14 avenue les Tridents · Bâtiment C · Local 12 · 97200 Fort-de-France</p>
          <Link to="/booking" className="inline-flex items-center gap-2 bg-[#D4AF37] hover:bg-[#c19c2c] text-black px-6 py-3 rounded-full public-eyebrow transition-colors">Réserver le studio</Link>
        </div>
        {cfg.studio_photo_url ? (
          <div>
            <div className="aspect-[4/3] rounded-lg overflow-hidden bg-neutral-100">
              <img src={cfg.studio_photo_url} alt={cfg.studio_photo_caption || "Studio FMS"} className="w-full h-full object-cover" />
            </div>
            {cfg.studio_photo_caption && <div className="text-xs text-neutral-500 mt-2 uppercase tracking-wider">{cfg.studio_photo_caption}</div>}
          </div>
        ) : (
          <div className="aspect-[4/3] rounded-lg border border-dashed border-neutral-300 bg-neutral-50 flex items-center justify-center">
            <div className="text-center px-6">
              <div className="public-serif text-2xl text-neutral-800 mb-2">Photo à venir.</div>
              <p className="text-sm text-neutral-500">Nous n'affichons pas de photo générique. Les images réelles du studio arriveront prochainement.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
