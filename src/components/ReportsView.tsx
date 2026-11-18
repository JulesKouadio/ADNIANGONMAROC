import React, { useMemo, useState } from 'react';
import { Download, Printer } from 'lucide-react';
import { useChurch } from '../context/ChurchContext';
import { MONTHS_FR, getGrowthEvaluationSummary } from '../data/churchConstants';
import { formatDateFr, formatShortDateFr, isMonthlyReportLate } from '../utils/date';

export const ReportsView: React.FC = () => {
  const { currentHost, followUps, teams } = useChurch();

  const isResponsable = currentHost?.role === 'Responsable';

  const [filterYear, setFilterYear] = useState<string>('ALL');
  const [filterMonth, setFilterMonth] = useState<string>('ALL');
  const [filterTeam, setFilterTeam] = useState<string>('ALL');
  const [filterLate, setFilterLate] = useState<string>('ALL');

  // Role scoping: Responsables see everything; others see ONLY their team's reports
  const scopedFollowUps = useMemo(() => {
    if (isResponsable) return followUps;
    if (!currentHost?.teamId) {
      return followUps.filter((f) => f.accompagnateurId === currentHost?.id);
    }
    return followUps.filter((f) => f.teamId === currentHost.teamId);
  }, [followUps, isResponsable, currentHost]);

  const years = useMemo(() => {
    const set = new Set<number>(scopedFollowUps.map((f) => f.year));
    if (set.size === 0) set.add(new Date().getFullYear());
    return Array.from(set).sort((a, b) => b - a);
  }, [scopedFollowUps]);

  const filteredReports = useMemo(() => {
    return scopedFollowUps.filter((r) => {
      const matchYear = filterYear === 'ALL' || r.year === Number(filterYear);
      const matchMonth = filterMonth === 'ALL' || r.month === Number(filterMonth);
      const matchTeam = filterTeam === 'ALL' || r.teamId === filterTeam;
      const late = isMonthlyReportLate(r.year, r.month, r.report, r.reportUpdatedAt);
      const matchLate =
        filterLate === 'ALL' ||
        (filterLate === 'YES' && late) ||
        (filterLate === 'NO' && !late);
      return matchYear && matchMonth && matchTeam && matchLate;
    });
  }, [scopedFollowUps, filterYear, filterMonth, filterTeam, filterLate]);

  const exportReportsCsv = () => {
    if (filteredReports.length === 0) return;
    const headers = [
      'Année',
      'Mois',
      'Équipe',
      'Accompagnateur',
      'Âme',
      'Fréquence contact',
      'P',
      'L',
      'E',
      'F',
      'Score Croissance',
      'Rapport',
      'Hors délai',
    ];
    const esc = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const rows = filteredReports.map((r) => {
      const late = isMonthlyReportLate(r.year, r.month, r.report, r.reportUpdatedAt);
      const mLabel = MONTHS_FR.find((m) => m.value === r.month)?.label || r.month;
      const evalSummary = getGrowthEvaluationSummary(r.plefP, r.plefL, r.plefE, r.plefF);
      return [
        esc(r.year),
        esc(mLabel),
        esc(r.teamName || '-'),
        esc(r.accompagnateurName),
        esc(r.soulName),
        esc(r.contactFrequency),
        esc(r.plefP),
        esc(r.plefL),
        esc(r.plefE),
        esc(r.plefF),
        esc(`${evalSummary.total}/20 (${evalSummary.stage})`),
        esc(r.report || ''),
        esc(late ? 'OUI' : 'NON'),
      ].join(';');
    });
    const csv = '\uFEFF' + [headers.join(';'), ...rows].join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `rapports_suivi_${formatDateFr(new Date()).replace(/\//g, '-')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-[98%] mx-auto py-6 px-2 sm:px-4 space-y-5">
      {/* Print Header */}
      <div className="hidden print:block border-b border-slate-400 pb-3 mb-4">
        <h1 className="text-lg font-bold uppercase text-slate-900">
          Rapport Mensuel d'Accompagnement des Âmes
        </h1>
        <p className="text-xs text-slate-700">
          Édité le {formatShortDateFr(new Date())} par {currentHost?.firstNames} {currentHost?.lastName} ({currentHost?.subRole})
        </p>
      </div>

      {/* Screen Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 print:hidden">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Rapports Mensuels & Suivi des Délais
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {isResponsable
              ? 'Consultation et extraction complète des rapports de toutes les équipes.'
              : `Consultation limitée aux rapports de votre équipe (${currentHost?.teamName || 'Personnel'}).`}{' '}
            Délai réglementaire : 7 jours après la fin du mois.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {filteredReports.length > 0 && (
            <>
              <button
                type="button"
                onClick={exportReportsCsv}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-white border border-slate-300 rounded-[5px] text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Exporter Tableau CSV</span>
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-900 hover:bg-indigo-800 text-white rounded-[5px] text-xs font-bold"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Rapport Papier</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-[5px] p-3 border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs print:hidden">
        <select
          value={filterYear}
          onChange={(e) => setFilterYear(e.target.value)}
          className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-[5px] font-semibold"
        >
          <option value="ALL">Toutes les années</option>
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>

        <select
          value={filterMonth}
          onChange={(e) => setFilterMonth(e.target.value)}
          className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-[5px] font-semibold"
        >
          <option value="ALL">Tous les mois</option>
          {MONTHS_FR.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>

        {isResponsable ? (
          <select
            value={filterTeam}
            onChange={(e) => setFilterTeam(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-[5px] font-semibold"
          >
            <option value="ALL">Toutes les équipes</option>
            {teams.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        ) : (
          <div className="px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-[5px] font-semibold text-slate-600">
            Équipe : {currentHost?.teamName || 'Affectation personnelle'}
          </div>
        )}

        <select
          value={filterLate}
          onChange={(e) => setFilterLate(e.target.value)}
          className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-[5px] font-semibold"
        >
          <option value="ALL">Hors délai : Tous</option>
          <option value="YES">Hors délai : OUI</option>
          <option value="NO">Hors délai : NON</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-[5px] border border-slate-300 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-100 text-slate-800 uppercase font-bold text-[11px] border-b border-slate-300">
              <tr>
                <th className="py-2.5 px-3 border-r border-slate-200">Année</th>
                <th className="py-2.5 px-3 border-r border-slate-200">Mois</th>
                <th className="py-2.5 px-3 border-r border-slate-200">Équipe</th>
                <th className="py-2.5 px-3 border-r border-slate-200">Accompagnateur</th>
                <th className="py-2.5 px-3 border-r border-slate-200">Âme</th>
                <th className="py-2.5 px-3 border-r border-slate-200">Fréquence</th>
                <th className="py-2.5 px-3 border-r border-slate-200 text-center">PLEF</th>
                <th className="py-2.5 px-3 border-r border-slate-200 min-w-[260px]">Rapport</th>
                <th className="py-2.5 px-3 text-center whitespace-nowrap">Hors délai</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredReports.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-500 italic">
                    Aucun rapport mensuel disponible pour ces critères.
                  </td>
                </tr>
              ) : (
                filteredReports.map((r) => {
                  const late = isMonthlyReportLate(
                    r.year,
                    r.month,
                    r.report,
                    r.reportUpdatedAt
                  );
                  const mLabel =
                    MONTHS_FR.find((m) => m.value === r.month)?.label || String(r.month);
                  return (
                    <tr key={r.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 border-r border-slate-200 font-mono tabular-nums">
                        {r.year}
                      </td>
                      <td className="py-2.5 px-3 border-r border-slate-200 font-semibold">
                        {mLabel}
                      </td>
                      <td className="py-2.5 px-3 border-r border-slate-200">
                        {r.teamName || '-'}
                      </td>
                      <td className="py-2.5 px-3 border-r border-slate-200 font-semibold text-slate-900">
                        {r.accompagnateurName}
                      </td>
                      <td className="py-2.5 px-3 border-r border-slate-200 font-semibold text-indigo-950">
                        {r.soulName}
                      </td>
                      <td className="py-2.5 px-3 border-r border-slate-200 font-mono font-bold">
                        {r.contactFrequency}
                      </td>
                      <td className="py-2.5 px-3 border-r border-slate-200 text-center font-mono tabular-nums whitespace-nowrap">
                        {r.plefP}/{r.plefL}/{r.plefE}/{r.plefF} (
                        {r.plefP + r.plefL + r.plefE + r.plefF}/20)
                      </td>
                      <td className="py-2.5 px-3 border-r border-slate-200 text-slate-800">
                        {r.report || <span className="italic text-rose-700">Rapport manquant</span>}
                      </td>
                      <td className="py-2.5 px-3 text-center font-bold">
                        <span className={late ? 'text-rose-700' : 'text-emerald-700'}>
                          {late ? 'OUI' : 'NON'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
