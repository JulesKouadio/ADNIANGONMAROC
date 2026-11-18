import React, { useState, useMemo, useEffect } from 'react';
import {
  Save,
  TrendingUp,
  CheckCircle2,
  Trash2,
  Calendar,
} from 'lucide-react';
import { useChurch } from '../context/ChurchContext';
import {
  BaptismValidity,
  ContactFrequency,
  CourseProgress,
  DiscipleshipInfo,
  DiscipleshipQuality,
  DiscipleshipStatus,
  MonthlyFollowUp,
  NewSoul,
} from '../types';
import {
  ASSEMBLEE_DEPARTMENTS,
  CONTACT_FREQUENCIES,
  COURSE_STATUS_OPTIONS,
  DISCIPLESHIP_QUALITIES,
  frequencyToMonthlyScore,
  getGrowthEvaluationSummary,
  MONTHS_FR,
  PLEF_SCORE_LABELS,
} from '../data/churchConstants';
import {
  formatLongDateFr,
  formatShortDateFr,
  isMonthlyReportLate,
  toIsoDateInput,
} from '../utils/date';

interface FollowUpWorkspaceProps {
  initialSoulId?: string | null;
}

export const FollowUpWorkspace: React.FC<FollowUpWorkspaceProps> = ({ initialSoulId }) => {
  const {
    currentHost,
    souls,
    teams,
    hosts,
    followUps,
    upsertMonthlyFollowUp,
    deleteMonthlyFollowUp,
    updateSoulDiscipleship,
  } = useChurch();

  const [subTab, setSubTab] = useState<'dashboard' | 'synthesis'>('dashboard');

  const isResponsable = currentHost?.role === 'Responsable';
  const isChefEquipe = currentHost?.role === "Chef d'équipe";

  // Filter for Responsable / Chef d'équipe to browse dashboards of their team/accompagnateurs
  const [filterSupervisorId, setFilterSupervisorId] = useState<string>('ALL');

  // Souls accessible for follow-up (must be followUpState === 'ouvert')
  const openSouls = useMemo(() => {
    const allOpen = souls.filter((s) => s.followUpState === 'ouvert');
    if (isResponsable) {
      if (filterSupervisorId === 'ALL') return allOpen;
      return allOpen.filter(
        (s) =>
          s.assignedAccompagnateurId === filterSupervisorId ||
          s.assignedTeamId === filterSupervisorId
      );
    }
    if (isChefEquipe && currentHost) {
      const teamSouls = allOpen.filter(
        (s) =>
          (currentHost.teamId && s.assignedTeamId === currentHost.teamId) ||
          s.assignedAccompagnateurId === currentHost.id
      );
      if (filterSupervisorId === 'ALL') return teamSouls;
      return teamSouls.filter((s) => s.assignedAccompagnateurId === filterSupervisorId);
    }
    if (currentHost) {
      return allOpen.filter((s) => s.assignedAccompagnateurId === currentHost.id);
    }
    return [];
  }, [souls, isResponsable, isChefEquipe, currentHost, filterSupervisorId]);

  const [selectedSoulId, setSelectedSoulId] = useState<string>(initialSoulId || '');

  useEffect(() => {
    if (initialSoulId && openSouls.some((s) => s.id === initialSoulId)) {
      setSelectedSoulId(initialSoulId);
      setSubTab('dashboard');
    } else if ((!selectedSoulId || !openSouls.some((s) => s.id === selectedSoulId)) && openSouls.length > 0) {
      setSelectedSoulId(openSouls[0].id);
    }
  }, [initialSoulId, openSouls, selectedSoulId]);

  const selectedSoul: NewSoul | undefined = openSouls.find((s) => s.id === selectedSoulId);

  // Follow-ups for selected soul sorted chronologically ascending for charts, descending for table
  const soulFollowUpsAsc = useMemo(() => {
    if (!selectedSoul) return [];
    return followUps
      .filter((f) => f.soulId === selectedSoul.id)
      .sort((a, b) => (a.year !== b.year ? a.year - b.year : a.month - b.month));
  }, [followUps, selectedSoul]);

  const soulFollowUpsDesc = useMemo(
    () => [...soulFollowUpsAsc].reverse(),
    [soulFollowUpsAsc]
  );

  // Monthly follow-up entry form state
  const now = new Date();
  const [entryYear, setEntryYear] = useState<number>(now.getFullYear());
  const [entryMonth, setEntryMonth] = useState<number>(now.getMonth() + 1);
  const [contactFrequency, setContactFrequency] = useState<ContactFrequency>('1/M');
  const [plefP, setPlefP] = useState<number>(0);
  const [plefL, setPlefL] = useState<number>(0);
  const [plefE, setPlefE] = useState<number>(0);
  const [plefF, setPlefF] = useState<number>(0);
  const [rex, setRex] = useState<string>('');
  const [report, setReport] = useState<string>('');
  const [savingRow, setSavingRow] = useState(false);
  const [rowMessage, setRowMessage] = useState<string | null>(null);

  // Load existing month row when soul/year/month changes
  useEffect(() => {
    if (!selectedSoul) return;
    const existing = soulFollowUpsAsc.find(
      (f) => f.year === entryYear && f.month === entryMonth
    );
    if (existing) {
      setContactFrequency(existing.contactFrequency);
      setPlefP(existing.plefP);
      setPlefL(existing.plefL);
      setPlefE(existing.plefE);
      setPlefF(existing.plefF);
      setRex(existing.rex || '');
      setReport(existing.report || '');
    } else {
      setContactFrequency('1/M');
      setPlefP(0);
      setPlefL(0);
      setPlefE(0);
      setPlefF(0);
      setRex('');
      setReport('');
    }
  }, [selectedSoul?.id, entryYear, entryMonth, soulFollowUpsAsc]);

  // Discipulat state
  const [discStatus, setDiscStatus] = useState<DiscipleshipStatus>('En attente');
  const [firstContactDateLong, setFirstContactDateLong] = useState<string>('');
  const [discQuality, setDiscQuality] = useState<DiscipleshipQuality>('Nouveau');
  const [basicCourse, setBasicCourse] = useState<CourseProgress>('Non');
  const [catechism, setCatechism] = useState<CourseProgress>('Non');
  const [discBaptized, setDiscBaptized] = useState<boolean>(false);
  const [baptismValidity, setBaptismValidity] = useState<BaptismValidity>('Valide');
  const [baptismDateIso, setBaptismDateIso] = useState<string>(toIsoDateInput());
  const [hasRenewal, setHasRenewal] = useState<boolean>(false);
  const [renewalDateIso, setRenewalDateIso] = useState<string>(toIsoDateInput());
  const [department, setDepartment] = useState<string>('');
  const [departmentDateIso, setDepartmentDateIso] = useState<string>(toIsoDateInput());
  const [savingDisc, setSavingDisc] = useState(false);
  const [discMessage, setDiscMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedSoul) return;
    const d = selectedSoul.discipulat;
    setDiscStatus(d?.status || 'En attente');
    setFirstContactDateLong(d?.firstContactDateLong || '');
    setDiscQuality(d?.quality || 'Nouveau');
    setBasicCourse(d?.basicCourse || 'Non');
    setCatechism(d?.catechism || 'Non');
    setDiscBaptized(Boolean(d?.isBaptized));
    setBaptismValidity(d?.baptismValidity || 'Valide');
    setBaptismDateIso(toIsoDateInput(d?.baptismDateShort));
    setHasRenewal(Boolean(d?.hasRenewal));
    setRenewalDateIso(toIsoDateInput(d?.renewalDateShort));
    setDepartment(d?.department || '');
    setDepartmentDateIso(toIsoDateInput(d?.departmentDateShort));
    setDiscMessage(null);
  }, [selectedSoul]);

  const handleSaveMonthlyEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSoul || !currentHost) return;
    setSavingRow(true);
    setRowMessage(null);
    try {
      await upsertMonthlyFollowUp({
        soulId: selectedSoul.id,
        soulName: `${selectedSoul.firstNames} ${selectedSoul.lastName}`,
        teamId: selectedSoul.assignedTeamId || currentHost.teamId || '',
        teamName: selectedSoul.assignedTeamName || currentHost.teamName || '',
        accompagnateurId: selectedSoul.assignedAccompagnateurId || currentHost.id,
        accompagnateurName:
          selectedSoul.assignedAccompagnateurName ||
          `${currentHost.firstNames} ${currentHost.lastName}`,
        year: entryYear,
        month: entryMonth,
        contactFrequency,
        plefP,
        plefL,
        plefE,
        plefF,
        rex,
        report,
      });
      setRowMessage('Ligne mensuelle enregistrée dans Firebase.');
    } catch (err) {
      setRowMessage(err instanceof Error ? err.message : 'Erreur de sauvegarde.');
    } finally {
      setSavingRow(false);
    }
  };

  const handleSaveDiscipleship = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSoul) return;
    setSavingDisc(true);
    setDiscMessage(null);

    const nextInfo: DiscipleshipInfo = {
      status: discStatus,
      firstContactDateLong:
        discStatus === '1er Contact'
          ? firstContactDateLong || formatLongDateFr(new Date())
          : '',
      quality: discQuality,
      basicCourse,
      catechism,
      isBaptized: discBaptized,
      baptismValidity: discBaptized ? baptismValidity : undefined,
      baptismDateShort: discBaptized ? formatShortDateFr(baptismDateIso) : undefined,
      hasRenewal: discBaptized ? hasRenewal : undefined,
      renewalDateShort:
        discBaptized && hasRenewal ? formatShortDateFr(renewalDateIso) : undefined,
      department: department || undefined,
      departmentDateShort: department ? formatShortDateFr(departmentDateIso) : undefined,
    };

    try {
      await updateSoulDiscipleship(selectedSoul.id, nextInfo);
      setDiscMessage('Parcours de Discipulat sauvegardé.');
    } catch (err) {
      setDiscMessage(err instanceof Error ? err.message : 'Erreur lors de la mise à jour.');
    } finally {
      setSavingDisc(false);
    }
  };

  const growthEval = getGrowthEvaluationSummary(plefP, plefL, plefE, plefF);

  // Team hosts for Chef d'équipe filter
  const teamHosts = useMemo(() => {
    if (!currentHost?.teamId) return [];
    return hosts.filter((h) => h.teamId === currentHost.teamId && h.status === 'active');
  }, [hosts, currentHost]);

  // Helper to get last 3 months followUps for a soul in Synthesis
  const getLastThreeEntries = (soulId: string): MonthlyFollowUp[] => {
    return followUps
      .filter((f) => f.soulId === soulId)
      .sort((a, b) => (b.year !== a.year ? b.year - a.year : b.month - a.month))
      .slice(0, 3);
  };

  return (
    <div className="max-w-[98%] mx-auto py-5 px-2 sm:px-4 space-y-5">
      {/* Header & Sub-tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Tableaux de Bord de Suivi, Discipulat & Synthèse
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Suivez la croissance spirituelle (PLEF), le discipulat et visualisez l'évolution mensuelle.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {(isResponsable || isChefEquipe) && (
            <select
              value={filterSupervisorId}
              onChange={(e) => setFilterSupervisorId(e.target.value)}
              className="px-3 py-1.5 bg-white border border-slate-300 rounded-[5px] text-xs font-semibold text-slate-800"
            >
              <option value="ALL">
                {isResponsable ? 'Toutes les équipes & accompagnateurs' : 'Toute mon équipe'}
              </option>
              {isResponsable && (
                <optgroup label="Par Équipe">
                  {teams.map((t) => (
                    <option key={t.id} value={t.id}>
                      Équipe : {t.name}
                    </option>
                  ))}
                </optgroup>
              )}
              <optgroup label="Par Accompagnateur">
                {(isResponsable ? hosts.filter((h) => h.status === 'active') : teamHosts).map(
                  (h) => (
                    <option key={h.id} value={h.id}>
                      {h.firstNames} {h.lastName} ({h.role})
                    </option>
                  )
                )}
              </optgroup>
            </select>
          )}

          <div className="flex items-center bg-slate-200 p-0.5 rounded-[5px]">
            <button
              type="button"
              onClick={() => setSubTab('dashboard')}
              className={`px-3 py-1.5 text-xs font-bold rounded-[5px] ${
                subTab === 'dashboard' ? 'bg-indigo-900 text-white' : 'text-slate-700'
              }`}
            >
              Tableau de bord & Discipulat
            </button>
            <button
              type="button"
              onClick={() => setSubTab('synthesis')}
              className={`px-3 py-1.5 text-xs font-bold rounded-[5px] ${
                subTab === 'synthesis' ? 'bg-indigo-900 text-white' : 'text-slate-700'
              }`}
            >
              Tableau de synthèse ({openSouls.length})
            </button>
          </div>
        </div>
      </div>

      {openSouls.length === 0 ? (
        <div className="bg-white rounded-[5px] border border-slate-200 p-8 text-center">
          <p className="text-sm font-bold text-slate-800">
            Aucune âme avec un suivi actuellement « Ouvert » dans votre périmètre.
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Un Responsable doit d'abord assigner l'âme et activer « Ouvrir le suivi » dans le registre.
          </p>
        </div>
      ) : subTab === 'dashboard' ? (
        <div className="space-y-5">
          {/* Soul Selector Bar */}
          <div className="bg-white rounded-[5px] border border-slate-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex-1">
              <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                Âme sélectionnée pour le suivi
              </label>
              <select
                value={selectedSoulId}
                onChange={(e) => setSelectedSoulId(e.target.value)}
                className="w-full max-w-xl px-3 py-2 bg-slate-50 border border-slate-300 rounded-[5px] text-xs font-bold text-slate-900"
              >
                {openSouls.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.lastName} {s.firstNames} · {s.phoneNumber} · {s.commune} (
                    {s.assignedAccompagnateurName || 'Non assigné'})
                  </option>
                ))}
              </select>
            </div>

            {selectedSoul && (
              <div className="text-xs text-slate-600 space-y-0.5 text-left sm:text-right">
                <div>
                  Équipe : <strong className="text-slate-900">{selectedSoul.assignedTeamName || '-'}</strong>
                </div>
                <div>
                  Accompagnateur :{' '}
                  <strong className="text-slate-900">
                    {selectedSoul.assignedAccompagnateurName || '-'}
                  </strong>
                </div>
              </div>
            )}
          </div>

          {selectedSoul && (
            <>
              {/* 1. Formulaire d'ajout / mise à jour mensuelle PLEF + REX + Rapport */}
              <div className="bg-white rounded-[5px] border border-slate-200 p-5 shadow-2xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-3 mb-4 gap-2">
                  <div>
                    <h2 className="text-sm font-bold uppercase tracking-wider text-indigo-950">
                      1. Saisie Mensuelle — Croissance (PLEF), REX & Rapport
                    </h2>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Notation de 0 à 5 par axe (P: Prière · L: Lecture biblique · E: Vie d'église · F: Service fraternel). Délai rapport : 7 jours après fin de mois.
                    </p>
                  </div>
                  <div className="px-3 py-1 bg-indigo-50 border border-indigo-200 rounded-[5px] text-xs font-bold text-indigo-950 tabular-nums shrink-0">
                    Croissance : {growthEval.total}/20 — {growthEval.stage}
                  </div>
                </div>

                {rowMessage && (
                  <div className="mb-4 p-2.5 bg-emerald-50 border border-emerald-300 rounded-[5px] text-xs font-semibold text-emerald-900 flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                    <span>{rowMessage}</span>
                  </div>
                )}

                <form onSubmit={handleSaveMonthlyEntry} className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                        Année
                      </label>
                      <input
                        type="number"
                        min={2024}
                        max={2050}
                        value={entryYear}
                        onChange={(e) => setEntryYear(Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-[5px] text-xs font-mono font-bold text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                        Mois
                      </label>
                      <select
                        value={entryMonth}
                        onChange={(e) => setEntryMonth(Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-[5px] text-xs font-semibold text-slate-900"
                      >
                        {MONTHS_FR.map((m) => (
                          <option key={m.value} value={m.value}>
                            {m.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                        Fréq. contact
                      </label>
                      <select
                        value={contactFrequency}
                        onChange={(e) => setContactFrequency(e.target.value as ContactFrequency)}
                        className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-[5px] text-xs font-bold text-indigo-950"
                      >
                        {CONTACT_FREQUENCIES.map((f) => (
                          <option key={f.value} value={f.value}>
                            {f.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {[
                      { label: 'P (Prière)', val: plefP, setter: setPlefP },
                      { label: 'L (Lecture)', val: plefL, setter: setPlefL },
                      { label: 'E (Vie d’église)', val: plefE, setter: setPlefE },
                      { label: 'F (Service)', val: plefF, setter: setPlefF },
                    ].map((axis) => (
                      <div key={axis.label}>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                          {axis.label}
                        </label>
                        <select
                          value={axis.val}
                          onChange={(e) => axis.setter(Number(e.target.value))}
                          className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-[5px] text-xs font-mono font-bold text-slate-900"
                        >
                          {PLEF_SCORE_LABELS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                        REX (Retour d'expérience / Bonne pratique)
                      </label>
                      <textarea
                        rows={2}
                        placeholder="Ex: Envoyer des prières régulièrement, RDV certains dimanches..."
                        value={rex}
                        onChange={(e) => setRex(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-[5px] text-xs text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                        Rapport mensuel (Observations d'accompagnement)
                      </label>
                      <textarea
                        rows={2}
                        placeholder="Ex: L'âme est ouverte à la relation d'accompagnement, partages hebdomadaires..."
                        value={report}
                        onChange={(e) => setReport(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-[5px] text-xs text-slate-900"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={savingRow}
                      className="inline-flex items-center space-x-1.5 px-4 py-2 bg-indigo-900 hover:bg-indigo-800 text-white rounded-[5px] text-xs font-bold"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{savingRow ? 'Enregistrement...' : 'Enregistrer ce mois'}</span>
                    </button>
                  </div>
                </form>

                {/* Historique Tableau de bord de cette âme */}
                <div className="mt-5 overflow-x-auto border border-slate-200 rounded-[5px]">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead className="bg-slate-100 text-slate-800 uppercase font-bold text-[11px] border-b border-slate-300">
                      <tr>
                        <th className="py-2 px-3 border-r border-slate-200">Année</th>
                        <th className="py-2 px-3 border-r border-slate-200">Mois</th>
                        <th className="py-2 px-3 border-r border-slate-200">Fréquence</th>
                        <th className="py-2 px-3 border-r border-slate-200 text-center">P</th>
                        <th className="py-2 px-3 border-r border-slate-200 text-center">L</th>
                        <th className="py-2 px-3 border-r border-slate-200 text-center">E</th>
                        <th className="py-2 px-3 border-r border-slate-200 text-center">F</th>
                        <th className="py-2 px-3 border-r border-slate-200">Croissance</th>
                        <th className="py-2 px-3 border-r border-slate-200">REX</th>
                        <th className="py-2 px-3 border-r border-slate-200">Rapports</th>
                        <th className="py-2 px-3 border-r border-slate-200 text-center">Hors délai</th>
                        <th className="py-2 px-3 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {soulFollowUpsDesc.length === 0 ? (
                        <tr>
                          <td colSpan={12} className="py-4 text-center text-slate-500 italic">
                            Aucune entrée mensuelle enregistrée pour cette âme.
                          </td>
                        </tr>
                      ) : (
                        soulFollowUpsDesc.map((row) => {
                          const late = isMonthlyReportLate(
                            row.year,
                            row.month,
                            row.report,
                            row.reportUpdatedAt
                          );
                          const monthLabel =
                            MONTHS_FR.find((m) => m.value === row.month)?.label || String(row.month);
                          const summary = getGrowthEvaluationSummary(
                            row.plefP,
                            row.plefL,
                            row.plefE,
                            row.plefF
                          );

                          return (
                            <tr key={row.id} className="hover:bg-slate-50">
                              <td className="py-2 px-3 border-r border-slate-200 font-mono tabular-nums">
                                {row.year}
                              </td>
                              <td className="py-2 px-3 border-r border-slate-200 font-semibold">
                                {monthLabel}
                              </td>
                              <td className="py-2 px-3 border-r border-slate-200 font-mono font-bold text-indigo-950">
                                {row.contactFrequency}
                              </td>
                              <td className="py-2 px-3 border-r border-slate-200 text-center font-mono tabular-nums">
                                {row.plefP}
                              </td>
                              <td className="py-2 px-3 border-r border-slate-200 text-center font-mono tabular-nums">
                                {row.plefL}
                              </td>
                              <td className="py-2 px-3 border-r border-slate-200 text-center font-mono tabular-nums">
                                {row.plefE}
                              </td>
                              <td className="py-2 px-3 border-r border-slate-200 text-center font-mono tabular-nums">
                                {row.plefF}
                              </td>
                              <td className="py-2 px-3 border-r border-slate-200 whitespace-nowrap font-medium">
                                {summary.total}/20 ({summary.stage})
                              </td>
                              <td className="py-2 px-3 border-r border-slate-200 max-w-[200px]">
                                {row.rex || '-'}
                              </td>
                              <td className="py-2 px-3 border-r border-slate-200 max-w-[240px]">
                                {row.report || <span className="italic text-slate-400">Non renseigné</span>}
                              </td>
                              <td className="py-2 px-3 border-r border-slate-200 text-center font-bold">
                                <span className={late ? 'text-rose-700' : 'text-emerald-700'}>
                                  {late ? 'OUI' : 'NON'}
                                </span>
                              </td>
                              <td className="py-2 px-3 text-center">
                                <button
                                  type="button"
                                  onClick={() => deleteMonthlyFollowUp(row.id)}
                                  title="Supprimer cette ligne"
                                  className="p-1 text-slate-400 hover:text-rose-700"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 2. Module Discipulat */}
              <div className="bg-white rounded-[5px] border border-slate-200 p-5 shadow-2xs">
                <h2 className="text-sm font-bold uppercase tracking-wider text-indigo-950 border-b border-slate-200 pb-2.5 mb-4">
                  2. Discipulat (Parcours de Foi)
                </h2>

                {discMessage && (
                  <div className="mb-4 p-2.5 bg-emerald-50 border border-emerald-300 rounded-[5px] text-xs font-semibold text-emerald-900">
                    {discMessage}
                  </div>
                )}

                <form onSubmit={handleSaveDiscipleship} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                        Statut
                      </label>
                      <select
                        value={discStatus}
                        onChange={(e) => {
                          const next = e.target.value as DiscipleshipStatus;
                          setDiscStatus(next);
                          if (next === '1er Contact' && !firstContactDateLong) {
                            setFirstContactDateLong(formatLongDateFr(new Date()));
                          }
                        }}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-[5px] text-xs font-bold text-slate-900"
                      >
                        <option value="En attente">En attente</option>
                        <option value="1er Contact">1er Contact</option>
                      </select>
                      {discStatus === '1er Contact' && firstContactDateLong && (
                        <p className="text-[11px] font-mono text-indigo-900 mt-1">
                          {firstContactDateLong}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                        Qualité
                      </label>
                      <select
                        value={discQuality}
                        onChange={(e) => setDiscQuality(e.target.value as DiscipleshipQuality)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-[5px] text-xs font-bold text-slate-900"
                      >
                        {DISCIPLESHIP_QUALITIES.map((q) => (
                          <option key={q} value={q}>
                            {q}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                        Cours de base
                      </label>
                      <select
                        value={basicCourse}
                        onChange={(e) => setBasicCourse(e.target.value as CourseProgress)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-[5px] text-xs font-semibold text-slate-900"
                      >
                        {COURSE_STATUS_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                        Catéchisme
                      </label>
                      <select
                        value={catechism}
                        onChange={(e) => setCatechism(e.target.value as CourseProgress)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-[5px] text-xs font-semibold text-slate-900"
                      >
                        {COURSE_STATUS_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Baptême cascade + Département */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                    <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-[5px] space-y-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                          Baptême
                        </label>
                        <div className="grid grid-cols-2 gap-2 max-w-xs">
                          <button
                            type="button"
                            onClick={() => setDiscBaptized(false)}
                            className={`py-1.5 rounded-[5px] border text-xs font-bold ${
                              !discBaptized
                                ? 'bg-slate-800 border-slate-800 text-white'
                                : 'bg-white border-slate-300 text-slate-700'
                            }`}
                          >
                            Non
                          </button>
                          <button
                            type="button"
                            onClick={() => setDiscBaptized(true)}
                            className={`py-1.5 rounded-[5px] border text-xs font-bold ${
                              discBaptized
                                ? 'bg-indigo-900 border-indigo-900 text-white'
                                : 'bg-white border-slate-300 text-slate-700'
                            }`}
                          >
                            Oui
                          </button>
                        </div>
                      </div>

                      {discBaptized && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                              Validité du baptême
                            </label>
                            <select
                              value={baptismValidity}
                              onChange={(e) =>
                                setBaptismValidity(e.target.value as BaptismValidity)
                              }
                              className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-[5px] text-xs font-semibold"
                            >
                              <option value="Valide">Valide</option>
                              <option value="Invalide">Invalide</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                              Date baptême ({formatShortDateFr(baptismDateIso)})
                            </label>
                            <input
                              type="date"
                              value={baptismDateIso}
                              onChange={(e) => setBaptismDateIso(e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-[5px] text-xs"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                              Renouvellement ?
                            </label>
                            <select
                              value={hasRenewal ? 'Oui' : 'Non'}
                              onChange={(e) => setHasRenewal(e.target.value === 'Oui')}
                              className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-[5px] text-xs font-semibold"
                            >
                              <option value="Non">Non</option>
                              <option value="Oui">Oui</option>
                            </select>
                          </div>

                          {hasRenewal && (
                            <div>
                              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                                Date renouvellement ({formatShortDateFr(renewalDateIso)})
                              </label>
                              <input
                                type="date"
                                value={renewalDateIso}
                                onChange={(e) => setRenewalDateIso(e.target.value)}
                                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-[5px] text-xs"
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-[5px] space-y-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                          Intégration dans un Département de l'Assemblée
                        </label>
                        <select
                          value={department}
                          onChange={(e) => setDepartment(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-[5px] text-xs font-semibold text-slate-900"
                        >
                          <option value="">— Aucun département pour l'instant —</option>
                          {ASSEMBLEE_DEPARTMENTS.map((dep) => (
                            <option key={dep} value={dep}>
                              {dep}
                            </option>
                          ))}
                        </select>
                      </div>

                      {department && (
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                            Date d'intégration ({formatShortDateFr(departmentDateIso)})
                          </label>
                          <div className="relative">
                            <input
                              type="date"
                              value={departmentDateIso}
                              onChange={(e) => setDepartmentDateIso(e.target.value)}
                              className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-[5px] text-xs"
                            />
                            <Calendar className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-2 pointer-events-none" />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={savingDisc}
                      className="inline-flex items-center space-x-1.5 px-4 py-2 bg-indigo-900 hover:bg-indigo-800 text-white rounded-[5px] text-xs font-bold"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{savingDisc ? 'Sauvegarde...' : 'Enregistrer Discipulat'}</span>
                    </button>
                  </div>
                </form>
              </div>
            </>
          )}
        </div>
      ) : (
        /* TAB 2 : TABLEAU DE SYNTHÈSE + COURBES PLEF & FRÉQUENCE DE CONTACT */
        <div className="space-y-5">
          {/* Synthèse Table */}
          <div className="bg-white rounded-[5px] border border-slate-200 p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-indigo-950">
                  Synthèse des Âmes Accompagnées ({openSouls.length})
                </h2>
                <p className="text-[11px] text-slate-500">
                  Cliquez sur une ligne pour afficher ses courbes d'évolution PLEF et Fréquence de contact ci-dessous.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-[5px]">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-slate-100 text-slate-800 uppercase font-bold text-[11px] border-b border-slate-300">
                  <tr>
                    <th className="py-2 px-3 border-r border-slate-200">Nom & Prénoms</th>
                    <th className="py-2 px-3 border-r border-slate-200">Téléphone</th>
                    <th className="py-2 px-3 border-r border-slate-200">Statut Discipulat</th>
                    <th className="py-2 px-3 border-r border-slate-200">Qualité</th>
                    <th className="py-2 px-3 border-r border-slate-200">3 Derniers Mois (Fréquence & PLEF)</th>
                    <th className="py-2 px-3 text-center">Courbes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {openSouls.map((soul) => {
                    const last3 = getLastThreeEntries(soul.id);
                    const isSelected = soul.id === selectedSoulId;
                    return (
                      <tr
                        key={soul.id}
                        className={`transition-colors ${
                          isSelected ? 'bg-indigo-50/70' : 'hover:bg-slate-50'
                        }`}
                      >
                        <td className="py-2.5 px-3 border-r border-slate-200 font-bold text-slate-900 whitespace-nowrap">
                          {soul.lastName} {soul.firstNames}
                        </td>
                        <td className="py-2.5 px-3 border-r border-slate-200 font-mono tabular-nums text-indigo-950 whitespace-nowrap">
                          {soul.phoneNumber}
                        </td>
                        <td className="py-2.5 px-3 border-r border-slate-200 whitespace-nowrap">
                          {soul.discipulat?.status || 'En attente'}
                        </td>
                        <td className="py-2.5 px-3 border-r border-slate-200 font-semibold whitespace-nowrap">
                          {soul.discipulat?.quality || 'Nouveau'}
                        </td>
                        <td className="py-2.5 px-3 border-r border-slate-200">
                          {last3.length === 0 ? (
                            <span className="text-slate-400 italic">Aucun mois saisi</span>
                          ) : (
                            <div className="flex flex-wrap gap-2">
                              {last3.map((m) => {
                                const mName =
                                  MONTHS_FR.find((x) => x.value === m.month)?.short || m.month;
                                return (
                                  <span
                                    key={m.id}
                                    className="text-[11px] font-mono bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-[5px]"
                                  >
                                    {mName} {m.year}: <strong>{m.contactFrequency}</strong> (PLEF:{' '}
                                    {m.plefP + m.plefL + m.plefE + m.plefF}/20)
                                  </span>
                                );
                              })}
                            </div>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-center whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => setSelectedSoulId(soul.id)}
                            className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-[5px] text-xs font-bold ${
                              isSelected
                                ? 'bg-indigo-900 text-white'
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                            }`}
                          >
                            <TrendingUp className="w-3 h-3" />
                            <span>{isSelected ? 'Affichée' : 'Voir courbes'}</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Courbes d'évolution pour l'âme sélectionnée */}
          {selectedSoul && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Courbe PLEF */}
              <div className="bg-white rounded-[5px] border border-slate-200 p-5 shadow-2xs">
                <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-950 mb-1">
                  Courbe d'évolution PLEF — {selectedSoul.firstNames} {selectedSoul.lastName}
                </h3>
                <p className="text-[11px] text-slate-500 mb-4">
                  Évolution mensuelle des axes P (Prière), L (Lecture), E (Vie d'église) et F (Service fraternel) sur une échelle de 0 à 5.
                </p>
                <PlefLineChart entries={soulFollowUpsAsc} />
              </div>

              {/* Courbe Fréquence de contact */}
              <div className="bg-white rounded-[5px] border border-slate-200 p-5 shadow-2xs">
                <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-950 mb-1">
                  Courbe de Fréquence de contact — {selectedSoul.firstNames} {selectedSoul.lastName}
                </h3>
                <p className="text-[11px] text-slate-500 mb-4">
                  Rythme de contact mensuel converti en contacts/mois (0/M = 0, 1/M = 1, 2/M = 2, 3/M = 3, 1/S = 4, 2/S = 8, 3/S = 12).
                </p>
                <FrequencyLineChart entries={soulFollowUpsAsc} />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/* Clean Responsive SVG Chart for PLEF (0 to 5) */
const PlefLineChart: React.FC<{ entries: MonthlyFollowUp[] }> = ({ entries }) => {
  if (entries.length === 0) {
    return (
      <div className="h-56 flex items-center justify-center bg-slate-50 border border-dashed border-slate-300 rounded-[5px] text-xs text-slate-500">
        Aucune donnée mensuelle PLEF disponible pour tracer la courbe.
      </div>
    );
  }

  const width = 560;
  const height = 220;
  const padL = 36;
  const padR = 20;
  const padT = 18;
  const padB = 34;
  const plotW = width - padL - padR;
  const plotH = height - padT - padB;

  const getX = (idx: number) =>
    entries.length === 1 ? padL + plotW / 2 : padL + (idx / (entries.length - 1)) * plotW;
  const getY = (val: number) => padT + plotH - (val / 5) * plotH;

  const series: { key: 'plefP' | 'plefL' | 'plefE' | 'plefF'; label: string; color: string }[] = [
    { key: 'plefP', label: 'P (Prière)', color: '#312e81' },
    { key: 'plefL', label: 'L (Lecture)', color: '#047857' },
    { key: 'plefE', label: 'E (Église)', color: '#b45309' },
    { key: 'plefF', label: 'F (Service)', color: '#be123c' },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-center gap-4 mb-2 text-[11px] font-bold">
        {series.map((s) => (
          <div key={s.key} className="flex items-center space-x-1.5">
            <span className="w-3 h-0.5 inline-block" style={{ backgroundColor: s.color }} />
            <span className="text-slate-700">{s.label}</span>
          </div>
        ))}
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
        {[0, 1, 2, 3, 4, 5].map((tick) => {
          const y = getY(tick);
          return (
            <g key={tick}>
              <line x1={padL} y1={y} x2={width - padR} y2={y} stroke="#e2e8f0" strokeWidth="1" />
              <text
                x={padL - 8}
                y={y + 4}
                textAnchor="end"
                className="text-[10px] fill-slate-500 font-mono"
              >
                {tick}
              </text>
            </g>
          );
        })}

        {entries.map((e, i) => {
          const mLabel = MONTHS_FR.find((m) => m.value === e.month)?.short || String(e.month);
          return (
            <text
              key={e.id}
              x={getX(i)}
              y={height - 10}
              textAnchor="middle"
              className="text-[10px] fill-slate-600 font-mono"
            >
              {mLabel} {String(e.year).slice(-2)}
            </text>
          );
        })}

        {series.map((s) => {
          const points = entries.map((e, i) => `${getX(i)},${getY(e[s.key])}`).join(' ');
          return (
            <g key={s.key}>
              {entries.length > 1 && (
                <polyline
                  fill="none"
                  stroke={s.color}
                  strokeWidth="2"
                  points={points}
                />
              )}
              {entries.map((e, i) => (
                <circle
                  key={`${s.key}_${e.id}`}
                  cx={getX(i)}
                  cy={getY(e[s.key])}
                  r="3.5"
                  fill={s.color}
                >
                  <title>{`${s.label}: ${e[s.key]}/5`}</title>
                </circle>
              ))}
            </g>
          );
        })}
      </svg>
    </div>
  );
};

/* Clean Responsive SVG Chart for Contact Frequency */
const FrequencyLineChart: React.FC<{ entries: MonthlyFollowUp[] }> = ({ entries }) => {
  if (entries.length === 0) {
    return (
      <div className="h-56 flex items-center justify-center bg-slate-50 border border-dashed border-slate-300 rounded-[5px] text-xs text-slate-500">
        Aucune fréquence de contact enregistrée pour tracer la courbe.
      </div>
    );
  }

  const width = 560;
  const height = 220;
  const padL = 42;
  const padR = 20;
  const padT = 18;
  const padB = 34;
  const plotW = width - padL - padR;
  const plotH = height - padT - padB;
  const maxScore = 12;

  const getX = (idx: number) =>
    entries.length === 1 ? padL + plotW / 2 : padL + (idx / (entries.length - 1)) * plotW;
  const getY = (score: number) => padT + plotH - (score / maxScore) * plotH;

  const points = entries
    .map((e, i) => `${getX(i)},${getY(frequencyToMonthlyScore(e.contactFrequency))}`)
    .join(' ');

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
      {[0, 3, 6, 9, 12].map((tick) => {
        const y = getY(tick);
        return (
          <g key={tick}>
            <line x1={padL} y1={y} x2={width - padR} y2={y} stroke="#e2e8f0" strokeWidth="1" />
            <text
              x={padL - 8}
              y={y + 4}
              textAnchor="end"
              className="text-[10px] fill-slate-500 font-mono"
            >
              {tick}/m
            </text>
          </g>
        );
      })}

      {entries.length > 1 && (
        <polyline fill="none" stroke="#312e81" strokeWidth="2.5" points={points} />
      )}

      {entries.map((e, i) => {
        const x = getX(i);
        const y = getY(frequencyToMonthlyScore(e.contactFrequency));
        const mLabel = MONTHS_FR.find((m) => m.value === e.month)?.short || String(e.month);
        return (
          <g key={e.id}>
            <circle cx={x} cy={y} r="4" fill="#312e81" />
            <text
              x={x}
              y={y - 8}
              textAnchor="middle"
              className="text-[10px] font-bold fill-indigo-950 font-mono"
            >
              {e.contactFrequency}
            </text>
            <text
              x={x}
              y={height - 10}
              textAnchor="middle"
              className="text-[10px] fill-slate-600 font-mono"
            >
              {mLabel} {String(e.year).slice(-2)}
            </text>
          </g>
        );
      })}
    </svg>
  );
};
