import React, { useState, useEffect } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { Menu, X, ArrowUpRight, Instagram, Youtube } from "lucide-react";

const NAV = [
  { to: "/", label: "Accueil" },
  { to: "/about", label: "À propos" },
  { to: "/services", label: "Services" },
  { to: "/projects", label: "Réalisations" },
  { to: "/artists", label: "Artistes" },
  { to: "/studio", label: "Studio" },
  { to: "/news", label: "Actus" },
  { to: "/contact", label: "Contact" },
];

function Nav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { pathname } = useLocation();
  const isHome = pathname === "/";
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const dark = isHome && !scrolled;
  return (
    <header
      data-testid="public-nav"
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${
        dark ? "bg-transparent" : "bg-white/85 backdrop-blur-xl border-b border-neutral-200"
      }`}
    >
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10 h-20 flex items-center justify-between">
        <Link to="/" data-testid="public-logo" className="flex flex-col leading-tight">
          <span className={`public-serif text-2xl ${dark ? "text-white" : "text-neutral-950"}`}>FMS</span>
          <span className={`public-eyebrow ${dark ? "text-white/70" : "text-neutral-500"}`}>Factory Maker Studio</span>
        </Link>
        <nav className="hidden lg:flex items-center gap-8">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              data-testid={`nav-${n.label.toLowerCase()}`}
              className={({ isActive }) =>
                `public-eyebrow transition-colors ${
                  dark
                    ? isActive ? "text-white" : "text-white/60 hover:text-white"
                    : isActive ? "text-neutral-950" : "text-neutral-500 hover:text-neutral-950"
                }`
              }
            >
              {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Link
            to="/booking"
            data-testid="cta-book-studio"
            className="hidden md:inline-flex items-center gap-2 bg-[#D4AF37] hover:bg-[#c19c2c] text-black px-5 py-2.5 rounded-full text-sm font-medium transition-colors"
          >
            Réserver un studio <ArrowUpRight size={16} />
          </Link>
          <button
            className={`lg:hidden ${dark ? "text-white" : "text-neutral-950"}`}
            onClick={() => setOpen(!open)}
            data-testid="nav-mobile-toggle"
            aria-label="Menu"
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>
      {open && (
        <div className="lg:hidden bg-white border-t border-neutral-200 px-6 py-4">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              onClick={() => setOpen(false)}
              className="block py-3 public-eyebrow text-neutral-800"
            >
              {n.label}
            </NavLink>
          ))}
          <Link to="/booking" onClick={() => setOpen(false)} className="mt-3 block bg-[#D4AF37] text-black text-center py-3 rounded-full">
            Réserver un studio
          </Link>
        </div>
      )}
    </header>
  );
}

function Footer() {
  return (
    <footer className="bg-neutral-950 text-white pt-24 pb-10 px-6 lg:px-10">
      <div className="mx-auto max-w-[1400px]">
        <div className="public-serif text-6xl md:text-8xl mb-14 leading-none">
          On construit<br /><span className="text-[#D4AF37] italic">la culture.</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 pb-12 border-b border-white/10">
          <div>
            <div className="public-eyebrow text-white/50 mb-4">Studio</div>
            <ul className="space-y-2 text-sm text-white/80">
              <li><Link to="/studio">Studio A</Link></li>
              <li><Link to="/booking">Réserver</Link></li>
              <li><Link to="/services">Services</Link></li>
            </ul>
          </div>
          <div>
            <div className="public-eyebrow text-white/50 mb-4">Découvrir</div>
            <ul className="space-y-2 text-sm text-white/80">
              <li><Link to="/projects">Réalisations</Link></li>
              <li><Link to="/artists">Artistes</Link></li>
              <li><Link to="/news">Actus</Link></li>
            </ul>
          </div>
          <div>
            <div className="public-eyebrow text-white/50 mb-4">Studio</div>
            <ul className="space-y-2 text-sm text-white/80">
              <li>12/14 avenue les Tridents</li>
              <li>Bâtiment C — Local 12</li>
              <li>97200 Fort-de-France</li>
              <li>Martinique</li>
            </ul>
          </div>
          <div>
            <div className="public-eyebrow text-white/50 mb-4">Écosystème</div>
            <ul className="space-y-2 text-sm text-white/80">
              <li>Partie du groupe CVLN</li>
              <li><Link to="/contact">Contact</Link></li>
              <li><a href="/os/login" data-testid="footer-os-login">FMS OS</a></li>
            </ul>
          </div>
        </div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center pt-8 gap-4">
          <div className="text-xs text-white/50">© 2026 Factory Maker Studio. Tous droits réservés.</div>
          <div className="flex gap-4 text-white/70">
            <a href="https://instagram.com" target="_blank" rel="noreferrer"><Instagram size={18} /></a>
            <a href="https://youtube.com" target="_blank" rel="noreferrer"><Youtube size={18} /></a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function PublicLayout() {
  return (
    <div className="public-shell min-h-screen">
      <Nav />
      <main className="pt-0"><Outlet /></main>
      <Footer />
    </div>
  );
}
