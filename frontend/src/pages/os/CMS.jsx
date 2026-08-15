import React, { useEffect, useState } from "react";
import api, { formatApiError } from "../../lib/api";
import { toast } from "sonner";
import { Save, ExternalLink } from "lucide-react";

const FIELDS = [
  { key: "hero_eyebrow", label: "Hero — sur-titre", type: "text" },
  { key: "hero_title_line1", label: "Hero — titre ligne 1", type: "text" },
  { key: "hero_title_line2", label: "Hero — titre ligne 2 (italique doré)", type: "text" },
  { key: "hero_subtitle", label: "Hero — sous-titre", type: "textarea" },
  { key: "hero_image_url", label: "Hero — URL image de fond", type: "text" },
  { key: "about_headline", label: "À propos — titre", type: "text" },
  { key: "about_body", label: "À propos — corps (double saut de ligne = paragraphe)", type: "textarea" },
  { key: "partners_line", label: "À propos — ligne partenaires (laisser vide tant que rien n'est confirmé)", type: "textarea" },
  { key: "studio_photo_url", label: "Studio — URL photo réelle", type: "text" },
  { key: "studio_photo_caption", label: "Studio — légende photo", type: "text" },
  { key: "footer_tagline", label: "Footer — tagline", type: "text" },
];

export default function CMS() {
  const [cfg, setCfg] = useState(null);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get("/os/site-config").then((r) => setCfg(r.data || {})).catch(() => setCfg({}));
  }, []);

  const upd = (k) => (e) => { setCfg({ ...cfg, [k]: e.target.value }); setDirty(true); };

  const save = async () => {
    setSaving(true);
    try {
      const { data } = await api.put("/os/site-config", cfg);
      setCfg(data);
      setDirty(false);
      toast.success("Site mis à jour.");
    } catch (e) { toast.error(formatApiError(e.response?.data?.detail)); }
    finally { setSaving(false); }
  };

  if (!cfg) return <div className="text-neutral-500 text-sm">Chargement…</div>;

  return (
    <div className="space-y-6" data-testid="os-cms-page">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">CMS — Site public</h1>
          <p className="text-sm text-neutral-500 mt-1">Contenu éditable du site vitrine. Toute modification est immédiate.</p>
        </div>
        <div className="flex items-center gap-3">
          <a href="/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900 transition-colors" data-testid="cms-preview">
            Aperçu du site <ExternalLink size={14} />
          </a>
          <button onClick={save} disabled={saving || !dirty} data-testid="cms-save"
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${dirty ? "bg-[#A78BFA] hover:bg-[#8B5CF6] text-black" : "bg-neutral-200 text-neutral-500"}`}>
            <Save size={14} /> {saving ? "…" : "Enregistrer"}
          </button>
        </div>
      </div>

      <div className="os-card p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        {FIELDS.map((f) => (
          <div key={f.key} className={f.type === "textarea" ? "md:col-span-2" : ""}>
            <label className="os-data-label block mb-1.5">{f.label}</label>
            {f.type === "textarea" ? (
              <textarea data-testid={`cms-${f.key}`} value={cfg[f.key] || ""} onChange={upd(f.key)} rows={4} className="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm bg-white" />
            ) : (
              <input type="text" data-testid={`cms-${f.key}`} value={cfg[f.key] || ""} onChange={upd(f.key)} className="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm bg-white" />
            )}
          </div>
        ))}
      </div>

      <div className="os-card p-5 border-l-4 border-amber-500">
        <div className="os-data-label mb-2 text-amber-700">Rappel — no fake data</div>
        <p className="text-sm text-neutral-700">
          Aucun champ ne doit contenir de chiffre inventé, de partenaire non confirmé, ou d'image générique présentée comme "notre studio" / "notre œuvre". Laissez vide plutôt que d'inventer — le site public sait afficher un état honnête (§ post-MVP reconciliation §5).
        </p>
      </div>
    </div>
  );
}
