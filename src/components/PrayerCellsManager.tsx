import React, { useState } from 'react';
import { 
  Home, 
  Users, 
  Phone, 
  Send, 
  Plus, 
  Trash2, 
  MapPin, 
  AlertCircle
} from 'lucide-react';
import { useChurch } from '../context/ChurchContext';
import { PrayerCell } from '../types';

export const PrayerCellsManager: React.FC = () => {
  const { prayerCells, addPrayerCell, deletePrayerCell, souls } = useChurch();

  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [leaderName, setLeaderName] = useState('');
  const [leaderPhone, setLeaderPhone] = useState('');
  const [meetingDay, setMeetingDay] = useState('Mercredi');
  const [meetingTime, setMeetingTime] = useState('18h30 - 20h00');
  const [description, setDescription] = useState('');

  const [cellToDelete, setCellToDelete] = useState<PrayerCell | null>(null);

  const cleanPhone = (phone: string) => phone.replace(/[^0-9+]/g, '');

  const daysOfWeek = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

  const handleCreateCell = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !leaderName.trim() || !leaderPhone.trim()) {
      alert("Veuillez remplir au moins le nom de la cellule, le nom et le numéro du responsable.");
      return;
    }

    await addPrayerCell({
      name: name.trim(),
      neighborhood: neighborhood.trim() || 'Secteur église',
      leaderName: leaderName.trim(),
      leaderPhone: leaderPhone.trim(),
      meetingDay,
      meetingTime,
      description: description.trim(),
    });

    setName('');
    setNeighborhood('');
    setLeaderName('');
    setLeaderPhone('');
    setDescription('');
    setShowAddModal(false);
  };

  const handleDeleteConfirm = async () => {
    if (cellToDelete) {
      await deletePrayerCell(cellToDelete.id);
      setCellToDelete(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Cellules de Prière de l'Assemblée
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Encadrez et répartissez les nouvelles âmes dans les cellules de maison géographiques.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-indigo-900 hover:bg-indigo-800 text-white rounded-[5px] text-xs font-bold shadow-2xs transition"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Créer une Cellule</span>
        </button>
      </div>

      {/* Cells Grid or Empty State */}
      {prayerCells.length === 0 ? (
        <div className="bg-white rounded-[5px] border border-slate-300 p-8 text-center shadow-2xs">
          <div className="w-12 h-12 bg-slate-100 text-indigo-900 rounded-[5px] flex items-center justify-center mx-auto mb-3 border border-slate-200">
            <Home className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">Aucune cellule de prière enregistrée</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto mb-4">
            Le comité peut créer ses propres cellules de prière de maison et désigner leurs responsables.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-indigo-900 hover:bg-indigo-800 text-white rounded-[5px] text-xs font-bold transition shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Créer la Première Cellule</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {prayerCells.map((cell) => {
            const assignedSouls = souls.filter(s => s.prayerCell === cell.name);

            return (
              <div
                key={cell.id}
                className="bg-white rounded-[5px] border border-slate-300 shadow-2xs hover:shadow-xs transition flex flex-col justify-between overflow-hidden"
              >
              <div className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <div className="w-8 h-8 rounded-[5px] bg-slate-100 text-indigo-950 flex items-center justify-center border border-slate-200">
                    <Home className="w-4 h-4" />
                  </div>
                  <span className="bg-indigo-50 text-indigo-900 text-xs font-bold px-2 py-0.5 rounded-[5px] border border-indigo-200 flex items-center space-x-1">
                    <Users className="w-3 h-3" />
                    <span>{assignedSouls.length} âme(s)</span>
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900">
                  {cell.name}
                </h3>
                <div className="flex items-center space-x-1 text-xs text-slate-600 mt-1">
                  <MapPin className="w-3 h-3 text-indigo-900" />
                  <span>{cell.neighborhood}</span>
                </div>

                {/* Leader info */}
                <div className="mt-3 p-3 bg-slate-50 rounded-[5px] border border-slate-200 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Responsable :</span>
                    <span className="font-bold text-slate-900">{cell.leaderName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Téléphone :</span>
                    <span className="font-mono font-bold text-slate-900">{cell.leaderPhone}</span>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-slate-200">
                    <span className="text-slate-600">Réunion :</span>
                    <span className="font-semibold text-indigo-900">{cell.meetingDay} ({cell.meetingTime})</span>
                  </div>
                </div>

                {/* Assigned souls mini-list */}
                <div className="mt-3">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Âmes rattachées ({assignedSouls.length})
                  </div>
                  {assignedSouls.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">Aucune âme affectée pour l'instant.</p>
                  ) : (
                    <div className="space-y-1 max-h-32 overflow-y-auto pr-1">
                      {assignedSouls.map(s => (
                        <div key={s.id} className="text-xs p-1.5 bg-slate-50 border border-slate-200 rounded-[5px] flex items-center justify-between">
                          <span className="font-medium text-slate-800 truncate mr-2">
                            {s.firstNames} {s.lastName}
                          </span>
                          <span className="text-[10px] font-mono text-slate-600 shrink-0">
                            {s.phoneNumber}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Cell Card Actions */}
              <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2">
                <a
                  href={`https://wa.me/${cleanPhone(cell.leaderPhone)}?text=${encodeURIComponent(
                    `Chalom ${cell.leaderName},\nPoint sur la cellule "${cell.name}" : Vous avez ${assignedSouls.length} nouvelle(s) âme(s) sous votre charge pastorale.\nQue le Seigneur bénisse votre service.`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center space-x-1.5 px-2.5 py-1 text-xs font-bold text-emerald-800 bg-white hover:bg-emerald-50 border border-emerald-300 rounded-[5px] transition"
                >
                  <Send className="w-3 h-3 text-emerald-700" />
                  <span>WhatsApp Responsable</span>
                </a>

                <button
                  onClick={() => setCellToDelete(cell)}
                  title="Supprimer la cellule"
                  className="p-1 text-slate-400 hover:text-rose-600 rounded-[5px] transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-2xs">
          <div className="bg-white rounded-[5px] max-w-md w-full p-5 shadow-xl border border-slate-300">
            <h3 className="text-sm font-bold text-slate-900 uppercase mb-3">
              Nouvelle Cellule de Prière
            </h3>

            <form onSubmit={handleCreateCell} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Nom de la Cellule <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Béthanie"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-[5px] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Quartier / Secteur
                </label>
                <input
                  type="text"
                  placeholder="Ex: Cocody Angré"
                  value={neighborhood}
                  onChange={(e) => setNeighborhood(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-[5px] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Responsable <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Frère David"
                    value={leaderName}
                    onChange={(e) => setLeaderName(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-[5px] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Téléphone <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="Ex: +225 07..."
                    value={leaderPhone}
                    onChange={(e) => setLeaderPhone(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-[5px] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Jour de Réunion
                  </label>
                  <select
                    value={meetingDay}
                    onChange={(e) => setMeetingDay(e.target.value)}
                    className="w-full px-2 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-[5px] outline-none"
                  >
                    {daysOfWeek.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Horaire
                  </label>
                  <input
                    type="text"
                    value={meetingTime}
                    onChange={(e) => setMeetingTime(e.target.value)}
                    placeholder="Ex: 18h30 - 20h00"
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-[5px] outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:text-slate-800"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-900 hover:bg-indigo-800 text-white rounded-[5px] text-xs font-bold transition"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Cell Modal */}
      {cellToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-2xs">
          <div className="bg-white rounded-[5px] max-w-sm w-full p-5 shadow-xl border border-slate-300">
            <h3 className="text-sm font-bold text-slate-900 text-center mb-1">
              Supprimer cette cellule ?
            </h3>
            <p className="text-xs text-slate-600 text-center mb-4">
              Êtes-vous sûr de vouloir supprimer la cellule <strong>{cellToDelete.name}</strong> ?
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setCellToDelete(null)}
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
