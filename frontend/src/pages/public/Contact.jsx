import React, { useState } from "react";
import api, { formatApiError } from "../../lib/api";
import { toast } from "sonner";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [loading, setLoading] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/public/contact", form);
      toast.success("Message envoyé. Nous revenons vers vous rapidement.");
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch (err) { toast.error(formatApiError(err.response?.data?.detail)); }
    finally { setLoading(false); }
  };
  const upd = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  return (
    <div className="pt-32 pb-24 px-6 lg:px-10 bg-white">
      <div className="mx-auto max-w-[900px]">
        <div className="public-eyebrow text-neutral-500 mb-4">Contact</div>
        <h1 className="public-serif text-6xl lg:text-8xl mb-10 text-neutral-950 leading-none">Parlons<br /><span className="italic text-[#D4AF37]">de votre projet.</span></h1>
        <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input required placeholder="Nom" data-testid="contact-name" value={form.name} onChange={upd("name")} className="px-4 py-3 border border-neutral-300 rounded-md" />
          <input required type="email" placeholder="Email" data-testid="contact-email" value={form.email} onChange={upd("email")} className="px-4 py-3 border border-neutral-300 rounded-md" />
          <input placeholder="Sujet" data-testid="contact-subject" value={form.subject} onChange={upd("subject")} className="md:col-span-2 px-4 py-3 border border-neutral-300 rounded-md" />
          <textarea required placeholder="Message" data-testid="contact-message" value={form.message} onChange={upd("message")} rows={6} className="md:col-span-2 px-4 py-3 border border-neutral-300 rounded-md" />
          <button disabled={loading} data-testid="contact-submit" className="md:col-span-2 justify-self-start bg-neutral-950 hover:bg-neutral-800 text-white px-6 py-3 rounded-full public-eyebrow transition-colors">{loading ? "…" : "Envoyer le message"}</button>
        </form>
      </div>
    </div>
  );
}
