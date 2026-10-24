import React, { useRef } from 'react';
import { 
  X, 
  Printer, 
  Send, 
  Phone, 
  MapPin, 
  Navigation, 
  Clock, 
  Users, 
  HeartHandshake, 
  FileText
} from 'lucide-react';
import { NewSoul, FollowUpStatus } from '../types';
import { useChurch } from '../context/ChurchContext';
import { formatDateFr } from '../utils/date';

interface SoulDetailModalProps {
  soul: NewSoul;
  onClose: () => void;
}

export const SoulDetailModal: React.FC<SoulDetailModalProps> = ({ soul, onClose }) => {
  const { updateSoul, prayerCells } = useChurch();
  const printRef = useRef<HTMLDivElement>(null);

  const cleanPhone = (phone: string) => phone.replace(/[^0-9+]/g, '');

  const matchedCell = prayerCells.find(c => c.name === soul.prayerCell);

  const handlePrint = () => {
    window.print();
  };

  const handleStatusChange = async (newStatus: FollowUpStatus) => {
    await updateSoul(soul.id, { followUpStatus: newStatus });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 overflow-y-auto backdrop-blur-2xs">
      <div className="bg-white rounded-[5px] max-w-2xl w-full shadow-2xl border border-slate-300 overflow-hidden my-8">
        
        {/* Modal Header */}
        <div className="bg-indigo-950 text-white px-5 py-3.5 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider">Fiche Individuelle de Suivi</h2>
            <p className="text-[11px] text-indigo-300">Réf : {soul.id}</p>
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={handlePrint}
              title="Imprimer cette fiche"
              className="p-1.5 text-indigo-200 hover:text-white hover:bg-indigo-900 rounded-[5px] transition"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              title="Fermer"
              className="p-1.5 text-indigo-200 hover:text-white hover:bg-indigo-900 rounded-[5px] transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable & Visible Body */}
        <div ref={printRef} className="p-5 sm:p-6 space-y-4 text-slate-800 print:p-0">
          
          {/* Header block for print */}
          <div className="hidden print:block text-center border-b border-slate-400 pb-3 mb-3">
            <h1 className="text-base font-bold uppercase tracking-wider text-slate-900">
              Service d'Accueil & de Suivi
            </h1>
            <p className="text-xs text-slate-600">FICHE OFFICIELLE D'ENREGISTREMENT DE NOUVELLE ÂME</p>
          </div>

          {/* Top Status & Identity Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-slate-50 p-3.5 rounded-[5px] border border-slate-200 gap-3">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-[5px] bg-indigo-900 text-white">
                  {soul.gender}
                </span>
                <span className="text-xs text-slate-600 font-medium">
                  Reçu(e) le : <strong className="text-slate-900">{formatDateFr(soul.receptionDate)}</strong>
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mt-1">
                {soul.firstNames} {soul.lastName}
              </h3>
            </div>

            {/* Follow-up status selector */}
            <div className="print:hidden">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Statut de suivi
              </label>
              <select
                value={soul.followUpStatus || 'nouveau'}
                onChange={(e) => handleStatusChange(e.target.value as FollowUpStatus)}
                className="text-xs font-bold px-2.5 py-1 rounded-[5px] border border-slate-300 bg-white text-slate-800"
              >
                <option value="nouveau">Nouveau</option>
                <option value="contacte">Contacté</option>
                <option value="visite">Visité à domicile</option>
                <option value="integre">Intégré en cellule</option>
              </select>
            </div>
          </div>

          {/* Contact & Location Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 rounded-[5px] border border-slate-200 bg-slate-50 space-y-2">
              <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-600 uppercase">
                <Phone className="w-3.5 h-3.5 text-indigo-900" />
                <span>Téléphone</span>
              </div>
              <div className="text-sm font-bold text-slate-900">
                {soul.phoneNumber}
              </div>
              <div className="flex items-center space-x-2 pt-1 print:hidden">
                <a
                  href={`tel:${soul.phoneNumber}`}
                  className="px-2.5 py-1 bg-white border border-slate-300 text-slate-800 rounded-[5px] text-xs font-bold hover:bg-slate-100"
                >
                  Appeler
                </a>
                <a
                  href={`https://wa.me/${cleanPhone(soul.phoneNumber)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-2.5 py-1 bg-emerald-700 text-white rounded-[5px] text-xs font-bold hover:bg-emerald-800 flex items-center space-x-1"
                >
                  <Send className="w-3 h-3" />
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>

            <div className="p-3 rounded-[5px] border border-slate-200 bg-slate-50 space-y-1.5">
              <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-600 uppercase">
                <MapPin className="w-3.5 h-3.5 text-indigo-900" />
                <span>Habitation & Repère</span>
              </div>
              <div className="text-xs text-slate-800">
                Quartier : <strong className="text-slate-900">{soul.neighborhood}</strong>
              </div>
              <div className="text-xs text-slate-700">
                Repère : <span className="font-medium text-slate-900">{soul.addressLandmark || 'Non spécifié'}</span>
              </div>
            </div>
          </div>

          {/* Cellule de Prière */}
          <div className="p-3 rounded-[5px] border border-slate-200 bg-indigo-50/40 space-y-1">
            <div className="flex items-center space-x-1.5 text-xs font-bold text-indigo-950 uppercase">
              <Users className="w-3.5 h-3.5 text-indigo-900" />
              <span>Cellule de Prière Confiée</span>
            </div>
            <div className="text-sm font-bold text-indigo-950">
              {soul.prayerCell}
            </div>
            {matchedCell && (
              <div className="text-xs text-slate-600">
                Responsable : <strong>{matchedCell.leaderName}</strong> ({matchedCell.leaderPhone}) | Rencontre : {matchedCell.meetingDay} ({matchedCell.meetingTime})
              </div>
            )}
          </div>

          {/* Visite Details */}
          <div className="p-3 rounded-[5px] border border-slate-200 space-y-1">
            <div className="text-xs font-bold text-slate-600 uppercase">
              Visite à Domicile
            </div>
            {soul.canReceiveVisit ? (
              <div className="text-xs text-slate-800">
                <span className="inline-block px-2 py-0.5 rounded-[5px] bg-emerald-100 text-emerald-800 font-bold mr-2">
                  Visite Acceptée
                </span>
                Jour : <strong>{soul.visitDay || 'Non précisé'}</strong> à <strong>{soul.visitTime || 'Non précisé'}</strong>
              </div>
            ) : (
              <div className="text-xs text-amber-950">
                <span className="inline-block px-2 py-0.5 rounded-[5px] bg-amber-100 text-amber-900 font-bold mr-2">
                  Visite Refusée
                </span>
                Motif : <span className="italic">{soul.visitRefusalReason || 'Aucun motif renseigné'}</span>
              </div>
            )}
          </div>

          {/* Connaissance dans l'église */}
          <div className="p-3 rounded-[5px] border border-slate-200 bg-slate-50">
            <div className="text-xs font-bold text-slate-600 uppercase mb-0.5">
              Connaissance dans l'Église
            </div>
            <div className="text-xs text-slate-800">
              {soul.knowsSomeoneInChurch ? (
                <span>Connaît : <strong>{soul.knownPersonName}</strong></span>
              ) : (
                <span className="text-slate-500 italic">Ne connaît personne dans l'église</span>
              )}
            </div>
          </div>

          {/* Observation */}
          {soul.observation && (
            <div className="p-3 rounded-[5px] border border-slate-200">
              <div className="text-xs font-bold text-slate-600 uppercase mb-1">
                Observation
              </div>
              <p className="text-xs text-slate-700 whitespace-pre-line leading-relaxed italic">
                « {soul.observation} »
              </p>
            </div>
          )}

          {/* Footer Enregistreur */}
          <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 gap-1">
            <div>
              Fiche enregistrée par : <strong className="text-slate-800">{soul.recordedByName}</strong>
              {soul.recordedByPhone && <span> ({soul.recordedByPhone})</span>}
            </div>
            {soul.createdAt && (
              <div>Enregistré le {formatDateFr(soul.createdAt)}</div>
            )}
          </div>
        </div>

        {/* Modal Actions Footer */}
        <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 flex items-center justify-between print:hidden">
          <button
            onClick={handlePrint}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-white border border-slate-300 rounded-[5px] text-xs font-bold text-slate-700 hover:bg-slate-100"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimer Fiche</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-indigo-900 hover:bg-indigo-800 text-white rounded-[5px] text-xs font-bold transition"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
