import React from 'react';
import { useChurch } from '../context/ChurchContext';
import {
  ASSEMBLEE_DEPARTMENTS,
  DISCIPLESHIP_QUALITIES,
  WELCOME_CONTEXT_OPTIONS,
} from '../data/churchConstants';
import { isMonthlyReportLate } from '../utils/date';

export const DashboardStats: React.FC = () => {
  const { souls, teams, followUps } = useChurch();

  const total = souls.length;
  const pct = (n: number) => (total > 0 ? Math.round((n / total) * 100) : 0);

  // Modes & États
  const expressCount = souls.filter((s) => s.accueilMode === 'express').length;
  const longCount = souls.filter((s) => s.accueilMode === 'long').length;
  const openCount = souls.filter((s) => s.followUpState === 'ouvert').length;
  const waitingCount = souls.filter((s) => s.followUpState === 'en_attente_decision').length;
  const closedCount = souls.filter((s) => s.followUpState === 'ferme').length;

  // Vie spirituelle
  const christianCount = souls.filter((s) => s.isChristian).length;
  const memberCount = souls.filter((s) => s.isAssemblyMember).length;
  const baptizedInitialCount = souls.filter((s) => s.isBaptized).length;

  // Discipolat
  const basicValidated = souls.filter((s) => s.discipolat?.basicCourse === 'Validé').length;
  const catechismValidated = souls.filter((s) => s.discipolat?.catechism === 'Validé').length;
  const discBaptizedValid = souls.filter(
    (s) => s.discipolat?.isBaptized && s.discipolat?.baptismValidity === 'Valide'
  ).length;
  const integratedDept = souls.filter((s) => Boolean(s.discipolat?.department)).length;

  // Rapports & Délais
  const totalMonthlyEntries = followUps.length;
  const lateReportsCount = followUps.filter((f) =>
    isMonthlyReportLate(f.year, f.month, f.report, f.reportUpdatedAt)
  ).length;
  const onTimeReportsCount = totalMonthlyEntries - lateReportsCount;

  // Moyenne PLEF globale
  const avgPlef =
    totalMonthlyEntries > 0
      ? (
          followUps.reduce((acc, f) => acc + f.plefP + f.plefL + f.plefE + f.plefF, 0) /
          totalMonthlyEntries
        ).toFixed(1)
      : '0.0';

  // Communes distribution
  const communeCounts = souls.reduce<Record<string, number>>((acc, s) => {
    const key = s.commune || 'Non précisée';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  const sortedCommunes = Object.entries(communeCounts).sort((a, b) => b[1] - a[1]);

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Statistiques Chiffrées d'Enregistrement et de Suivi
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          États de synthèse consultables par l'ensemble des hôtes d'accueil et accompagnateurs.
        </p>
      </div>

      {/* Primary numeric KPI grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-4 rounded-[5px] border border-slate-300">
          <div className="text-[11px] font-bold uppercase text-slate-500">Total Âmes</div>
          <div className="text-2xl font-extrabold text-slate-900 font-mono tabular-nums mt-1">
            {total}
          </div>
        </div>
        <div className="bg-white p-4 rounded-[5px] border border-slate-300">
          <div className="text-[11px] font-bold uppercase text-slate-500">Accueil Express</div>
          <div className="text-2xl font-extrabold text-amber-800 font-mono tabular-nums mt-1">
            {expressCount} <span className="text-xs font-bold">({pct(expressCount)}%)</span>
          </div>
        </div>
        <div className="bg-white p-4 rounded-[5px] border border-slate-300">
          <div className="text-[11px] font-bold uppercase text-slate-500">Accueil Long</div>
          <div className="text-2xl font-extrabold text-indigo-950 font-mono tabular-nums mt-1">
            {longCount} <span className="text-xs font-bold">({pct(longCount)}%)</span>
          </div>
        </div>
        <div className="bg-white p-4 rounded-[5px] border border-slate-300">
          <div className="text-[11px] font-bold uppercase text-slate-500">Suivis Ouverts</div>
          <div className="text-2xl font-extrabold text-emerald-800 font-mono tabular-nums mt-1">
            {openCount}
          </div>
        </div>
        <div className="bg-white p-4 rounded-[5px] border border-slate-300">
          <div className="text-[11px] font-bold uppercase text-slate-500">En Attente</div>
          <div className="text-2xl font-extrabold text-slate-700 font-mono tabular-nums mt-1">
            {waitingCount}
          </div>
        </div>
        <div className="bg-white p-4 rounded-[5px] border border-slate-300">
          <div className="text-[11px] font-bold uppercase text-slate-500">Suivis Fermés</div>
          <div className="text-2xl font-extrabold text-rose-800 font-mono tabular-nums mt-1">
            {closedCount}
          </div>
        </div>
      </div>

      {/* Second row: Contexte d'accueil, Qualités Discipolat, Validation & PLEF */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Contextes d'accueil */}
        <div className="bg-white p-5 rounded-[5px] border border-slate-300 space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-indigo-950 border-b border-slate-200 pb-2">
            Par Contexte d'Accueil
          </h2>
          <div className="space-y-2 text-xs">
            {WELCOME_CONTEXT_OPTIONS.map((ctx) => {
              const count = souls.filter((s) => s.welcomeContextType === ctx).length;
              return (
                <div key={ctx} className="flex items-center justify-between">
                  <span className="text-slate-700 font-medium">{ctx}</span>
                  <span className="font-mono font-bold tabular-nums text-slate-900">
                    {count} ({pct(count)}%)
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Discipolat Qualités */}
        <div className="bg-white p-5 rounded-[5px] border border-slate-300 space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-indigo-950 border-b border-slate-200 pb-2">
            Qualités Discipolat
          </h2>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {DISCIPLESHIP_QUALITIES.map((q) => {
              const count = souls.filter(
                (s) => (s.discipolat?.quality || 'Nouveau') === q
              ).length;
              return (
                <div
                  key={q}
                  className="p-2 bg-slate-50 border border-slate-200 rounded-[5px] flex items-center justify-between"
                >
                  <span className="text-slate-700">{q}</span>
                  <strong className="font-mono tabular-nums text-indigo-950">{count}</strong>
                </div>
              );
            })}
          </div>
        </div>

        {/* Formations, Rapports & Score PLEF */}
        <div className="bg-white p-5 rounded-[5px] border border-slate-300 space-y-2.5 text-xs">
          <h2 className="text-sm font-bold uppercase tracking-wider text-indigo-950 border-b border-slate-200 pb-2">
            Indicateurs de Croissance & Rapports
          </h2>
          <div className="flex justify-between">
            <span>Chrétiens à l'arrivée / Membres</span>
            <strong className="font-mono tabular-nums">
              {christianCount} / {memberCount}
            </strong>
          </div>
          <div className="flex justify-between">
            <span>Baptisés (Accueil / Discipolat valide)</span>
            <strong className="font-mono tabular-nums">
              {baptizedInitialCount} / {discBaptizedValid}
            </strong>
          </div>
          <div className="flex justify-between">
            <span>Cours de base validés</span>
            <strong className="font-mono tabular-nums">{basicValidated}</strong>
          </div>
          <div className="flex justify-between">
            <span>Catéchisme validés</span>
            <strong className="font-mono tabular-nums">{catechismValidated}</strong>
          </div>
          <div className="flex justify-between">
            <span>Intégrés en Département</span>
            <strong className="font-mono tabular-nums">{integratedDept}</strong>
          </div>
          <div className="flex justify-between pt-2 border-t border-slate-200">
            <span>Score PLEF moyen (/20)</span>
            <strong className="font-mono tabular-nums text-indigo-950">{avgPlef}</strong>
          </div>
          <div className="flex justify-between">
            <span>Rapports mensuels (À temps / Hors délai)</span>
            <strong className="font-mono tabular-nums">
              <span className="text-emerald-700">{onTimeReportsCount}</span> /{' '}
              <span className="text-rose-700">{lateReportsCount}</span>
            </strong>
          </div>
        </div>
      </div>

      {/* Third row: Équipes, Communes, Départements */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Par Équipe */}
        <div className="bg-white p-5 rounded-[5px] border border-slate-300 space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-indigo-950 border-b border-slate-200 pb-2">
            Répartition par Équipe
          </h2>
          {teams.length === 0 ? (
            <p className="text-xs text-slate-500 italic">Aucune équipe créée.</p>
          ) : (
            <div className="space-y-2 text-xs">
              {teams.map((t) => {
                const c = souls.filter((s) => s.assignedTeamId === t.id).length;
                return (
                  <div key={t.id} className="flex items-center justify-between">
                    <span className="font-medium text-slate-800">{t.name}</span>
                    <strong className="font-mono tabular-nums">{c} âme(s)</strong>
                  </div>
                );
              })}
              <div className="flex items-center justify-between pt-1.5 border-t border-slate-100 text-slate-500">
                <span>Non assignées</span>
                <strong className="font-mono tabular-nums">
                  {souls.filter((s) => !s.assignedTeamId).length}
                </strong>
              </div>
            </div>
          )}
        </div>

        {/* Par Commune */}
        <div className="bg-white p-5 rounded-[5px] border border-slate-300 space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-indigo-950 border-b border-slate-200 pb-2">
            Répartition par Commune
          </h2>
          {sortedCommunes.length === 0 ? (
            <p className="text-xs text-slate-500 italic">Aucune donnée enregistrée.</p>
          ) : (
            <div className="space-y-1.5 text-xs max-h-56 overflow-y-auto">
              {sortedCommunes.map(([name, count]) => (
                <div key={name} className="flex items-center justify-between">
                  <span className="text-slate-700">{name}</span>
                  <strong className="font-mono tabular-nums">
                    {count} ({pct(count)}%)
                  </strong>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Par Département */}
        <div className="bg-white p-5 rounded-[5px] border border-slate-300 space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-indigo-950 border-b border-slate-200 pb-2">
            Intégration par Département
          </h2>
          <div className="space-y-1.5 text-xs max-h-56 overflow-y-auto">
            {ASSEMBLEE_DEPARTMENTS.map((dep) => {
              const count = souls.filter((s) => s.discipolat?.department === dep).length;
              return (
                <div key={dep} className="flex items-center justify-between">
                  <span className="text-slate-700">{dep}</span>
                  <strong className="font-mono tabular-nums">{count}</strong>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
