import React from 'react';
import { 
  Users, 
  HeartHandshake, 
  Clock, 
  Home, 
  Download, 
  UserPlus, 
  ArrowRight
} from 'lucide-react';
import { useChurch } from '../context/ChurchContext';

interface DashboardStatsProps {
  onNavigateToRegister: () => void;
  onNavigateToSouls: () => void;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({ 
  onNavigateToRegister, 
  onNavigateToSouls 
}) => {
  const { souls, prayerCells, exportToCsv } = useChurch();

  const total = souls.length;

  // Gender counts
  const menCount = souls.filter(s => s.gender === 'HOMME').length;
  const womenCount = souls.filter(s => s.gender === 'FEMME').length;
  const youthCount = souls.filter(s => s.gender === 'JEUNE').length;
  const childrenCount = souls.filter(s => s.gender === 'ENFANT').length;

  // Visits
  const visitAccepted = souls.filter(s => s.canReceiveVisit).length;
  const visitRefused = souls.filter(s => !s.canReceiveVisit).length;
  const visitRate = total > 0 ? Math.round((visitAccepted / total) * 100) : 0;

  // Follow up statuses
  const statusNew = souls.filter(s => (s.followUpStatus || 'nouveau') === 'nouveau').length;
  const statusContacted = souls.filter(s => s.followUpStatus === 'contacte').length;
  const statusVisited = souls.filter(s => s.followUpStatus === 'visite').length;
  const statusIntegrated = souls.filter(s => s.followUpStatus === 'integre').length;

  // Known person in church
  const knowsSomeoneCount = souls.filter(s => s.knowsSomeoneInChurch).length;

  // Visit preferred days
  const visitDaysMap: Record<string, number> = {};
  souls.filter(s => s.canReceiveVisit && s.visitDay).forEach(s => {
    const day = s.visitDay || 'Non précisé';
    visitDaysMap[day] = (visitDaysMap[day] || 0) + 1;
  });

  const getPercentage = (count: number) => {
    return total > 0 ? Math.round((count / total) * 100) : 0;
  };

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Top Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Statistiques & Indicateurs de Suivi
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Aperçu de la moisson, de la répartition par genre et du suivi des visites.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {total > 0 && (
            <button
              onClick={exportToCsv}
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-300 rounded-[5px] hover:bg-slate-50 shadow-2xs transition"
            >
              <Download className="w-3.5 h-3.5 text-slate-600" />
              <span>Exporter Rapport</span>
            </button>
          )}

          <button
            onClick={onNavigateToRegister}
            className="flex items-center space-x-1 px-3.5 py-1.5 bg-indigo-900 hover:bg-indigo-800 text-white rounded-[5px] text-xs font-bold shadow-2xs transition"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>+ Enregistrer une Âme</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Souls */}
        <div className="bg-white p-4 rounded-[5px] border border-slate-300 shadow-2xs">
          <div className="flex items-center justify-between text-indigo-900 mb-1">
            <span className="text-[11px] font-bold uppercase text-slate-500">Total Enregistrées</span>
            <Users className="w-4 h-4 text-indigo-900" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">{total}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Personnes reçues</div>
        </div>

        {/* Visit Acceptance Rate */}
        <div className="bg-white p-4 rounded-[5px] border border-slate-300 shadow-2xs">
          <div className="flex items-center justify-between text-emerald-800 mb-1">
            <span className="text-[11px] font-bold uppercase text-slate-500">Visites Acceptées</span>
            <Clock className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">{visitAccepted}</span>
            <span className="text-xs font-bold text-emerald-700">({visitRate}%)</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Disponibles pour visite</div>
        </div>

        {/* Integrated in Cell */}
        <div className="bg-white p-4 rounded-[5px] border border-slate-300 shadow-2xs">
          <div className="flex items-center justify-between text-indigo-900 mb-1">
            <span className="text-[11px] font-bold uppercase text-slate-500">Intégrées en Cellule</span>
            <Home className="w-4 h-4 text-indigo-900" />
          </div>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">{statusIntegrated}</span>
            <span className="text-xs font-bold text-indigo-900">({getPercentage(statusIntegrated)}%)</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Fidélisées en cellule</div>
        </div>

        {/* Parrainage / Connaissance */}
        <div className="bg-white p-4 rounded-[5px] border border-slate-300 shadow-2xs">
          <div className="flex items-center justify-between text-amber-800 mb-1">
            <span className="text-[11px] font-bold uppercase text-slate-500">Connaissent un Fidèle</span>
            <HeartHandshake className="w-4 h-4 text-amber-700" />
          </div>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">{knowsSomeoneCount}</span>
            <span className="text-xs font-bold text-amber-700">({getPercentage(knowsSomeoneCount)}%)</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Ont un lien fraternel initial</div>
        </div>
      </div>

