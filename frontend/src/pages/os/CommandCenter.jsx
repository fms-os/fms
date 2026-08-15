import React, { useEffect, useState } from "react";
import api from "../../lib/api";
import { AlertTriangle, TrendingUp, Info, Calendar, Briefcase, UserCircle, Users, Inbox } from "lucide-react";
import { Link } from "react-router-dom";

const KPI_ICONS = { projects_active: Briefcase, projects_total: Briefcase, artists_in_development: UserCircle, artists_total: UserCircle, clients_total: Users, leads_new: Inbox, bookings_upcoming: Calendar };
const KPI_LABELS = {
  revenue_mtd: "Revenu (MTD)",
  projects_active: "Projets actifs",
  bookings_upcoming: "Bookings à venir",
  artists_in_development: "Artistes en dev.",
  leads_new: "Nouveaux leads",
  clients_total: "Clients (total)",
  projects_total: "Projets (total)",
  artists_total: "Artistes (total)",
};

export default function CommandCenter() {
  const [data, setData] = useState(null);
  const [integrations, setIntegrations] = useState([]);
  useEffect(() => {
    api.get("/os/command-center").then((r) => setData(r.data)).catch(() => {});
    api.get("/os/integrations").then((r) => setIntegrations(r.data || [])).catch(() => {});
  }, []);
  if (!data) return <div className="text-neutral-500 text-sm">Chargement…</div>;
  const kpiOrder = ["revenue_mtd", "projects_active", "bookings_upcoming", "artists_in_development", "leads_new"];
  return (
    <div className="space-y-6" data-testid="command-center">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Command Center</h1>
          <p className="text-sm text-neutral-500 mt-1">Vue d'ensemble de votre activité — {new Date(data.generated_at).toLocaleString("fr-FR")}</p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500" /> <span className="text-neutral-500">Système opérationnel</span>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {kpiOrder.map((k) => {
          const kpi = data.kpis[k];
          const I = KPI_ICONS[k] || TrendingUp;
          const unavailable = kpi?.source === "INSUFFICIENT_DATA";
          return (
            <div key={k} data-testid={`kpi-${k}`} className="os-card p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="os-data-label">{KPI_LABELS[k]}</div>
                <I size={14} className="text-neutral-400" />
              </div>
              <div className="os-kpi-value">{unavailable ? "—" : (kpi?.value ?? 0)}</div>
              <div className={`text-[10px] mt-2 uppercase tracking-wider ${unavailable ? "text-amber-600" : "text-neutral-400"}`}>
                {unavailable ? "insufficient_data" : kpi?.source?.replace("db.", "")}
              </div>
            </div>
          );
        })}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Alerts */}
        <div className="os-card p-5 lg:col-span-1">
          <div className="flex items-center justify-between mb-4">
            <div className="os-data-label">Alertes</div>
            <AlertTriangle size={14} className="text-amber-500" />
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-2 text-neutral-600 border-l-2 border-amber-500 pl-3 py-1">
              <Info size={14} className="mt-0.5 text-amber-500 shrink-0" />
              <div>
                <div className="font-medium text-neutral-800">Wallet non connecté</div>
                <div className="text-xs text-neutral-500">Les métriques financières apparaissent en INSUFFICIENT_DATA jusqu'à la connexion CVLN Wallet.</div>
              </div>
            </div>
            <div className="flex items-start gap-2 border-l-2 border-neutral-300 pl-3 py-1">
              <Info size={14} className="mt-0.5 text-neutral-400 shrink-0" />
              <div>
                <div className="font-medium text-neutral-800">Laurentia LLM · non connecté</div>
                <div className="text-xs text-neutral-500">L'assistant IA renverra INSUFFICIENT_DATA tant que l'adapter n'est pas branché.</div>
              </div>
            </div>
          </div>
        </div>

        {/* Integrations */}
        <div className="os-card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div className="os-data-label">Intégrations écosystème</div>
            <Link to="/os/integrations" className="text-xs text-neutral-500 hover:text-neutral-900 transition-colors">Gérer →</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {integrations.map((i) => (
              <div key={i.key} data-testid={`integration-${i.key}`} className="flex items-center justify-between px-3 py-2.5 rounded-md hover:bg-neutral-50 transition-colors">
                <div>
                  <div className="text-sm font-medium text-neutral-900">{i.label}</div>
                  <div className="text-[10px] uppercase tracking-wider text-neutral-500">{i.category}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${i.status === "CONNECTED" ? "bg-emerald-500" : "bg-amber-500"}`} />
                  <span className={`text-[10px] uppercase tracking-wider ${i.status === "CONNECTED" ? "text-emerald-600" : "text-amber-600"}`}>{i.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="os-card p-5">
        <div className="os-data-label mb-3">Note méthodologique</div>
        <p className="text-sm text-neutral-600 leading-relaxed">
          Aucune donnée simulée. Toute métrique dont la source n'est pas connectée est affichée en <span className="os-mono bg-amber-50 text-amber-700 px-2 py-0.5 rounded">INSUFFICIENT_DATA</span> (§53, 148 spec). Les intégrations FREKCORE, FREKANSLA, KORA, CVLN Wallet, CVL Brain, Laurentia et Frek-ID sont préparées comme des adapters — statut par défaut <span className="os-mono">NOT_CONNECTED</span> (§146-158).
        </p>
      </div>
    </div>
  );
}
