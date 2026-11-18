import React, { useMemo, useState } from 'react';
import { Download, Search } from 'lucide-react';
import { useChurch } from '../context/ChurchContext';
import { MONTHS_FR } from '../data/churchConstants';
import { formatDateFr } from '../utils/date';

export const RexView: React.FC = () => {
  const { followUps, teams } = useChurch();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTeam, setFilterTeam] = useState('ALL');

  const rexList = useMemo(() => {
    return followUps
      .filter((f) => Boolean(f.rex && f.rex.trim().length > 0))
      .filter((f) => {
        const q = searchTerm.toLowerCase().trim();
        const matchSearch =
          !q ||
          (f.rex || '').toLowerCase().includes(q) ||
          f.accompagnateurName.toLowerCase().includes(q) ||
          f.soulName.toLowerCase().includes(q);
        const matchTeam = filterTeam === 'ALL' || f.teamId === filterTeam;
        return matchSearch && matchTeam;
      });
  }, [followUps, searchTerm, filterTeam]);

  const exportRexCsv = () => {
    if (rexList.length === 0) return;
    const headers = ['Date courte', 'Période', 'Accompagnateur', 'Équipe', 'Âme', 'REX'];
    const esc = (v: unknown) => `"${String(v || '').replace(/"/g, '""')}"`;
    const rows = rexList.map((r) => {
      const mLabel = MONTHS_FR.find((m) => m.value === r.month)?.label || r.month;
      return [
        esc(r.rexDateShort || formatDateFr(r.updatedAt)),
        esc(`${mLabel} ${r.year}`),
        esc(r.accompagnateurName),
        esc(r.teamName || '-'),
        esc(r.soulName),
        esc(r.rex),
      ].join(';');
    });
    const csv = '\uFEFF' + [headers.join(';'), ...rows].join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `synthese_rex_${formatDateFr(new Date()).replace(/\//g, '-')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Synthèse des Retours d'Expérience (REX)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Bonnes pratiques inspirantes rédigées par les accompagnateurs avec date courte.
          </p>
        </div>

        {rexList.length > 0 && (
          <button
            type="button"
            onClick={exportRexCsv}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-white border border-slate-300 rounded-[5px] text-xs font-bold text-slate-700 hover:bg-slate-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exporter REX (CSV)</span>
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-[5px] p-3 border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="sm:col-span-2 relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher une bonne pratique, un accompagnateur ou une âme..."
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-[5px] text-xs outline-none focus:bg-white focus:border-indigo-700"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2 pointer-events-none" />
        </div>

        <select
          value={filterTeam}
          onChange={(e) => setFilterTeam(e.target.value)}
          className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-[5px] text-xs font-semibold text-slate-800"
        >
          <option value="ALL">Toutes les équipes</option>
          {teams.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-[5px] border border-slate-300 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-100 text-slate-800 uppercase font-bold text-[11px] border-b border-slate-300">
              <tr>
                <th className="py-2.5 px-3 border-r border-slate-200 whitespace-nowrap">Date courte</th>
                <th className="py-2.5 px-3 border-r border-slate-200 whitespace-nowrap">Période</th>
                <th className="py-2.5 px-3 border-r border-slate-200 whitespace-nowrap">Accompagnateur</th>
                <th className="py-2.5 px-3 border-r border-slate-200 whitespace-nowrap">Équipe</th>
                <th className="py-2.5 px-3 border-r border-slate-200 whitespace-nowrap">Âme concernée</th>
                <th className="py-2.5 px-3 min-w-[280px]">Retour d'expérience (REX)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {rexList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500 italic">
                    Aucun REX enregistré pour le moment.
                  </td>
                </tr>
              ) : (
                rexList.map((r) => {
                  const mLabel = MONTHS_FR.find((m) => m.value === r.month)?.label || String(r.month);
                  return (
                    <tr key={r.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 border-r border-slate-200 whitespace-nowrap font-mono text-slate-800">
                        {r.rexDateShort || formatDateFr(r.updatedAt)}
                      </td>
                      <td className="py-2.5 px-3 border-r border-slate-200 whitespace-nowrap font-medium">
                        {mLabel} {r.year}
                      </td>
                      <td className="py-2.5 px-3 border-r border-slate-200 whitespace-nowrap font-bold text-slate-900">
                        {r.accompagnateurName}
                      </td>
                      <td className="py-2.5 px-3 border-r border-slate-200 whitespace-nowrap text-slate-700">
                        {r.teamName || '-'}
                      </td>
                      <td className="py-2.5 px-3 border-r border-slate-200 whitespace-nowrap text-indigo-950 font-semibold">
                        {r.soulName}
                      </td>
                      <td className="py-2.5 px-3 text-slate-800 leading-relaxed">{r.rex}</td>
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