      {/* Gender Breakdown & Follow-up Funnel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Gender Breakdown */}
        <div className="bg-white p-5 rounded-[5px] border border-slate-300 shadow-2xs">
          <h2 className="text-sm font-bold uppercase tracking-wider text-indigo-950 mb-3">
            Répartition par Genre & Catégorie
          </h2>

          <div className="space-y-3">
            {/* Homme */}
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-blue-900">HOMMES</span>
                <span className="text-slate-800">{menCount} ({getPercentage(menCount)}%)</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-[5px] overflow-hidden border border-slate-200">
                <div
                  className="bg-blue-700 h-2 rounded-[5px]"
                  style={{ width: `${getPercentage(menCount)}%` }}
                />
              </div>
            </div>

            {/* Femme */}
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-rose-900">FEMMES</span>
                <span className="text-slate-800">{womenCount} ({getPercentage(womenCount)}%)</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-[5px] overflow-hidden border border-slate-200">
                <div
                  className="bg-rose-600 h-2 rounded-[5px]"
                  style={{ width: `${getPercentage(womenCount)}%` }}
                />
              </div>
            </div>

            {/* Jeune */}
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-amber-900">JEUNES</span>
                <span className="text-slate-800">{youthCount} ({getPercentage(youthCount)}%)</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-[5px] overflow-hidden border border-slate-200">
                <div
                  className="bg-amber-600 h-2 rounded-[5px]"
                  style={{ width: `${getPercentage(youthCount)}%` }}
                />
              </div>
            </div>

            {/* Enfant */}
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-emerald-900">ENFANTS</span>
                <span className="text-slate-800">{childrenCount} ({getPercentage(childrenCount)}%)</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-[5px] overflow-hidden border border-slate-200">
                <div
                  className="bg-emerald-600 h-2 rounded-[5px]"
                  style={{ width: `${getPercentage(childrenCount)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Funnel de Suivi Pastoral */}
        <div className="bg-white p-5 rounded-[5px] border border-slate-300 shadow-2xs flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-indigo-950 mb-3">
              Suivi d'Intégration
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
              <div className="p-2.5 bg-slate-50 rounded-[5px] border border-slate-200">
                <div className="text-xl font-bold text-slate-800">{statusNew}</div>
                <div className="text-[11px] font-bold text-slate-700 mt-0.5">Nouveaux</div>
              </div>

              <div className="p-2.5 bg-amber-50 rounded-[5px] border border-amber-200">
                <div className="text-xl font-bold text-amber-800">{statusContacted}</div>
                <div className="text-[11px] font-bold text-amber-900 mt-0.5">Contactés</div>
              </div>

              <div className="p-2.5 bg-purple-50 rounded-[5px] border border-purple-200">
                <div className="text-xl font-bold text-purple-800">{statusVisited}</div>
                <div className="text-[11px] font-bold text-purple-900 mt-0.5">Visités</div>
              </div>

              <div className="p-2.5 bg-emerald-50 rounded-[5px] border border-emerald-200">
                <div className="text-xl font-bold text-emerald-800">{statusIntegrated}</div>
                <div className="text-[11px] font-bold text-emerald-900 mt-0.5">Intégrés</div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between">
            <span className="text-[11px] text-slate-500">Mise à jour en temps réel</span>
            <button
              onClick={onNavigateToSouls}
              className="text-xs font-bold text-indigo-900 hover:underline flex items-center space-x-1"
            >
              <span>Accéder au Grand Tableau</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Prayer Cells Allocation */}
      <div className="bg-white p-5 rounded-[5px] border border-slate-300 shadow-2xs">
        <h2 className="text-sm font-bold uppercase tracking-wider text-indigo-950 mb-3">
          Répartition des Âmes par Cellule de Prière
        </h2>

        {prayerCells.length === 0 ? (
          <p className="text-xs text-slate-500 italic py-3">
            Aucune cellule de prière enregistrée pour le moment.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {prayerCells.map(c => {
              const count = souls.filter(s => s.prayerCell === c.name).length;
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;
              return (
                <div key={c.id} className="p-2.5 bg-slate-50 rounded-[5px] border border-slate-200 text-xs">
                  <div className="flex items-center justify-between font-bold text-slate-800 mb-1">
                    <span className="truncate pr-2">{c.name}</span>
                    <span className="text-indigo-900 shrink-0">{count} âme(s) ({pct}%)</span>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-[5px] overflow-hidden">
                    <div
                      className="bg-indigo-900 h-1.5 rounded-[5px]"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1 flex justify-between">
                    <span>Resp: {c.leaderName} ({c.leaderPhone})</span>
                    <span>{c.meetingDay} {c.meetingTime}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
