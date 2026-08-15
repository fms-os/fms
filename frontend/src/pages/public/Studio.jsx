import React from "react";
import { Link } from "react-router-dom";
export default function Studio() {
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
        <div className="aspect-[4/3] rounded-lg overflow-hidden bg-neutral-100">
          <img src="https://images.unsplash.com/photo-1616588589676-62b3bd4ff6d2?w=1600&q=80" alt="Studio" className="w-full h-full object-cover" />
        </div>
      </div>
    </div>
  );
}
