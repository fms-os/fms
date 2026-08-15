import React, { useEffect, useState } from "react";
import api, { formatApiError } from "../../lib/api";
import { toast } from "sonner";
import { Plus, X, Trash2 } from "lucide-react";

const VERIFICATION_OPTIONS = ["UNVERIFIED", "CONCEPT", "PLANNED", "IN_PROGRESS", "VERIFIED_CURRENT", "VERIFIED_COMPLETED", "VERIFIED_RELEASED"];

export default function OSNews() {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ verification_status: "UNVERIFIED", published: false });
  const [loading, setLoading] = useState(false);
  const load = () => api.get("/os/news").then((r) => setItems(r.data || [])).catch(() => {});
  useEffect(() => { load(); }, []);
  const upd = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/os/news", form);
      toast.success("Actu créée.");
      setForm({ verification_status: "UNVERIFIED", published: false });
      setOpen(false);
      load();
    } catch (err) { toast.error(formatApiError(err.response?.data?.detail)); }
    finally { setLoading(false); }
  };

  const patch = async (id, data) => {
    try { await api.patch(`/os/news/${id}`, data); toast.success("Mis à jour."); load(); }
    catch (e) { toast.error(formatApiError(e.response?.data?.detail)); }
  };

  const remove = async (id) => {
    if (!window.confirm("Supprimer cette actu ?")) return;
    try { await api.delete(`/os/news/${id}`); toast.success("Supprimé."); load(); }
    catch (e) { toast.error(formatApiError(e.response?.data?.detail)); }
  };

  return (
    <div className="space-y-5" data-testid="os-news-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Actus</h1>
          <p className="text-sm text-neutral-500 mt-1">Seules les actus <span className="os-mono">published=true</span> ET <span className="os-mono">verification_status ∈ VERIFIED_*</span> apparaissent sur le site.</p>
        </div>
        <button onClick={() => setOpen(!open)} data-testid="news-new-btn" className="inline-flex items-center gap-2 bg-neutral-900 hover:bg-neutral-800 text-white px-4 py-2 rounded-md text-sm transition-colors">
          {open ? <X size={14} /> : <Plus size={14} />} {open ? "Fermer" : "Nouvelle actu"}
        </button>
      </div>

      {open && (
        <form onSubmit={submit} className="os-card p-5 grid grid-cols-1 md:grid-cols-2 gap-3" data-testid="news-form">
          <div className="md:col-span-2">
            <label className="os-data-label block mb-1">Titre *</label>
            <input required data-testid="news-title" value={form.title || ""} onChange={upd("title")} className="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm" />
          </div>
          <div className="md:col-span-2">
            <label className="os-data-label block mb-1">Extrait</label>
            <textarea data-testid="news-excerpt" value={form.excerpt || ""} onChange={upd("excerpt")} rows={2} className="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm" />
          </div>
          <div className="md:col-span-2">
            <label className="os-data-label block mb-1">Corps</label>
            <textarea data-testid="news-body" value={form.body || ""} onChange={upd("body")} rows={5} className="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm" />
          </div>
          <div>
            <label className="os-data-label block mb-1">URL image</label>
            <input data-testid="news-cover" value={form.cover_url || ""} onChange={upd("cover_url")} className="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm" />
          </div>
          <div>
            <label className="os-data-label block mb-1">Date de publication</label>
            <input type="date" data-testid="news-date" value={form.publish_date || ""} onChange={upd("publish_date")} className="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm" />
          </div>
          <div>
            <label className="os-data-label block mb-1">Verification</label>
            <select data-testid="news-verification" value={form.verification_status} onChange={upd("verification_status")} className="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm bg-white os-mono">
              {VERIFICATION_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <button disabled={loading} type="submit" data-testid="news-submit" className="md:col-span-2 justify-self-start bg-[#A78BFA] hover:bg-[#8B5CF6] text-black px-6 py-2 rounded-md text-sm font-medium transition-colors">{loading ? "…" : "Créer"}</button>
        </form>
      )}

      <div className="os-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 border-b border-neutral-200">
            <tr>{["Titre","Date","Verification","Publié","Actions"].map((h) => <th key={h} className="text-left px-4 py-3 os-data-label">{h}</th>)}</tr>
          </thead>
          <tbody>
            {items.length === 0 && <tr><td colSpan={5} className="px-4 py-10 text-center text-neutral-400 text-sm">Aucune actu. Créez la première.</td></tr>}
            {items.map((n) => (
              <tr key={n.id} className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors">
                <td className="px-4 py-3">{n.title}</td>
                <td className="px-4 py-3 text-neutral-500">{n.publish_date || "—"}</td>
                <td className="px-4 py-3">
                  <select value={n.verification_status || "UNVERIFIED"} onChange={(e) => patch(n.id, { verification_status: e.target.value })} data-testid={`news-verify-${n.id}`} className="text-[11px] px-2 py-1 border border-neutral-300 rounded bg-white os-mono">
                    {VERIFICATION_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => patch(n.id, { published: !n.published })} data-testid={`news-publish-${n.id}`}
                    className={`text-[10px] uppercase tracking-wider px-2.5 py-1 rounded transition-colors ${n.published ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200" : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200"}`}>
                    {n.published ? "Publié" : "Privé"}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => remove(n.id)} data-testid={`news-delete-${n.id}`} className="text-neutral-400 hover:text-red-600 transition-colors"><Trash2 size={14} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
