import React, { useState, useMemo } from 'react';
import {
  Search,
  Phone,
  Send,
  Eye,
  Trash2,
  UserPlus,
  Download,
  TableProperties,
  LayoutGrid,
  Edit3,
  ClipboardList,
  Lock,
  Unlock,
} from 'lucide-react';
import { useChurch } from '../context/ChurchContext';
import { NewSoul } from '../types';
import { SoulDetailModal } from './SoulDetailModal';
import { CLOSURE_REASONS } from '../data/churchConstants';
import { getCommunes } from '../data/abidjanSectors';

interface SoulsListProps {
  onNavigateToRegister: () => void;
  onEditSoul: (soul: NewSoul) => void;
  onOpenFollowUpForSoul: (soul: NewSoul) => void;
}

export const SoulsList: React.FC<SoulsListProps> = ({
  onNavigateToRegister,
  onEditSoul,
  onOpenFollowUpForSoul,
}) => {
  const {
    currentHost,
    souls,
    teams,
    hosts,
    assignSoulToTeam,
    assignSoulToAccompagnateur,
    openSoulFollowUp,
    closeSoulFollowUp,
    deleteSoul,
    exportSoulsToCsv,
  } = useChurch();

  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState<string>('ALL');
  const [filterState, setFilterState] = useState<string>('ALL');
  const [filterTeam, setFilterTeam] = useState<string>('ALL');
  const [filterCommune, setFilterCommune] = useState<string>('ALL');

  // Modals & Errors
  const [selectedSoul, setSelectedSoul] = useState<NewSoul | null>(null);
  const [soulToDelete, setSoulToDelete] = useState<NewSoul | null>(null);
  const [soulToClose, setSoulToClose] = useState<NewSoul | null>(null);
  const [closureReason, setClosureReason] = useState<string>(CLOSURE_REASONS[0]);
  const [closureReasonOther, setClosureReasonOther] = useState<string>('');
  const [actionError, setActionError] = useState<string | null>(null);

  const isResponsable = currentHost?.role === 'Responsable';
  const isChefEquipe = currentHost?.role === "Chef d'équipe";

  // Active teams & active hosts for assignments
  const activeTeams = useMemo(() => teams.filter((t) => t.status === 'active'), [teams]);
  const activeHosts = useMemo(() => hosts.filter((h) => h.status === 'active'), [hosts]);

  // Filtered souls
  const filteredSouls = useMemo(() => {
    return souls.filter((soul) => {
      const q = searchTerm.toLowerCase().trim();
      const matchSearch =
        !q ||
        soul.lastName.toLowerCase().includes(q) ||
        soul.firstNames.toLowerCase().includes(q) ||
        soul.phoneNumber.includes(q) ||
        soul.commune.toLowerCase().includes(q) ||
        soul.quartier.toLowerCase().includes(q) ||
        soul.secteur.toLowerCase().includes(q) ||
        (soul.addressLandmark && soul.addressLandmark.toLowerCase().includes(q)) ||
        (soul.assignedTeamName && soul.assignedTeamName.toLowerCase().includes(q)) ||
        (soul.assignedAccompagnateurName &&
          soul.assignedAccompagnateurName.toLowerCase().includes(q));

      const matchMode = filterMode === 'ALL' || soul.accueilMode === filterMode;
      const matchState = filterState === 'ALL' || soul.followUpState === filterState;
      const matchTeam =
        filterTeam === 'ALL' ||
        (filterTeam === 'UNASSIGNED'
          ? !soul.assignedTeamId
          : soul.assignedTeamId === filterTeam);
      const matchCommune = filterCommune === 'ALL' || soul.commune === filterCommune;

      return matchSearch && matchMode && matchState && matchTeam && matchCommune;
    });
  }, [souls, searchTerm, filterMode, filterState, filterTeam, filterCommune]);

  const cleanPhone = (phone: string) => phone.replace(/[^0-9+]/g, '');

  const handleAssignTeam = async (soulId: string, teamId: string) => {
    setActionError(null);
    try {
      await assignSoulToTeam(soulId, teamId);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Erreur d'assignation.");
    }
  };

  const handleAssignAccompagnateur = async (soulId: string, hostId: string) => {
    setActionError(null);
    if (!hostId) return;
    try {
      await assignSoulToAccompagnateur(soulId, hostId);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Erreur d'assignation.");
    }
  };

  const handleOpenFollowUp = async (soul: NewSoul) => {
    setActionError(null);
    try {
      await openSoulFollowUp(soul.id);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Erreur lors de l'ouverture.");
    }
  };

  const handleConfirmCloseFollowUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!soulToClose) return;
    setActionError(null);
    try {
      await closeSoulFollowUp(soulToClose.id, closureReason, closureReasonOther);
      setSoulToClose(null);
      setClosureReason(CLOSURE_REASONS[0]);
      setClosureReasonOther('');
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Erreur lors de la fermeture.');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!soulToDelete) return;
    setActionError(null);
    try {
      await deleteSoul(soulToDelete.id);
      setSoulToDelete(null);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Erreur de suppression.');
    }
  };

  const getAssignableHostsForSoul = (soul: NewSoul) => {
    if (isResponsable) {
      // Responsable can assign to himself or to any active host (optionally prioritized by team)
      if (soul.assignedTeamId) {
        return activeHosts.filter(
          (h) => h.teamId === soul.assignedTeamId || h.id === currentHost?.id || h.role === 'Responsable'
        );
      }
      return activeHosts;
    }
    if (isChefEquipe && currentHost) {
      // Chef d'équipe can assign ONLY to an Accompagnateur of his team or to himself
      return activeHosts.filter(
        (h) =>
          h.id === currentHost.id ||
          (currentHost.teamId && h.teamId === currentHost.teamId && h.role === 'Accompagnateur')
      );
    }
    return [];
  };

  const canChefAssignThisSoul = (soul: NewSoul) => {
    if (!isChefEquipe || !currentHost) return false;
    return Boolean(currentHost.teamId && soul.assignedTeamId === currentHost.teamId);
  };

  const renderStateText = (state: NewSoul['followUpState']) => {
    switch (state) {
      case 'ouvert':
        return <span className="font-bold text-emerald-800">Ouvert</span>;
      case 'ferme':
        return <span className="font-bold text-rose-800">Fermé</span>;
      default:
        return <span className="font-bold text-amber-800">En attente</span>;
    }
  };

  return (
    <div className="max-w-[98%] mx-auto py-5 px-2 sm:px-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Registre des Âmes, Assignation & Ouverture de Suivi
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Consultez toutes les fiches enregistrées, complétez les accueils express, assignez aux équipes/accompagnateurs et gérez l'ouverture du suivi.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center bg-slate-200 p-0.5 rounded-[5px]">
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`flex items-center space-x-1 px-2.5 py-1 text-xs font-bold rounded-[5px] ${
                viewMode === 'table' ? 'bg-indigo-900 text-white' : 'text-slate-700'
              }`}
            >
              <TableProperties className="w-3.5 h-3.5" />
              <span>Tableau</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`flex items-center space-x-1 px-2.5 py-1 text-xs font-bold rounded-[5px] ${
                viewMode === 'cards' ? 'bg-indigo-900 text-white' : 'text-slate-700'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Cartes</span>
            </button>
          </div>

          {filteredSouls.length > 0 && (
            <button
              type="button"
              onClick={() => exportSoulsToCsv(filteredSouls)}
              className="flex items-center space-x-1 px-3 py-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-300 rounded-[5px] hover:bg-slate-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exporter CSV</span>
            </button>
          )}

          <button
            type="button"
            onClick={onNavigateToRegister}
            className="flex items-center space-x-1 px-3.5 py-1.5 bg-indigo-900 hover:bg-indigo-800 text-white rounded-[5px] text-xs font-bold"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Recevoir une Âme</span>
          </button>
        </div>
      </div>

      {actionError && (
        <div className="mb-4 p-3 bg-rose-50 border border-rose-300 rounded-[5px] text-xs font-semibold text-rose-900 flex items-center justify-between">
          <span>{actionError}</span>
          <button
            type="button"
            onClick={() => setActionError(null)}
            className="underline ml-3 font-bold"
          >
            Fermer
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-[5px] p-3 border border-slate-200 shadow-2xs mb-4 space-y-2.5">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-2 text-xs">
          <div className="md:col-span-2 relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher nom, téléphone, quartier, repère, accompagnateur..."
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-[5px] text-xs outline-none focus:bg-white focus:border-indigo-700"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2 pointer-events-none" />
          </div>

          <select
            value={filterMode}
            onChange={(e) => setFilterMode(e.target.value)}
            className="px-2 py-1.5 bg-slate-50 border border-slate-300 rounded-[5px] text-xs font-medium text-slate-800"
          >
            <option value="ALL">Tous modes d'accueil</option>
            <option value="express">Accueil Express (Partiel)</option>
            <option value="long">Accueil Long (Complet)</option>
          </select>

          <select
            value={filterState}
            onChange={(e) => setFilterState(e.target.value)}
            className="px-2 py-1.5 bg-slate-50 border border-slate-300 rounded-[5px] text-xs font-medium text-slate-800"
          >
            <option value="ALL">Tous états de suivi</option>
            <option value="en_attente_decision">En attente de décision</option>
            <option value="ouvert">Suivi Ouvert</option>
            <option value="ferme">Suivi Fermé</option>
          </select>

          <select
            value={filterTeam}
            onChange={(e) => setFilterTeam(e.target.value)}
            className="px-2 py-1.5 bg-slate-50 border border-slate-300 rounded-[5px] text-xs font-medium text-slate-800"
          >
            <option value="ALL">Toutes les équipes</option>
            <option value="UNASSIGNED">Non assignées</option>
            {teams.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>

          <select
            value={filterCommune}
            onChange={(e) => setFilterCommune(e.target.value)}
            className="px-2 py-1.5 bg-slate-50 border border-slate-300 rounded-[5px] text-xs font-medium text-slate-800"
          >
            <option value="ALL">Toutes les communes</option>
            {getCommunes().map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
          <div>
            <strong className="text-slate-800 tabular-nums">{filteredSouls.length}</strong> fiche(s) affichée(s) sur{' '}
            <span className="tabular-nums">{souls.length}</span>
          </div>
          {(searchTerm ||
            filterMode !== 'ALL' ||
            filterState !== 'ALL' ||
            filterTeam !== 'ALL' ||
            filterCommune !== 'ALL') && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                setFilterMode('ALL');
                setFilterState('ALL');
                setFilterTeam('ALL');
                setFilterCommune('ALL');
              }}
              className="text-indigo-900 hover:underline font-bold"
            >
              Réinitialiser les filtres
            </button>
          )}
        </div>
      </div>

      {/* Empty state */}
      {filteredSouls.length === 0 ? (
        <div className="bg-white rounded-[5px] p-8 text-center border border-slate-200">
          <p className="text-sm font-bold text-slate-700">Aucune âme trouvée dans le registre.</p>
          <button
            type="button"
            onClick={onNavigateToRegister}
            className="mt-3 px-4 py-2 bg-indigo-900 text-white rounded-[5px] text-xs font-bold"
          >
            Recevoir une nouvelle âme
          </button>
        </div>
      ) : viewMode === 'table' ? (
        <div className="bg-white rounded-[5px] border border-slate-300 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto max-h-[70vh]">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-100 text-slate-800 uppercase font-bold sticky top-0 z-10 border-b border-slate-300 text-[11px]">
                <tr>
                  <th className="py-2.5 px-3 border-r border-slate-300 text-center w-10">N°</th>
                  <th className="py-2.5 px-3 border-r border-slate-300 whitespace-nowrap">Date Réception</th>
                  <th className="py-2.5 px-3 border-r border-slate-300 whitespace-nowrap">Contexte</th>
                  <th className="py-2.5 px-3 border-r border-slate-300 whitespace-nowrap">Mode</th>
                  <th className="py-2.5 px-3 border-r border-slate-300 whitespace-nowrap">Nom & Prénoms</th>
                  <th className="py-2.5 px-3 border-r border-slate-300 whitespace-nowrap">Téléphone</th>
                  <th className="py-2.5 px-3 border-r border-slate-300 whitespace-nowrap">Commune / Quartier / Secteur</th>
                  <th className="py-2.5 px-3 border-r border-slate-300 whitespace-nowrap">Repère</th>
                  <th className="py-2.5 px-3 border-r border-slate-300 whitespace-nowrap">Visite</th>
                  <th className="py-2.5 px-3 border-r border-slate-300 whitespace-nowrap">Vie Spirituelle</th>
                  <th className="py-2.5 px-3 border-r border-slate-300 whitespace-nowrap">Équipe d'accompagnement</th>
                  <th className="py-2.5 px-3 border-r border-slate-300 whitespace-nowrap">Accompagnateur</th>
                  <th className="py-2.5 px-3 border-r border-slate-300 whitespace-nowrap">État Suivi</th>
                  <th className="py-2.5 px-3 border-r border-slate-300 whitespace-nowrap">Discipolat</th>
                  <th className="py-2.5 px-3 border-r border-slate-300 whitespace-nowrap">Enregistré par</th>
                  <th className="py-2.5 px-3 whitespace-nowrap text-center sticky right-0 z-20 bg-slate-100">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredSouls.map((soul, idx) => {
                  const assignableHosts = getAssignableHostsForSoul(soul);
                  const chefCanAssign = canChefAssignThisSoul(soul);
                  const canSeeFollowUpShortcut =
                    soul.followUpState === 'ouvert' &&
                    (isResponsable ||
                      (isChefEquipe && soul.assignedTeamId === currentHost?.teamId) ||
                      soul.assignedAccompagnateurId === currentHost?.id);

                  return (
                    <tr key={soul.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2.5 px-3 border-r border-slate-200 text-center font-mono tabular-nums text-slate-500">
                        {idx + 1}
                      </td>
                      <td className="py-2.5 px-3 border-r border-slate-200 whitespace-nowrap font-mono tabular-nums text-slate-800">
                        {soul.receptionDate}
                      </td>
                      <td className="py-2.5 px-3 border-r border-slate-200 whitespace-nowrap text-slate-700">
                        {soul.welcomeContextType}
                        {soul.welcomeMeetingDay ? ` (${soul.welcomeMeetingDay})` : ''}
                      </td>
                      <td className="py-2.5 px-3 border-r border-slate-200 whitespace-nowrap font-bold">
                        {soul.accueilMode === 'express' ? (
                          <span className="text-amber-800">Express (Partiel)</span>
                        ) : (
                          <span className="text-indigo-900">Long</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 border-r border-slate-200 whitespace-nowrap">
                        <span className="font-bold text-slate-900 uppercase">{soul.lastName}</span>{' '}
                        <span className="text-slate-800 capitalize">{soul.firstNames}</span>
                      </td>
                      <td className="py-2.5 px-3 border-r border-slate-200 whitespace-nowrap font-mono font-bold text-indigo-950 tabular-nums">
                        {soul.phoneNumber}
                      </td>
                      <td className="py-2.5 px-3 border-r border-slate-200 whitespace-nowrap text-slate-700">
                        {soul.commune} · {soul.quartier} · {soul.secteur}
                      </td>
                      <td
                        className="py-2.5 px-3 border-r border-slate-200 max-w-[180px] truncate text-slate-700"
                        title={soul.addressLandmark}
                      >
                        {soul.addressLandmark || '-'}
                      </td>
                      <td className="py-2.5 px-3 border-r border-slate-200 whitespace-nowrap text-slate-700">
                        {soul.canReceiveVisit === undefined
                          ? '-'
                          : soul.canReceiveVisit
                          ? `Oui (${soul.visitDay || '-'} ${soul.visitTime || ''})`
                          : `Non`}
                      </td>
                      <td className="py-2.5 px-3 border-r border-slate-200 whitespace-nowrap text-slate-700">
                        {soul.isChristian ? 'Chrétien' : 'Non chrétien'}
                        {soul.isChristian && soul.isBaptized ? ' · Baptisé' : ''}
                      </td>

                      {/* Équipe d'accompagnement */}
                      <td className="py-2.5 px-3 border-r border-slate-200 whitespace-nowrap">
                        {isResponsable ? (
                          <select
                            value={soul.assignedTeamId || ''}
                            onChange={(e) => handleAssignTeam(soul.id, e.target.value)}
                            className="px-2 py-1 text-[11px] bg-white border border-slate-300 rounded-[5px] font-semibold text-slate-800"
                          >
                            <option value="">— Non assignée —</option>
                            {activeTeams.map((t) => (
                              <option key={t.id} value={t.id}>
                                {t.name} ({t.leaderName})
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span className="font-medium text-slate-800">
                            {soul.assignedTeamName || 'Non assignée'}
                          </span>
                        )}
                      </td>

                      {/* Accompagnateur */}
                      <td className="py-2.5 px-3 border-r border-slate-200 whitespace-nowrap">
                        {isResponsable || chefCanAssign ? (
                          <select
                            value={soul.assignedAccompagnateurId || ''}
                            onChange={(e) => handleAssignAccompagnateur(soul.id, e.target.value)}
                            className="px-2 py-1 text-[11px] bg-white border border-slate-300 rounded-[5px] font-semibold text-slate-800"
                          >
                            <option value="">— Choisir —</option>
                            {assignableHosts.map((h) => (
                              <option key={h.id} value={h.id}>
                                {h.firstNames} {h.lastName} ({h.role})
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span className="font-medium text-slate-800">
                            {soul.assignedAccompagnateurName || 'Non assigné'}
                          </span>
                        )}
                      </td>

                      {/* État Suivi (Ouvrir / Fermer réservé au Responsable) */}
                      <td className="py-2.5 px-3 border-r border-slate-200 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          {renderStateText(soul.followUpState)}
                          {isResponsable && (
                            <div className="flex items-center space-x-1">
                              {soul.followUpState !== 'ouvert' && (
                                <button
                                  type="button"
                                  onClick={() => handleOpenFollowUp(soul)}
                                  title="Ouvrir le suivi"
                                  className="px-1.5 py-0.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-[5px] text-[10px] font-bold inline-flex items-center space-x-0.5"
                                >
                                  <Unlock className="w-2.5 h-2.5" />
                                  <span>Ouvrir</span>
                                </button>
                              )}
                              {soul.followUpState !== 'ferme' && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActionError(null);
                                    setSoulToClose(soul);
                                  }}
                                  title="Fermer le suivi"
                                  className="px-1.5 py-0.5 bg-rose-700 hover:bg-rose-800 text-white rounded-[5px] text-[10px] font-bold inline-flex items-center space-x-0.5"
                                >
                                  <Lock className="w-2.5 h-2.5" />
                                  <span>Fermer</span>
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="py-2.5 px-3 border-r border-slate-200 whitespace-nowrap text-slate-700">
                        {soul.discipolat?.status || 'En attente'} ·{' '}
                        <strong>{soul.discipolat?.quality || 'Nouveau'}</strong>
                      </td>

                      <td className="py-2.5 px-3 border-r border-slate-200 whitespace-nowrap text-slate-700">
                        {soul.recordedByName}
                      </td>

                      {/* Actions */}
                      <td className="py-2.5 px-3 whitespace-nowrap bg-white text-center sticky right-0 z-10 border-l border-slate-200">
                        <div className="flex items-center justify-center space-x-1">
                          <a
                            href={`tel:${soul.phoneNumber}`}
                            title="Appeler"
                            className="p-1 text-slate-600 hover:text-indigo-900 rounded-[5px] hover:bg-slate-100"
                          >
                            <Phone className="w-3.5 h-3.5" />
                          </a>
                          <a
                            href={`https://wa.me/${cleanPhone(soul.phoneNumber)}`}
                            target="_blank"
                            rel="noreferrer"
                            title="WhatsApp"
                            className="p-1 text-emerald-700 hover:bg-emerald-50 rounded-[5px]"
                          >
                            <Send className="w-3.5 h-3.5" />
                          </a>
                          <button
                            type="button"
                            onClick={() => setSelectedSoul(soul)}
                            title="Voir fiche complète"
                            className="p-1 text-indigo-900 hover:bg-indigo-50 rounded-[5px]"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onEditSoul(soul)}
                            title={
                              soul.accueilMode === 'express'
                                ? 'Compléter en Accueil Long'
                                : 'Modifier la fiche'
                            }
                            className="p-1 text-amber-800 hover:bg-amber-50 rounded-[5px]"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          {canSeeFollowUpShortcut && (
                            <button
                              type="button"
                              onClick={() => onOpenFollowUpForSoul(soul)}
                              title="Tableau de bord & Discipolat"
                              className="p-1 text-indigo-900 hover:bg-indigo-100 rounded-[5px]"
                            >
                              <ClipboardList className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {isResponsable && (
                            <button
                              type="button"
                              onClick={() => setSoulToDelete(soul)}
                              title="Supprimer"
                              className="p-1 text-slate-400 hover:text-rose-700 hover:bg-rose-50 rounded-[5px]"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredSouls.map((soul) => (
            <div
              key={soul.id}
              className="bg-white rounded-[5px] border border-slate-300 p-4 shadow-2xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1.5">
                  <span className="font-mono">{soul.receptionDate}</span>
                  <span>
                    {soul.accueilMode === 'express' ? 'Express (Partiel)' : 'Long'} ·{' '}
                    {renderStateText(soul.followUpState)}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 uppercase">
                  {soul.lastName}{' '}
                  <span className="capitalize font-medium text-slate-700">{soul.firstNames}</span>
                </h3>
                <div className="text-xs font-mono font-bold text-indigo-950 mt-0.5">
                  {soul.phoneNumber}
                </div>
                <div className="mt-2 text-xs text-slate-700 space-y-1">
                  <div>
                    Localisation :{' '}
                    <strong>
                      {soul.commune} · {soul.quartier} · {soul.secteur}
                    </strong>
                  </div>
                  <div>Repère : {soul.addressLandmark || '-'}</div>
                  <div>Équipe : {soul.assignedTeamName || 'Non assignée'}</div>
                  <div>Accompagnateur : {soul.assignedAccompagnateurName || 'Non assigné'}</div>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center space-x-1">
                  <button
                    type="button"
                    onClick={() => setSelectedSoul(soul)}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-[5px] text-xs font-bold"
                  >
                    Détails
                  </button>
                  <button
                    type="button"
                    onClick={() => onEditSoul(soul)}
                    className="px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-950 rounded-[5px] text-xs font-bold"
                  >
                    {soul.accueilMode === 'express' ? 'Compléter' : 'Modifier'}
                  </button>
                </div>

                {soul.followUpState === 'ouvert' && (
                  <button
                    type="button"
                    onClick={() => onOpenFollowUpForSoul(soul)}
                    className="px-2.5 py-1 bg-indigo-900 hover:bg-indigo-800 text-white rounded-[5px] text-xs font-bold"
                  >
                    Suivi PLEF
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedSoul && (
        <SoulDetailModal
          soul={selectedSoul}
          onClose={() => setSelectedSoul(null)}
          onEditSoul={onEditSoul}
          onOpenFollowUp={onOpenFollowUpForSoul}
        />
      )}

      {/* Modal Fermer le suivi (Responsable uniquement, Accueil long requis) */}
      {soulToClose && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-2xs">
          <div className="bg-white rounded-[5px] max-w-md w-full p-5 border border-slate-300 shadow-xl">
            <h3 className="text-sm font-bold text-slate-900 uppercase mb-2">
              Fermer le suivi de {soulToClose.firstNames} {soulToClose.lastName}
            </h3>

            {soulToClose.accueilMode !== 'long' ? (
              <div className="space-y-4">
                <div className="p-3 bg-amber-50 border border-amber-300 rounded-[5px] text-xs text-amber-950">
                  <strong>Action bloquée :</strong> La clôture d'un suivi n'est possible qu'à
                  condition d'avoir d'abord complété l'<strong>Accueil long</strong> de
                  l'enregistrement.
                </div>
                <div className="flex items-center justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setSoulToClose(null)}
                    className="px-3 py-1.5 bg-slate-200 text-slate-800 rounded-[5px] text-xs font-bold"
                  >
                    Annuler
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const target = soulToClose;
                      setSoulToClose(null);
                      onEditSoul(target);
                    }}
                    className="px-4 py-1.5 bg-indigo-900 text-white rounded-[5px] text-xs font-bold"
                  >
                    Compléter en Accueil Long
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleConfirmCloseFollowUp} className="space-y-3">
                <p className="text-xs text-slate-600">
                  La clôture désactivera le tableau de bord de suivi pour cette âme.
                </p>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Motif de fermeture <span className="text-rose-600">*</span>
                  </label>
                  <select
                    value={closureReason}
                    onChange={(e) => setClosureReason(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-[5px] text-xs font-semibold text-slate-900"
                  >
                    {CLOSURE_REASONS.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

                {closureReason === 'Autre' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Préciser le motif <span className="text-rose-600">*</span>
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={closureReasonOther}
                      onChange={(e) => setClosureReasonOther(e.target.value)}
                      placeholder="Détaillez le motif de fermeture..."
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-[5px] text-xs text-slate-900"
                    />
                  </div>
                )}

                <div className="flex items-center justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSoulToClose(null)}
                    className="px-3 py-1.5 bg-slate-200 text-slate-800 rounded-[5px] text-xs font-bold"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-rose-700 hover:bg-rose-800 text-white rounded-[5px] text-xs font-bold"
                  >
                    Confirmer la fermeture
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Modal Suppression */}
      {soulToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-2xs">
          <div className="bg-white rounded-[5px] max-w-sm w-full p-5 border border-slate-300 shadow-xl">
            <h3 className="text-sm font-bold text-slate-900 text-center mb-1">
              Confirmer la suppression
            </h3>
            <p className="text-xs text-slate-600 text-center mb-4">
              Supprimer définitivement la fiche de{' '}
              <strong>
                {soulToDelete.firstNames} {soulToDelete.lastName}
              </strong>{' '}
              ?
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSoulToDelete(null)}
                className="py-1.5 px-3 bg-slate-200 text-slate-800 rounded-[5px] text-xs font-bold"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="py-1.5 px-3 bg-rose-700 hover:bg-rose-800 text-white rounded-[5px] text-xs font-bold"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
