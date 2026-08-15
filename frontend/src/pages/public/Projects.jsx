import React from "react";
export default function Projects() {
  return (
    <div className="pt-32 pb-24 px-6 lg:px-10 bg-white">
      <div className="mx-auto max-w-[1400px]">
        <div className="public-eyebrow text-neutral-500 mb-4">Réalisations</div>
        <h1 className="public-serif text-6xl lg:text-8xl mb-10 text-neutral-950 leading-none">Une sélection<br /><span className="italic text-[#D4AF37]">de nos œuvres.</span></h1>
        <p className="text-neutral-600 max-w-2xl mb-16">Nos projets publics arrivent bientôt. Pour découvrir notre travail en avant-première ou discuter d'une collaboration, contactez-nous directement.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1200&q=80",
            "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200&q=80",
            "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=1200&q=80",
            "https://images.unsplash.com/photo-1533488069324-2836ad6f4a68?w=1200&q=80",
            "https://images.unsplash.com/photo-1502085671122-2d218cd434e6?w=1200&q=80",
            "https://images.unsplash.com/photo-1607276159787-9ef4db5c0d0b?w=1200&q=80",
          ].map((src, i) => (
            <div key={i} className="aspect-[4/3] rounded-md overflow-hidden bg-neutral-100">
              <img src={src} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
