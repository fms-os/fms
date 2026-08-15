import React, { useEffect, useState } from "react";
import api, { formatApiError } from "../../lib/api";
import { toast } from "sonner";

export default function Booking() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ service_name: "", client_name: "", client_email: "", date: "", start_time: "10:00", end_time: "14:00", notes: "" });
  useEffect(() => { api.get("/public/services").then((r) => setServices(r.data || [])); }, []);
  const upd = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/public/bookings/request", form);
      toast.success("Demande envoyée. Confirmation par email sous 24h.");
      setForm({ service_name: "", client_name: "", client_email: "", date: "", start_time: "10:00", end_time: "14:00", notes: "" });
    } catch (err) { toast.error(formatApiError(err.response?.data?.detail)); }
    finally { setLoading(false); }
  };
  return (
    <div className="pt-32 pb-24 px-6 lg:px-10 bg-white">
      <div className="mx-auto max-w-[900px]">
        <div className="public-eyebrow text-neutral-500 mb-4">Booking</div>
        <h1 className="public-serif text-6xl lg:text-8xl mb-10 text-neutral-950 leading-none">Réserver<br /><span className="italic text-[#D4AF37]">le studio.</span></h1>
        <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <select required data-testid="booking-service" value={form.service_name} onChange={upd("service_name")} className="md:col-span-2 px-4 py-3 border border-neutral-300 rounded-md bg-white">
            <option value="">Choisir un service</option>
            {services.map((s) => <option key={s.id} value={s.name}>{s.name}</option>)}
          </select>
          <input required placeholder="Nom complet" data-testid="booking-name" value={form.client_name} onChange={upd("client_name")} className="px-4 py-3 border border-neutral-300 rounded-md" />
          <input required type="email" placeholder="Email" data-testid="booking-email" value={form.client_email} onChange={upd("client_email")} className="px-4 py-3 border border-neutral-300 rounded-md" />
          <input required type="date" data-testid="booking-date" value={form.date} onChange={upd("date")} className="px-4 py-3 border border-neutral-300 rounded-md" />
          <div className="grid grid-cols-2 gap-3">
            <input required type="time" data-testid="booking-start" value={form.start_time} onChange={upd("start_time")} className="px-4 py-3 border border-neutral-300 rounded-md" />
            <input required type="time" data-testid="booking-end" value={form.end_time} onChange={upd("end_time")} className="px-4 py-3 border border-neutral-300 rounded-md" />
          </div>
          <textarea placeholder="Notes" data-testid="booking-notes" value={form.notes} onChange={upd("notes")} rows={4} className="md:col-span-2 px-4 py-3 border border-neutral-300 rounded-md" />
          <button disabled={loading} data-testid="booking-submit" className="md:col-span-2 justify-self-start bg-[#D4AF37] hover:bg-[#c19c2c] text-black px-6 py-3 rounded-full public-eyebrow transition-colors">{loading ? "…" : "Envoyer la demande"}</button>
        </form>
      </div>
    </div>
  );
}
