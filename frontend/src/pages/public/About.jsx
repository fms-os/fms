import React from "react";
export default function About() {
  return (
    <div className="pt-32 pb-24 px-6 lg:px-10 bg-white">
      <div className="mx-auto max-w-[1000px]">
        <div className="public-eyebrow text-neutral-500 mb-4">À propos</div>
        <h1 className="public-serif text-6xl lg:text-8xl mb-10 leading-none text-neutral-950">Une maison créative<br /><span className="italic text-[#D4AF37]">caribéenne, internationale.</span></h1>
        <div className="text-lg text-neutral-700 leading-relaxed space-y-6">
          <p>Factory Maker Studio est né à Fort-de-France, en Martinique. Créé en 2022, le studio fait partie de l'écosystème CVLN — un groupe pensé pour structurer, protéger et faire rayonner les artistes et créateurs de la Caraïbe et de sa diaspora.</p>
          <p>Nous produisons de la musique, des clips, des films, des documentaires, des campagnes. Nous accompagnons des artistes. Nous formons. Nous exportons. Nous construisons une culture qui compte, avec une image cinéma et une vision internationale.</p>
          <p>Nos partenaires incluent des labels, des institutions culturelles, des marques et des écoles — pour développer les talents, protéger les droits, et professionnaliser la filière.</p>
        </div>
      </div>
    </div>
  );
}
