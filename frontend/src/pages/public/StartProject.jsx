import React, { useState } from "react";
import api, { formatApiError } from "../../lib/api";
import { toast } from "sonner";

export default function StartProject() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", company: "", project_type: "music", objective: "", description: "", budget_range: "", timeline: "", location: "" });
  const [loading, setLoading] = useState(false);
  const upd = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/public/leads", form);
      toast.success("Merci ! Notre équipe revient vers vous sous 48h.");
      setForm({ name: "", email: "", phone: "", company: "", project_type: "music", objective: "", description: "", budget_range: "", timeline: "", location: "" });
    } catch (err) { toast.error(formatApiError(err.response?.data?.detail)); }
    finally { setLoading(false); }
  };
  return (
    <div className="pt-32 pb-24 px-6 lg:px-10 bg-white">
      <div className="mx-auto max-w-[1000px]">
        <div className="public-eyebrow text-neutral-500 mb-4">Start a project</div>
        <h1 className="public-serif text-6xl lg:text-8xl mb-10 text-neutral-950 leading-none">Racontez-nous<br /><span className="italic text-[#D4AF37]">votre idée.</span></h1>
        <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input required placeholder="Nom complet" data-testid="sp-name" value={form.name} onChange={upd("name")} className="px-4 py-3 border border-neutral-300 rounded-md" />
          <input required type="email" placeholder="Email" data-testid="sp-email" value={form.email} onChange={upd("email")} className="px-4 py-3 border border-neutral-300 rounded-md" />
          <input placeholder="Téléphone" data-testid="sp-phone" value={form.phone} onChange={upd("phone")} className="px-4 py-3 border border-neutral-300 rounded-md" />
          <input placeholder="Structure / label / marque" data-testid="sp-company" value={form.company} onChange={upd("company")} className="px-4 py-3 border border-neutral-300 rounded-md" />
          <select data-testid="sp-type" value={form.project_type} onChange={upd("project_type")} className="px-4 py-3 border border-neutral-300 rounded-md bg-white">
            <option value="music">Musique</option>
            <option value="video">Vidéo / clip</option>
            <option value="cinema">Cinéma / court métrage</option>
            <option value="documentary">Documentaire</option>
            <option value="brand">Campagne de marque</option>
            <option value="event">Événement</option>
            <option value="artist_development">Développement artiste</option>
            <option value="other">Autre</option>
          </select>
          <input placeholder="Budget" data-testid="sp-budget" value={form.budget_range} onChange={upd("budget_range")} className="px-4 py-3 border border-neutral-300 rounded-md" />
          <input placeholder="Timeline" data-testid="sp-timeline" value={form.timeline} onChange={upd("timeline")} className="px-4 py-3 border border-neutral-300 rounded-md" />
          <input placeholder="Lieu" data-testid="sp-location" value={form.location} onChange={upd("location")} className="px-4 py-3 border border-neutral-300 rounded-md" />
          <input placeholder="Objectif principal" data-testid="sp-objective" value={form.objective} onChange={upd("objective")} className="md:col-span-2 px-4 py-3 border border-neutral-300 rounded-md" />
          <textarea placeholder="Description du projet" data-testid="sp-description" value={form.description} onChange={upd("description")} rows={6} className="md:col-span-2 px-4 py-3 border border-neutral-300 rounded-md" />
          <button disabled={loading} data-testid="sp-submit" className="md:col-span-2 justify-self-start bg-neutral-950 hover:bg-neutral-800 text-white px-8 py-3 rounded-full public-eyebrow transition-colors">{loading ? "…" : "Envoyer le projet"}</button>
        </form>
      </div>
    </div>
  );
}
