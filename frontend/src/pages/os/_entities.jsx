import React, { useEffect, useState } from "react";
import api, { formatApiError } from "../../lib/api";
import { toast } from "sonner";
import { Plus, X } from "lucide-react";

const VERIFICATION_OPTIONS = ["UNVERIFIED", "CONCEPT", "PLANNED", "IN_PROGRESS", "VERIFIED_CURRENT", "VERIFIED_COMPLETED", "VERIFIED_RELEASED"];

function PublishControls({ row, endpoint, reload }) {
  const [pub, setPub] = useState(!!row.public);
  const [status, setStatus] = useState(row.verification_status || "UNVERIFIED");
  const [saving, setSaving] = useState(false);
  const patch = async (data) => {
    setSaving(true);
    try {
      await api.patch(`${endpoint}/${row.id}`, data);
      toast.success("Mis à jour.");
      reload();
    } catch (e) { toast.error(formatApiError(e.response?.data?.detail)); }
    finally { setSaving(false); }
  };
  return (
    <div className="flex items-center gap-2">
      <select value={status} disabled={saving} data-testid={`row-verify-${row.id}`}
        onChange={(e) => { setStatus(e.target.value); patch({ verification_status: e.target.value }); }}
        className="text-[11px] px-2 py-1 border border-neutral-300 rounded bg-white os-mono">
        {VERIFICATION_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
      </select>
      <button onClick={() => { const v = !pub; setPub(v); patch({ public: v }); }} disabled={saving}
        data-testid={`row-publish-${row.id}`}
        className={`text-[10px] uppercase tracking-wider px-2.5 py-1 rounded transition-colors ${pub ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200" : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200"}`}>
        {pub ? "Publié" : "Privé"}
      </button>
    </div>
  );
}

function EntityPage({ title, endpoint, columns, fields, testKey, extraColumns }) {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(false);
  const load = () => api.get(endpoint).then((r) => setItems(r.data || [])).catch(() => {});
  useEffect(() => { load(); }, []);
  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try { await api.post(endpoint, form); toast.success("Créé."); setForm({}); setOpen(false); load(); }
    catch (err) { toast.error(formatApiError(err.response?.data?.detail)); }
    finally { setLoading(false); }
  };
  return (
    <div className="space-y-5" data-testid={`os-${testKey}-page`}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
          <p className="text-sm text-neutral-500 mt-1">{items.length} enregistrement{items.length > 1 ? "s" : ""}</p>
        </div>
        <button onClick={() => setOpen(!open)} data-testid={`${testKey}-new-btn`} className="inline-flex items-center gap-2 bg-neutral-900 hover:bg-neutral-800 text-white px-4 py-2 rounded-md text-sm transition-colors">
          {open ? <X size={14} /> : <Plus size={14} />} {open ? "Fermer" : "Nouveau"}
        </button>
      </div>

      {open && (
        <form onSubmit={submit} className="os-card p-5 grid grid-cols-1 md:grid-cols-2 gap-3" data-testid={`${testKey}-form`}>
          {fields.map((f) => {
            const val = form[f.key] ?? "";
            const upd = (e) => setForm({ ...form, [f.key]: e.target.value });
            if (f.type === "select") return (
              <div key={f.key}>
                <label className="os-data-label block mb-1">{f.label}{f.required && " *"}</label>
                <select required={f.required} data-testid={`${testKey}-${f.key}`} value={val} onChange={upd} className="w-full px-3 py-2 border border-neutral-300 rounded-md bg-white text-sm">
                  <option value="">—</option>
                  {f.options.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            );
            if (f.type === "textarea") return (
              <div key={f.key} className="md:col-span-2">
                <label className="os-data-label block mb-1">{f.label}</label>
                <textarea data-testid={`${testKey}-${f.key}`} value={val} onChange={upd} rows={3} className="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm" />
              </div>
            );
            return (
              <div key={f.key}>
                <label className="os-data-label block mb-1">{f.label}{f.required && " *"}</label>
                <input required={f.required} type={f.type || "text"} data-testid={`${testKey}-${f.key}`} value={val} onChange={upd} className="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm" />
              </div>
            );
          })}
          <button disabled={loading} type="submit" data-testid={`${testKey}-submit`} className="md:col-span-2 justify-self-start bg-[#A78BFA] hover:bg-[#8B5CF6] text-black px-6 py-2 rounded-md text-sm font-medium transition-colors">{loading ? "…" : "Créer"}</button>
        </form>
      )}

      <div className="os-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 border-b border-neutral-200">
            <tr>
              {columns.map((c) => <th key={c.key} className="text-left px-4 py-3 os-data-label">{c.label}</th>)}
              {extraColumns?.map((c, i) => <th key={`ex-${i}`} className="text-left px-4 py-3 os-data-label">{c.label}</th>)}
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && (
              <tr><td colSpan={columns.length + (extraColumns?.length || 0)} className="px-4 py-10 text-center text-neutral-400 text-sm">Aucune donnée. Créez le premier enregistrement.</td></tr>
            )}
            {items.map((it) => (
              <tr key={it.id} className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors">
                {columns.map((c) => <td key={c.key} className="px-4 py-3 text-neutral-800">{c.render ? c.render(it) : (it[c.key] ?? "—")}</td>)}
                {extraColumns?.map((c, i) => <td key={`ex-${i}`} className="px-4 py-3">{c.render(it, load)}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function Projects() {
  return <EntityPage title="Projets" endpoint="/os/projects" testKey="projects"
    columns={[
      { key: "name", label: "Nom" },
      { key: "type", label: "Type" },
      { key: "year", label: "Année" },
      { key: "role", label: "Rôle FMS" },
      { key: "status", label: "Statut" },
      { key: "deadline", label: "Deadline" },
    ]}
    extraColumns={[
      { label: "Publication", render: (row, reload) => <PublishControls row={row} endpoint="/os/projects" reload={reload} /> },
    ]}
    fields={[
      { key: "name", label: "Nom du projet", required: true },
      { key: "type", label: "Type", type: "select", options: ["music", "video", "photo", "campaign", "event", "brand", "artist_development", "release", "documentary", "other"] },
      { key: "year", label: "Année", type: "number" },
      { key: "role", label: "Rôle FMS (ex: production, mix, video)" },
      { key: "status", label: "Statut interne", type: "select", options: ["idea", "brief", "scoping", "quote", "approval", "scheduled", "production", "post_production", "review", "final", "delivery", "archived"] },
      { key: "verification_status", label: "Verification", type: "select", options: VERIFICATION_OPTIONS },
      { key: "start_date", label: "Début", type: "date" },
      { key: "deadline", label: "Deadline", type: "date" },
      { key: "budget", label: "Budget (€)", type: "number" },
      { key: "cover_url", label: "URL image de couverture" },
      { key: "external_url", label: "Lien externe (YouTube, etc.)" },
      { key: "description", label: "Description", type: "textarea" },
    ]}
  />;
}

export function Artists() {
  return <EntityPage title="Artistes" endpoint="/os/artists" testKey="artists"
    columns={[
      { key: "stage_name", label: "Nom de scène" },
      { key: "genre", label: "Genre" },
      { key: "territory", label: "Territoire" },
      { key: "status", label: "Stade A&R" },
    ]}
    extraColumns={[
      { label: "Publication", render: (row, reload) => <PublishControls row={row} endpoint="/os/artists" reload={reload} /> },
    ]}
    fields={[
      { key: "stage_name", label: "Nom de scène", required: true },
      { key: "genre", label: "Genre" },
      { key: "territory", label: "Territoire" },
      { key: "email", label: "Email", type: "email" },
      { key: "phone", label: "Téléphone" },
      { key: "status", label: "Stade A&R", type: "select", options: ["discovery", "contact", "evaluation", "development", "production", "release", "growth", "international"] },
      { key: "verification_status", label: "Verification", type: "select", options: VERIFICATION_OPTIONS },
      { key: "avatar_url", label: "URL avatar" },
      { key: "spotify_url", label: "Spotify" },
      { key: "instagram_url", label: "Instagram" },
      { key: "youtube_url", label: "YouTube" },
      { key: "bio", label: "Bio", type: "textarea" },
    ]}
  />;
}

export function Clients() {
  return <EntityPage title="Clients" endpoint="/os/clients" testKey="clients"
    columns={[
      { key: "name", label: "Nom" },
      { key: "email", label: "Email" },
      { key: "company", label: "Structure" },
      { key: "status", label: "Statut" },
    ]}
    fields={[
      { key: "name", label: "Nom", required: true },
      { key: "email", label: "Email", type: "email", required: true },
      { key: "phone", label: "Téléphone" },
      { key: "company", label: "Structure / label / marque" },
      { key: "type", label: "Type", type: "select", options: ["individual", "brand", "label", "institution", "artist"] },
      { key: "status", label: "Statut", type: "select", options: ["lead", "qualified", "prospect", "client", "repeat_client", "vip"] },
    ]}
  />;
}

export function Bookings() {
  return <EntityPage title="Studio & Booking" endpoint="/os/bookings" testKey="bookings"
    columns={[
      { key: "service_name", label: "Service" },
      { key: "client_name", label: "Client" },
      { key: "date", label: "Date" },
      { key: "start_time", label: "Début" },
      { key: "end_time", label: "Fin" },
      { key: "status", label: "Statut" },
    ]}
    fields={[
      { key: "service_name", label: "Service", required: true },
      { key: "client_name", label: "Nom client" },
      { key: "client_email", label: "Email client", type: "email" },
      { key: "date", label: "Date", type: "date", required: true },
      { key: "start_time", label: "Heure début", type: "time", required: true },
      { key: "end_time", label: "Heure fin", type: "time", required: true },
      { key: "location", label: "Lieu" },
      { key: "price", label: "Prix (€)", type: "number" },
      { key: "notes", label: "Notes", type: "textarea" },
    ]}
  />;
}

export function AR() {
  const [artists, setArtists] = useState([]);
  useEffect(() => { api.get("/os/artists").then((r) => setArtists(r.data || [])); }, []);
  const stages = ["discovery", "contact", "evaluation", "development", "production", "release", "growth", "international"];
  return (
    <div className="space-y-5" data-testid="os-ar-page">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">A&R Pipeline</h1>
        <p className="text-sm text-neutral-500 mt-1">Cycle de développement artistique</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 overflow-x-auto">
        {stages.map((s) => {
          const list = artists.filter((a) => a.status === s);
          return (
            <div key={s} className="os-card p-3 min-h-[200px]">
              <div className="os-data-label mb-3 flex items-center justify-between">
                <span>{s}</span>
                <span className="text-neutral-400">{list.length}</span>
              </div>
              <div className="space-y-2">
                {list.map((a) => (
                  <div key={a.id} className="p-2 rounded-md border border-neutral-200 hover:border-[#A78BFA] transition-colors bg-white">
                    <div className="text-sm font-medium text-neutral-900 truncate">{a.stage_name}</div>
                    <div className="text-[10px] text-neutral-500 uppercase tracking-wider">{a.genre || "—"}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      {artists.length === 0 && <div className="text-sm text-neutral-500">Aucun artiste. Ajoutez-en depuis la page Artistes.</div>}
    </div>
  );
}

export function Leads() {
  const [items, setItems] = useState([]);
  useEffect(() => { api.get("/os/leads").then((r) => setItems(r.data || [])); }, []);
  return (
    <div className="space-y-5" data-testid="os-leads-page">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Leads</h1>
        <p className="text-sm text-neutral-500 mt-1">{items.length} lead{items.length > 1 ? "s" : ""} en attente de qualification</p>
      </div>
      <div className="os-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 border-b border-neutral-200">
            <tr>{["Nom", "Email", "Type", "Budget", "Source", "Reçu le"].map((h) => <th key={h} className="text-left px-4 py-3 os-data-label">{h}</th>)}</tr>
          </thead>
          <tbody>
            {items.length === 0 && <tr><td colSpan={6} className="px-4 py-10 text-center text-neutral-400">Aucun lead pour le moment.</td></tr>}
            {items.map((l) => (
              <tr key={l.id} className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors">
                <td className="px-4 py-3">{l.name}</td>
                <td className="px-4 py-3 text-neutral-600">{l.email}</td>
                <td className="px-4 py-3">{l.project_type || "—"}</td>
                <td className="px-4 py-3">{l.budget_range || "—"}</td>
                <td className="px-4 py-3 os-mono text-xs">{l.source}</td>
                <td className="px-4 py-3 text-neutral-500 text-xs">{new Date(l.created_at).toLocaleDateString("fr-FR")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function Integrations() {
  const [items, setItems] = useState([]);
  useEffect(() => { api.get("/os/integrations").then((r) => setItems(r.data || [])); }, []);
  return (
    <div className="space-y-5" data-testid="os-integrations-page">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Intégrations</h1>
        <p className="text-sm text-neutral-500 mt-1">Écosystème CVLN — adapters préparés, connexions à venir</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((i) => (
          <div key={i.key} data-testid={`integration-card-${i.key}`} className="os-card p-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="text-lg font-semibold text-neutral-900">{i.label}</div>
                <div className="os-data-label text-neutral-500">{i.category} · {i.owner}</div>
              </div>
              <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-[10px] uppercase tracking-wider ${i.status === "CONNECTED" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${i.status === "CONNECTED" ? "bg-emerald-500" : "bg-amber-500"}`} />
                {i.status}
              </span>
            </div>
            <div className="space-y-2 text-sm">
              <div><span className="os-data-label">Responsabilité</span><p className="text-neutral-700 mt-1">{i.responsibility}</p></div>
              <div><span className="os-data-label">Rôle Factory</span><p className="text-neutral-700 mt-1">{i.factory_responsibility}</p></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function Settings() {
  return (
    <div className="space-y-5" data-testid="os-settings-page">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Paramètres</h1>
        <p className="text-sm text-neutral-500 mt-1">Configuration de l'espace Factory Maker Studio</p>
      </div>
      <div className="os-card p-6">
        <div className="os-data-label mb-3">Organisation</div>
        <div className="text-sm text-neutral-700 space-y-1">
          <div><strong className="font-medium">Nom</strong> · Factory Maker Studio</div>
          <div><strong className="font-medium">Ville</strong> · Fort-de-France, Martinique</div>
          <div><strong className="font-medium">Groupe</strong> · CVLN</div>
          <div><strong className="font-medium">Écosystème</strong> · FREKCORE · FREKANSLA · KORA · CVLN Wallet · CVL Brain · Laurentia · Frek-ID</div>
        </div>
      </div>
    </div>
  );
}
