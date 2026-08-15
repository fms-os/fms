import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../lib/api";
import { ArrowRight, ArrowUpRight, Music, Film, Camera, Sparkles, Globe2, Video, Play } from "lucide-react";

const EXPERTISES = [
  { icon: Music, title: "MUSIQUE", desc: "Production, enregistrement, mix, mastering.", to: "/services", img: "https://images.unsplash.com/photo-1616588589676-62b3bd4ff6d2?w=1200&q=80" },
  { icon: Film, title: "AUDIOVISUEL", desc: "Tournage cinéma, clips, montage, étalonnage.", to: "/services", img: "https://images.unsplash.com/photo-1607276159787-9ef4db5c0d0b?w=1200&q=80" },
  { icon: Camera, title: "PRODUCTION", desc: "Production exécutive, direction artistique, casting.", to: "/services", img: "https://images.unsplash.com/photo-1502085671122-2d218cd434e6?w=1200&q=80" },
  { icon: Sparkles, title: "ÉVÉNEMENTS", desc: "Concerts, showcases, festivals, expériences.", to: "/services", img: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1200&q=80" },
  { icon: Video, title: "A&R & DÉVELOPPEMENT", desc: "Détection, accompagnement, stratégie artistique.", to: "/services", img: "https://images.unsplash.com/photo-1506863530036-1efeddceb993?w=1200&q=80" },
  { icon: Globe2, title: "DISTRIBUTION", desc: "Distribution digitale, media & liens internationaux.", to: "/services", img: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1200&q=80" },
];

export default function Home() {
  const [cfg, setCfg] = useState(null);
  const [projects, setProjects] = useState([]);
  useEffect(() => {
    api.get("/public/site-config").then((r) => setCfg(r.data || {})).catch(() => setCfg({}));
    api.get("/public/projects").then((r) => setProjects(r.data || [])).catch(() => {});
  }, []);
  const c = cfg || {};
  const heroBg = c.hero_image_url || "https://images.unsplash.com/photo-1590201935557-4ede3174758f?w=2400&q=85";
  return (
    <div>
      {/* HERO */}
      <section
        className="relative min-h-[100vh] public-noise flex items-end pb-24 pt-32 overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.55) 60%, rgba(0,0,0,0.85) 100%), url(${heroBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="relative z-10 mx-auto max-w-[1400px] w-full px-6 lg:px-10">
          <div className="public-eyebrow text-white/80 mb-6" data-testid="hero-eyebrow">{c.hero_eyebrow || "Factory Maker Studio · Martinique"}</div>
          <h1 className="public-hero-title text-white max-w-5xl" data-testid="hero-title">
            {c.hero_title_line1 || "On construit la culture."}<br />
            <span className="text-[#D4AF37] italic">{c.hero_title_line2 || "On construit l'héritage."}</span>
          </h1>
          <p className="mt-8 text-lg text-white/80 max-w-2xl leading-relaxed">
            {c.hero_subtitle || "Studio de production musicale & audiovisuelle. Image cinéma, vision internationale. Ancré dans la Caraïbe, connecté au monde."}
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link to="/booking" data-testid="hero-cta-book" className="inline-flex items-center gap-2 bg-[#D4AF37] hover:bg-[#c19c2c] text-black px-7 py-3.5 rounded-full text-sm font-medium tracking-wide transition-colors">
              Réserver un studio <ArrowUpRight size={16} />
            </Link>
            <Link to="/start-project" data-testid="hero-cta-project" className="inline-flex items-center gap-2 border border-white/40 hover:border-white text-white px-7 py-3.5 rounded-full text-sm font-medium tracking-wide transition-colors">
              Démarrer un projet
            </Link>
          </div>
        </div>
      </section>

      {/* EXPERTISES */}
      <section className="bg-white py-24 lg:py-32 px-6 lg:px-10">
        <div className="mx-auto max-w-[1400px]">
          <div className="flex items-end justify-between mb-16 flex-wrap gap-4">
            <div>
              <div className="public-eyebrow text-neutral-500 mb-3">01 · Ce qu'on fait</div>
              <h2 className="public-serif text-5xl lg:text-7xl text-neutral-950">Nos expertises.</h2>
              <p className="text-sm text-neutral-500 mt-3">Illustration des catégories de service — pas des projets spécifiques.</p>
            </div>
            <Link to="/services" className="public-eyebrow text-neutral-950 inline-flex items-center gap-2 hover:gap-3 transition-all">
              Voir tous nos services <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {EXPERTISES.map((e) => {
              const Icon = e.icon;
              return (
                <Link
                  key={e.title}
                  to={e.to}
                  data-testid={`expertise-${e.title.toLowerCase().replace(/\s+/g, '-')}`}
                  className="group relative aspect-[4/5] overflow-hidden rounded-lg bg-neutral-100 block"
                >
                  <img src={e.img} alt={e.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                  <div className="relative h-full flex flex-col justify-end p-8 text-white">
                    <Icon size={24} className="text-[#D4AF37] mb-3" />
                    <div className="public-serif text-3xl mb-2">{e.title}</div>
                    <p className="text-sm text-white/80 mb-4">{e.desc}</p>
                    <div className="public-eyebrow inline-flex items-center gap-2 text-[#D4AF37] group-hover:gap-3 transition-all">
                      En savoir plus <ArrowRight size={12} />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ABOUT + optional REALIZATIONS (data-driven, honest empty state) */}
      <section className="bg-white py-24 lg:py-32 px-6 lg:px-10 border-t border-neutral-200">
        <div className="mx-auto max-w-[1400px] grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-4">
            <div className="public-eyebrow text-neutral-500 mb-3">02 · À propos</div>
            <h3 className="public-serif text-4xl lg:text-6xl text-neutral-950 leading-none">Plus qu'un studio,<br /><span className="italic text-[#D4AF37]">un écosystème.</span></h3>
            <p className="mt-6 text-neutral-600 leading-relaxed whitespace-pre-line">
              {c.about_body ? c.about_body.split("\n\n")[0] : "Factory Maker Studio est né à Fort-de-France, en Martinique. Créé en 2022, le studio fait partie de l'écosystème CVLN."}
            </p>
            <Link to="/about" data-testid="about-cta" className="mt-8 inline-flex items-center gap-2 border border-neutral-900 hover:bg-neutral-900 hover:text-white px-6 py-3 rounded-full public-eyebrow transition-colors">
              Découvrir notre histoire <ArrowRight size={14} />
            </Link>
          </div>
          <div className="lg:col-span-8">
            <div className="flex items-center justify-between mb-6">
              <div className="public-eyebrow text-neutral-500">Réalisations vérifiées</div>
              {projects.length > 0 && <Link to="/projects" className="public-eyebrow hover:underline">Voir tout →</Link>}
            </div>
            {projects.length === 0 ? (
              <div data-testid="realizations-empty" className="border border-dashed border-neutral-300 rounded-lg p-12 text-center bg-neutral-50/50">
                <div className="public-serif text-2xl text-neutral-800 mb-2">Portfolio en construction.</div>
                <p className="text-sm text-neutral-500 max-w-md mx-auto">Aucune réalisation vérifiée publiée pour le moment. Nous préférons construire des œuvres solides plutôt que remplir un site avec des visuels génériques.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {projects.slice(0, 4).map((p) => (
                  <div key={p.id} className="group cursor-pointer">
                    <div className="relative aspect-[4/3] overflow-hidden rounded-md bg-neutral-100">
                      {p.cover_url ? <img src={p.cover_url} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" /> : <div className="w-full h-full bg-neutral-200" />}
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
                      {p.external_url && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center"><Play size={18} className="ml-0.5 text-neutral-950" fill="currentColor" /></div>
                        </div>
                      )}
                    </div>
                    <div className="mt-3">
                      <div className="text-sm font-medium text-neutral-950 uppercase tracking-wide">{p.name}</div>
                      <div className="text-xs text-neutral-500">{[p.role, p.year].filter(Boolean).join(" · ") || p.type}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* FINAL CTA — no invented stats */}
      <section className="public-prismatic px-6 lg:px-10 py-20">
        <div className="mx-auto max-w-[1400px] flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="text-white">
            <div className="public-eyebrow text-white/90 mb-3">Vous avez un projet ?</div>
            <div className="public-serif text-4xl lg:text-6xl leading-none">Parlons-en. On construit<br /><span className="italic">quelque chose.</span></div>
          </div>
          <div className="flex gap-3">
            <Link to="/start-project" data-testid="prismatic-cta" className="inline-flex items-center gap-2 bg-white text-neutral-950 px-6 py-3 rounded-full public-eyebrow hover:bg-neutral-100 transition-colors">Démarrer un projet <ArrowUpRight size={14} /></Link>
            <Link to="/booking" className="inline-flex items-center gap-2 border border-white/70 text-white px-6 py-3 rounded-full public-eyebrow hover:bg-white/10 transition-colors">Réserver le studio</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
