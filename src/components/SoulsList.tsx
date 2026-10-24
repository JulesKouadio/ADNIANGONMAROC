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
  AlertCircle
} from 'lucide-react';
import { useChurch } from '../context/ChurchContext';
import { NewSoul, SoulGender, FollowUpStatus } from '../types';
import { SoulDetailModal } from './SoulDetailModal';
import { formatDateFr } from '../utils/date';

interface SoulsListProps {
  onNavigateToRegister: () => void;
}

export const SoulsList: React.FC<SoulsListProps> = ({ onNavigateToRegister }) => {
  const { souls, deleteSoul, updateSoul, prayerCells, exportToCsv } = useChurch();

  // View mode: 'table' (Grand tableau complet en colonnes) or 'cards' (Cartes)
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  // Filters state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGender, setSelectedGender] = useState<string>('ALL');
  const [selectedCell, setSelectedCell] = useState<string>('ALL');
  const [selectedVisit, setSelectedVisit] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  // Modals
  const [selectedSoulForDetail, setSelectedSoulForDetail] = useState<NewSoul | null>(null);
  const [soulToDelete, setSoulToDelete] = useState<NewSoul | null>(null);

  // Filtered souls computation
  const filteredSouls = useMemo(() => {
    return souls.filter((soul) => {
      const search = searchTerm.toLowerCase().trim();
      const matchSearch =
        !search ||
        soul.lastName.toLowerCase().includes(search) ||
        soul.firstNames.toLowerCase().includes(search) ||
        soul.phoneNumber.includes(search) ||
        soul.neighborhood.toLowerCase().includes(search) ||
        soul.addressLandmark.toLowerCase().includes(search) ||
        soul.prayerCell.toLowerCase().includes(search) ||
        soul.recordedByName.toLowerCase().includes(search) ||
        (soul.knownPersonName && soul.knownPersonName.toLowerCase().includes(search)) ||
        (soul.observation && soul.observation.toLowerCase().includes(search));

      const matchGender = selectedGender === 'ALL' || soul.gender === selectedGender;
      const matchCell = selectedCell === 'ALL' || soul.prayerCell === selectedCell;
      const matchVisit =
        selectedVisit === 'ALL' ||
        (selectedVisit === 'YES' && soul.canReceiveVisit) ||
        (selectedVisit === 'NO' && !soul.canReceiveVisit);

      const matchStatus =
        selectedStatus === 'ALL' || (soul.followUpStatus || 'nouveau') === selectedStatus;

      return matchSearch && matchGender && matchCell && matchVisit && matchStatus;
    });
  }, [souls, searchTerm, selectedGender, selectedCell, selectedVisit, selectedStatus]);

  const cleanPhone = (phone: string) => phone.replace(/[^0-9+]/g, '');

  const handleDeleteConfirm = async () => {
    if (soulToDelete) {
      await deleteSoul(soulToDelete.id);
      setSoulToDelete(null);
    }
  };

  const handleQuickStatusChange = async (soulId: string, newStatus: FollowUpStatus) => {
    await updateSoul(soulId, { followUpStatus: newStatus });
  };

  const getGenderBadge = (gender: SoulGender) => {
    switch (gender) {
      case 'HOMME':
        return <span className="px-1.5 py-0.5 rounded-[5px] text-[10px] font-bold bg-blue-100 text-blue-900 border border-blue-200">HOMME</span>;
      case 'FEMME':
        return <span className="px-1.5 py-0.5 rounded-[5px] text-[10px] font-bold bg-rose-100 text-rose-900 border border-rose-200">FEMME</span>;
      case 'JEUNE':
        return <span className="px-1.5 py-0.5 rounded-[5px] text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200">JEUNE</span>;
      case 'ENFANT':
        return <span className="px-1.5 py-0.5 rounded-[5px] text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-200">ENFANT</span>;
    }
  };

  const getStatusBadge = (status?: FollowUpStatus) => {
    const s = status || 'nouveau';
    switch (s) {
      case 'nouveau':
        return <span className="px-1.5 py-0.5 rounded-[5px] text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-300">Nouveau</span>;
      case 'contacte':
        return <span className="px-1.5 py-0.5 rounded-[5px] text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">Contacté</span>;
      case 'visite':
        return <span className="px-1.5 py-0.5 rounded-[5px] text-[10px] font-bold bg-purple-100 text-purple-900 border border-purple-300">Visité</span>;
      case 'integre':
        return <span className="px-1.5 py-0.5 rounded-[5px] text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">Intégré</span>;
    }
  };

  return (
    <div className="max-w-[98%] mx-auto py-5 px-2 sm:px-4">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Grand Tableau de Suivi des Nouvelles Âmes
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Toutes les informations enregistrées affichées dans des colonnes dédiées pour un suivi exhaustif.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* View mode toggle */}
          <div className="flex items-center bg-slate-200 p-0.5 rounded-[5px]">
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center space-x-1 px-2.5 py-1 text-xs font-bold rounded-[5px] transition ${
                viewMode === 'table' ? 'bg-indigo-900 text-white shadow-2xs' : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              <TableProperties className="w-3.5 h-3.5" />
              <span>Tableau Complet</span>
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`flex items-center space-x-1 px-2.5 py-1 text-xs font-bold rounded-[5px] transition ${
                viewMode === 'cards' ? 'bg-indigo-900 text-white shadow-2xs' : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Cartes</span>
            </button>
          </div>

          {souls.length > 0 && (
            <button
              onClick={exportToCsv}
              className="flex items-center space-x-1 px-3 py-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-300 rounded-[5px] hover:bg-slate-50 shadow-2xs transition"
            >
              <Download className="w-3.5 h-3.5 text-slate-600" />
              <span>Exporter CSV</span>
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

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-[5px] p-3 shadow-2xs border border-slate-200 mb-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-2 text-xs">
          {/* Search */}
          <div className="md:col-span-2 relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher nom, repère, quartier, tél, observation..."
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-[5px] text-xs focus:bg-white focus:border-indigo-600 outline-none text-slate-900"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2 pointer-events-none" />
          </div>

          {/* Gender */}
          <div>
            <select
              value={selectedGender}
              onChange={(e) => setSelectedGender(e.target.value)}
              className="w-full px-2 py-1.5 bg-slate-50 border border-slate-300 rounded-[5px] text-xs font-medium text-slate-800 outline-none"
            >
              <option value="ALL">Tous les genres</option>
              <option value="HOMME">Hommes</option>
              <option value="FEMME">Femmes</option>
              <option value="JEUNE">Jeunes</option>
              <option value="ENFANT">Enfants</option>
            </select>
          </div>

          {/* Cell */}
          <div>
            <select
              value={selectedCell}
              onChange={(e) => setSelectedCell(e.target.value)}
              className="w-full px-2 py-1.5 bg-slate-50 border border-slate-300 rounded-[5px] text-xs font-medium text-slate-800 outline-none"
            >
              <option value="ALL">Toutes les cellules</option>
              {prayerCells.map(c => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Visit */}
          <div>
            <select
              value={selectedVisit}
              onChange={(e) => setSelectedVisit(e.target.value)}
              className="w-full px-2 py-1.5 bg-slate-50 border border-slate-300 rounded-[5px] text-xs font-medium text-slate-800 outline-none"
            >
              <option value="ALL">Toutes les visites</option>
              <option value="YES">Visite acceptée</option>
              <option value="NO">Visite refusée</option>
            </select>
          </div>

          {/* Status */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-2 py-1.5 bg-slate-50 border border-slate-300 rounded-[5px] text-xs font-medium text-slate-800 outline-none"
            >
              <option value="ALL">Tous les statuts</option>
              <option value="nouveau">Nouveau</option>
              <option value="contacte">Contacté</option>
              <option value="visite">Visité</option>
              <option value="integre">Intégré</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
          <div>
            <strong className="text-slate-800">{filteredSouls.length}</strong> fiche(s) affichée(s) sur {souls.length}
          </div>
          {(searchTerm || selectedGender !== 'ALL' || selectedCell !== 'ALL' || selectedVisit !== 'ALL' || selectedStatus !== 'ALL') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedGender('ALL');
                setSelectedCell('ALL');
                setSelectedVisit('ALL');
                setSelectedStatus('ALL');
              }}
              className="text-indigo-900 hover:underline font-bold"
            >
              Réinitialiser les filtres
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      {filteredSouls.length === 0 ? (
        <div className="bg-white rounded-[5px] p-8 text-center border border-slate-200">
          <p className="text-sm font-bold text-slate-700">Aucune âme trouvée dans le registre.</p>
          <button
            onClick={onNavigateToRegister}
            className="mt-3 px-4 py-2 bg-indigo-900 text-white rounded-[5px] text-xs font-bold"
          >
            Enregistrer une nouvelle personne
          </button>
        </div>
      ) : viewMode === 'table' ? (
        /* Grand Tableau de Suivi avec TOUTES les informations en colonnes */
        <div className="bg-white rounded-[5px] border border-slate-300 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto max-h-[70vh]">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-100 text-slate-800 uppercase font-bold sticky top-0 z-10 border-b border-slate-300 text-[11px] tracking-wide select-none">
                <tr>
                  <th className="py-2.5 px-3 border-r border-slate-300 whitespace-nowrap bg-slate-100 text-center w-10">N°</th>
                  <th className="py-2.5 px-3 border-r border-slate-300 whitespace-nowrap bg-slate-100">Date Réception</th>
                  <th className="py-2.5 px-3 border-r border-slate-300 whitespace-nowrap bg-slate-100">Genre</th>
                  <th className="py-2.5 px-3 border-r border-slate-300 whitespace-nowrap bg-slate-100">Nom</th>
                  <th className="py-2.5 px-3 border-r border-slate-300 whitespace-nowrap bg-slate-100">Prénoms</th>
                  <th className="py-2.5 px-3 border-r border-slate-300 whitespace-nowrap bg-slate-100">Téléphone</th>
                  <th className="py-2.5 px-3 border-r border-slate-300 whitespace-nowrap bg-slate-100">Quartier</th>
                  <th className="py-2.5 px-3 border-r border-slate-300 whitespace-nowrap bg-slate-100">Repère</th>
                  <th className="py-2.5 px-3 border-r border-slate-300 whitespace-nowrap bg-slate-100">Cellule de Prière</th>
                  <th className="py-2.5 px-3 border-r border-slate-300 whitespace-nowrap bg-slate-100 text-center">Visite ?</th>
                  <th className="py-2.5 px-3 border-r border-slate-300 whitespace-nowrap bg-slate-100">Jour Visite</th>
                  <th className="py-2.5 px-3 border-r border-slate-300 whitespace-nowrap bg-slate-100">Heure Visite</th>
                  <th className="py-2.5 px-3 border-r border-slate-300 whitespace-nowrap bg-slate-100 min-w-[150px]">Motif si Non</th>
                  <th className="py-2.5 px-3 border-r border-slate-300 whitespace-nowrap bg-slate-100 text-center">Connaît qqun ?</th>
                  <th className="py-2.5 px-3 border-r border-slate-300 whitespace-nowrap bg-slate-100">Nom Connaissance</th>
                  <th className="py-2.5 px-3 border-r border-slate-300 whitespace-nowrap bg-slate-100">Enregistré par</th>
                  <th className="py-2.5 px-3 border-r border-slate-300 whitespace-nowrap bg-slate-100">Tél. Enregistreur</th>
                  <th className="py-2.5 px-3 border-r border-slate-300 whitespace-nowrap bg-slate-100 min-w-[200px]">Observation</th>
                  <th className="py-2.5 px-3 border-r border-slate-300 whitespace-nowrap bg-slate-100">Statut Suivi</th>
                  <th className="py-2.5 px-3 whitespace-nowrap bg-slate-100 text-center sticky right-0 z-20">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredSouls.map((soul, index) => {
                  return (
                    <tr 
                      key={soul.id}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      {/* Index */}
                      <td className="py-2.5 px-3 border-r border-slate-200 font-mono text-center text-slate-500 font-bold">
                        {index + 1}
                      </td>

                      {/* Date Réception */}
                      <td className="py-2.5 px-3 border-r border-slate-200 whitespace-nowrap font-medium text-slate-800">
                        {formatDateFr(soul.receptionDate)}
                      </td>

                      {/* Genre */}
                      <td className="py-2.5 px-3 border-r border-slate-200 whitespace-nowrap">
                        {getGenderBadge(soul.gender)}
                      </td>

                      {/* Nom */}
                      <td className="py-2.5 px-3 border-r border-slate-200 whitespace-nowrap font-bold text-slate-900 uppercase">
                        {soul.lastName}
                      </td>

                      {/* Prénoms */}
                      <td className="py-2.5 px-3 border-r border-slate-200 whitespace-nowrap font-medium text-slate-800 capitalize">
                        {soul.firstNames}
                      </td>

                      {/* Téléphone */}
                      <td className="py-2.5 px-3 border-r border-slate-200 whitespace-nowrap font-bold text-indigo-950 font-mono">
                        {soul.phoneNumber}
                      </td>

                      {/* Quartier */}
                      <td className="py-2.5 px-3 border-r border-slate-200 whitespace-nowrap text-slate-800">
                        {soul.neighborhood}
                      </td>

                      {/* Repère */}
                      <td className="py-2.5 px-3 border-r border-slate-200 text-slate-700 min-w-[140px] max-w-[220px] truncate" title={soul.addressLandmark}>
                        {soul.addressLandmark || '-'}
                      </td>

                      {/* Cellule de prière */}
                      <td className="py-2.5 px-3 border-r border-slate-200 whitespace-nowrap text-slate-800 font-medium">
                        {soul.prayerCell}
                      </td>

                      {/* Visite OUI / NON */}
                      <td className="py-2.5 px-3 border-r border-slate-200 whitespace-nowrap text-center">
                        {soul.canReceiveVisit ? (
                          <span className="px-1.5 py-0.5 rounded-[5px] bg-emerald-100 text-emerald-900 font-bold text-[10px]">
                            OUI
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded-[5px] bg-rose-100 text-rose-900 font-bold text-[10px]">
                            NON
                          </span>
                        )}
                      </td>

                      {/* Jour Visite */}
                      <td className="py-2.5 px-3 border-r border-slate-200 whitespace-nowrap text-slate-700">
                        {soul.canReceiveVisit ? (soul.visitDay || '-') : '-'}
                      </td>

                      {/* Heure Visite */}
                      <td className="py-2.5 px-3 border-r border-slate-200 whitespace-nowrap text-slate-700">
                        {soul.canReceiveVisit ? (soul.visitTime || '-') : '-'}
                      </td>

                      {/* Motif si Refus */}
                      <td className="py-2.5 px-3 border-r border-slate-200 text-amber-950 text-[11px] italic max-w-[200px] truncate" title={soul.visitRefusalReason}>
                        {!soul.canReceiveVisit ? (soul.visitRefusalReason || '-') : '-'}
                      </td>

                      {/* Connaît qqun ? */}
                      <td className="py-2.5 px-3 border-r border-slate-200 whitespace-nowrap text-center">
                        {soul.knowsSomeoneInChurch ? (
                          <span className="px-1.5 py-0.5 rounded-[5px] bg-indigo-100 text-indigo-900 font-bold text-[10px]">
                            OUI
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded-[5px] bg-slate-100 text-slate-600 font-medium text-[10px]">
                            NON
                          </span>
                        )}
                      </td>

                      {/* Nom Connaissance */}
                      <td className="py-2.5 px-3 border-r border-slate-200 whitespace-nowrap text-slate-800 font-medium">
                        {soul.knowsSomeoneInChurch ? (soul.knownPersonName || '-') : '-'}
                      </td>

                      {/* Enregistré par */}
                      <td className="py-2.5 px-3 border-r border-slate-200 whitespace-nowrap text-slate-700">
                        {soul.recordedByName}
                      </td>

                      {/* Tél Enregistreur */}
                      <td className="py-2.5 px-3 border-r border-slate-200 whitespace-nowrap font-mono text-[11px] text-slate-600">
                        {soul.recordedByPhone || '-'}
                      </td>

                      {/* Observation */}
                      <td className="py-2.5 px-3 border-r border-slate-200 text-slate-700 max-w-[250px] truncate" title={soul.observation}>
                        {soul.observation || '-'}
                      </td>

                      {/* Statut Suivi */}
                      <td className="py-2.5 px-3 border-r border-slate-200 whitespace-nowrap">
                        <select
                          value={soul.followUpStatus || 'nouveau'}
                          onChange={(e) => handleQuickStatusChange(soul.id, e.target.value as FollowUpStatus)}
                          className="text-[11px] font-bold py-0.5 px-1.5 rounded-[5px] bg-white border border-slate-300 text-slate-800 outline-none"
                        >
                          <option value="nouveau">Nouveau</option>
                          <option value="contacte">Contacté</option>
                          <option value="visite">Visité</option>
                          <option value="integre">Intégré</option>
                        </select>
                      </td>

                      {/* Actions */}
                      <td className="py-2.5 px-3 whitespace-nowrap bg-white text-center sticky right-0 z-10 shadow-xs border-l border-slate-200">
                        <div className="flex items-center justify-center space-x-1">
                          <a
                            href={`tel:${soul.phoneNumber}`}
                            title="Appeler"
                            className="p-1 text-slate-600 hover:text-indigo-900 rounded-[5px] hover:bg-slate-100"
                          >
                            <Phone className="w-3.5 h-3.5" />
                          </a>

                          <a
                            href={`https://wa.me/${cleanPhone(soul.phoneNumber)}?text=${encodeURIComponent(
                              `Chalom ${soul.firstNames},\nNous vous remercions chaleureusement pour votre présence à l'église. Que le Seigneur vous bénisse abondamment !`
                            )}`}
                            target="_blank"
                            rel="noreferrer"
                            title="Envoyer message WhatsApp"
                            className="p-1 text-emerald-700 hover:text-emerald-800 rounded-[5px] hover:bg-emerald-50"
                          >
                            <Send className="w-3.5 h-3.5" />
                          </a>

                          <button
                            onClick={() => setSelectedSoulForDetail(soul)}
                            title="Voir la fiche complète"
                            className="p-1 text-indigo-900 hover:text-indigo-950 rounded-[5px] hover:bg-indigo-50"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => setSoulToDelete(soul)}
                            title="Supprimer la fiche"
                            className="p-1 text-slate-400 hover:text-rose-600 rounded-[5px] hover:bg-rose-50"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
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
        /* Vue Cartes Responsive */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredSouls.map((soul) => (
            <div
              key={soul.id}
              className="bg-white rounded-[5px] border border-slate-300 p-4 shadow-2xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center space-x-1.5">
                    {getGenderBadge(soul.gender)}
                    {getStatusBadge(soul.followUpStatus)}
                  </div>
                  <span className="text-[11px] font-mono text-slate-500">
                    {formatDateFr(soul.receptionDate)}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 uppercase">
                  {soul.lastName} <span className="capitalize font-medium text-slate-700">{soul.firstNames}</span>
                </h3>

                <div className="text-xs font-bold text-indigo-950 mt-1 font-mono">
                  {soul.phoneNumber}
                </div>

                <div className="mt-2 text-xs text-slate-700 space-y-1">
                  <div>Quartier : <strong>{soul.neighborhood}</strong></div>
                  <div>Repère : <span className="italic">{soul.addressLandmark || 'Non spécifié'}</span></div>
                  <div>Cellule : <strong>{soul.prayerCell}</strong></div>
                  <div>
                    Visite : {soul.canReceiveVisit ? (
                      <strong className="text-emerald-700">OUI ({soul.visitDay} à {soul.visitTime})</strong>
                    ) : (
                      <span className="text-amber-800 italic">NON ({soul.visitRefusalReason})</span>
                    )}
                  </div>
                  {soul.knowsSomeoneInChurch && (
                    <div>Connaît : <strong>{soul.knownPersonName}</strong></div>
                  )}
                  <div>Enregistré par : {soul.recordedByName}</div>
                </div>

                {soul.observation && (
                  <p className="mt-2 p-2 bg-slate-50 border border-slate-200 rounded-[5px] text-[11px] text-slate-600 italic">
                    « {soul.observation} »
                  </p>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between">
                <div className="flex items-center space-x-1">
                  <a
                    href={`tel:${soul.phoneNumber}`}
                    className="p-1.5 text-slate-700 hover:bg-slate-100 rounded-[5px]"
                  >
                    <Phone className="w-3.5 h-3.5" />
                  </a>
                  <a
                    href={`https://wa.me/${cleanPhone(soul.phoneNumber)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 text-emerald-700 hover:bg-emerald-50 rounded-[5px]"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </a>
                  <button
                    onClick={() => setSelectedSoulForDetail(soul)}
                    className="p-1.5 text-indigo-900 hover:bg-indigo-50 rounded-[5px]"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center space-x-1">
                  <select
                    value={soul.followUpStatus || 'nouveau'}
                    onChange={(e) => handleQuickStatusChange(soul.id, e.target.value as FollowUpStatus)}
                    className="text-[11px] font-bold py-1 px-1.5 rounded-[5px] bg-white border border-slate-300 text-slate-800"
                  >
                    <option value="nouveau">Nouveau</option>
                    <option value="contacte">Contacté</option>
                    <option value="visite">Visité</option>
                    <option value="integre">Intégré</option>
                  </select>

                  <button
                    onClick={() => setSoulToDelete(soul)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-[5px]"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Soul Detail Modal */}
      {selectedSoulForDetail && (
        <SoulDetailModal
          soul={selectedSoulForDetail}
          onClose={() => setSelectedSoulForDetail(null)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {soulToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-2xs">
          <div className="bg-white rounded-[5px] max-w-sm w-full p-5 shadow-xl border border-slate-300">
            <h3 className="text-sm font-bold text-slate-900 text-center mb-1">
              Confirmer la suppression
            </h3>
            <p className="text-xs text-slate-600 text-center mb-4">
              Supprimer définitivement la fiche de <strong>{soulToDelete.firstNames} {soulToDelete.lastName}</strong> ?
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
                className="py-1.5 px-3 bg-rose-700 text-white rounded-[5px] text-xs font-bold hover:bg-rose-800"
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
