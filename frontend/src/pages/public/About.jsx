import React, { useEffect, useState } from "react";
import api from "../../lib/api";
export default function About() {
  const [cfg, setCfg] = useState({});
  useEffect(() => { api.get("/public/site-config").then((r) => setCfg(r.data || {})); }, []);
  return (
    <div className="pt-32 pb-24 px-6 lg:px-10 bg-white">
      <div className="mx-auto max-w-[1000px]">
        <div className="public-eyebrow text-neutral-500 mb-4">À propos</div>
        <h1 className="public-serif text-6xl lg:text-8xl mb-10 leading-none text-neutral-950">{cfg.about_headline?.split(",")[0] || "Une maison créative"},<br /><span className="italic text-[#D4AF37]">{cfg.about_headline?.split(",")[1]?.trim() || "caribéenne, internationale."}</span></h1>
        <div className="text-lg text-neutral-700 leading-relaxed space-y-6 whitespace-pre-line">
          {cfg.about_body || "Factory Maker Studio est né à Fort-de-France, en Martinique. Créé en 2022, le studio fait partie de l'écosystème CVLN."}
        </div>
        {cfg.partners_line && (
          <div className="mt-12 pt-8 border-t border-neutral-200">
            <div className="public-eyebrow text-neutral-500 mb-3">Partenaires</div>
            <p className="text-neutral-600">{cfg.partners_line}</p>
          </div>
        )}
      </div>
    </div>
  );
}
