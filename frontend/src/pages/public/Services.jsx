import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../lib/api";
import { ArrowRight } from "lucide-react";

export default function Services() {
  const [services, setServices] = useState([]);
  useEffect(() => { api.get("/public/services").then((r) => setServices(r.data || [])).catch(() => {}); }, []);
  return (
    <div className="pt-32 pb-24 px-6 lg:px-10 bg-white">
      <div className="mx-auto max-w-[1400px]">
        <div className="public-eyebrow text-neutral-500 mb-4">Services</div>
        <h1 className="public-serif text-6xl lg:text-8xl mb-12 text-neutral-950 leading-none">Ce qu'on peut<br /><span className="italic text-[#D4AF37]">construire ensemble.</span></h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {services.length === 0 && <div className="text-neutral-500 col-span-2">Aucun service disponible pour le moment.</div>}
          {services.map((s) => (
            <div key={s.id} data-testid={`service-${s.id}`} className="border border-neutral-200 rounded-lg p-8 hover:border-neutral-950 transition-colors">
              <div className="public-eyebrow text-[#D4AF37] mb-3">{s.category}</div>
              <div className="public-serif text-3xl mb-3 text-neutral-950">{s.name}</div>
              <p className="text-neutral-600 mb-6 text-sm leading-relaxed">{s.description}</p>
              <div className="flex items-center justify-between text-sm text-neutral-500">
                <div>{s.price ? `À partir de ${s.price} ${s.currency}` : "Sur devis"}</div>
                <Link to="/start-project" className="inline-flex items-center gap-2 text-neutral-950 hover:gap-3 transition-all">Demander <ArrowRight size={14} /></Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
