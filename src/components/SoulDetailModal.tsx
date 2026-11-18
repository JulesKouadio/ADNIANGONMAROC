import React from 'react';
import { X, Printer, Send, Phone, MapPin, Users, ClipboardList } from 'lucide-react';
import { NewSoul } from '../types';

interface SoulDetailModalProps {
  soul: NewSoul;
  onClose: () => void;
  onEditSoul?: (soul: NewSoul) => void;
  onOpenFollowUp?: (soul: NewSoul) => void;
}

export const SoulDetailModal: React.FC<SoulDetailModalProps> = ({
  soul,
  onClose,
  onEditSoul,
  onOpenFollowUp,
}) => {
  const cleanPhone = (phone: string) => phone.replace(/[^0-9+]/g, '');

  const followUpLabel =
    soul.followUpState === 'ouvert'
      ? 'Suivi Ouvert'
      : soul.followUpState === 'ferme'
      ? 'Suivi Fermé'
      : 'En attente de décision';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 overflow-y-auto backdrop-blur-2xs">
      <div className="bg-white rounded-[5px] max-w-3xl w-full shadow-2xl border border-slate-300 overflow-hidden my-6">
        {/* Header */}
        <div className="bg-indigo-950 text-white px-5 py-3.5 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider">
              Fiche Complète de l'Âme
            </h2>
            <p className="text-[11px] text-indigo-200">
              Mode : {soul.accueilMode === 'express' ? 'Accueil Express (Partiel)' : 'Accueil Long'} · {followUpLabel}
            </p>
          </div>
          <div className="flex items-center space-x-1">
            <button
              type="button"
              onClick={() => window.print()}
              title="Imprimer"
              className="p-1.5 text-indigo-200 hover:text-white hover:bg-indigo-900 rounded-[5px]"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              title="Fermer"
              className="p-1.5 text-indigo-200 hover:text-white hover:bg-indigo-900 rounded-[5px]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-5 sm:p-6 space-y-4 text-slate-800 max-h-[75vh] overflow-y-auto">
          {/* Identity Banner */}
          <div className="bg-slate-50 border border-slate-200 rounded-[5px] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="text-xs text-slate-600 font-medium">
                {soul.welcomeContextType}
                {soul.welcomeMeetingDay ? ` (${soul.welcomeMeetingDay})` : ''} · Reçu(e) le{' '}
                <strong className="text-slate-900">{soul.receptionDate}</strong>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mt-1">
                {soul.firstNames} {soul.lastName}{' '}
                {soul.gender ? (
                  <span className="text-xs font-bold text-indigo-900 ml-1">({soul.gender})</span>
                ) : null}
              </h3>
            </div>

            <div className="flex items-center space-x-2">
              <a
                href={`tel:${soul.phoneNumber}`}
                className="inline-flex items-center space-x-1 px-2.5 py-1.5 bg-white border border-slate-300 text-slate-800 rounded-[5px] text-xs font-bold hover:bg-slate-100"
              >
                <Phone className="w-3.5 h-3.5" />
                <span className="font-mono">{soul.phoneNumber}</span>
              </a>
              <a
                href={`https://wa.me/${cleanPhone(soul.phoneNumber)}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center space-x-1 px-2.5 py-1.5 bg-emerald-700 text-white rounded-[5px] text-xs font-bold hover:bg-emerald-800"
              >
                <Send className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Localisation & Contexte */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-[5px] space-y-1.5">
              <div className="font-bold text-slate-700 uppercase flex items-center space-x-1.5">
                <MapPin className="w-3.5 h-3.5 text-indigo-900" />
                <span>Localisation</span>
              </div>
              <div>
                Commune : <strong>{soul.commune}</strong>
              </div>
              <div>
                Quartier : <strong>{soul.quartier}</strong> · Secteur :{' '}
                <strong>{soul.secteur}</strong>
              </div>
              <div>
                Repère : <span className="italic">{soul.addressLandmark || 'Non spécifié'}</span>
              </div>
              {soul.gps && (
                <div>
                  GPS : <span className="font-mono">{soul.gps}</span>
                </div>
              )}
              {soul.stayDuration && (
                <div>
                  Durée : <strong>{soul.stayDuration}</strong>
                </div>
              )}
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-[5px] space-y-1.5">
              <div className="font-bold text-slate-700 uppercase flex items-center space-x-1.5">
                <Users className="w-3.5 h-3.5 text-indigo-900" />
                <span>Assignation & Suivi</span>
              </div>
              <div>
                Équipe d'accompagnement :{' '}
                <strong>{soul.assignedTeamName || 'Non assignée'}</strong>
              </div>
              <div>
                Accompagnateur :{' '}
                <strong>{soul.assignedAccompagnateurName || 'Non assigné'}</strong>
              </div>
              <div>
                État du suivi : <strong>{followUpLabel}</strong>
              </div>
              {soul.followUpState === 'ouvert' && soul.openedAtDateLong && (
                <div className="text-[11px] text-emerald-800">
                  Ouvert le {soul.openedAtDateLong} par {soul.openedByName}
                </div>
              )}
              {soul.followUpState === 'ferme' && (
                <div className="text-[11px] text-rose-800">
                  Fermé le {soul.closedAtDateLong} ({soul.closureReason}
                  {soul.closureReasonOther ? ` : ${soul.closureReasonOther}` : ''})
                </div>
              )}
            </div>
          </div>

          {/* Vie spirituelle & Arrivée */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 bg-white border border-slate-200 rounded-[5px] space-y-1">
              <div className="font-bold text-slate-700 uppercase mb-1">Vie Spirituelle</div>
              <div>
                Chrétien : <strong>{soul.isChristian ? 'Oui' : 'Non'}</strong>
              </div>
              {soul.isChristian && soul.accueilMode === 'long' && (
                <>
                  <div>
                    Membre de l'assemblée :{' '}
                    <strong>{soul.isAssemblyMember ? 'Oui' : 'Non'}</strong>
                  </div>
                  <div>
                    Baptisé : <strong>{soul.isBaptized ? 'Oui' : 'Non'}</strong>
                  </div>
                  {soul.isBaptized && (
                    <div>
                      Actif dans un département :{' '}
                      <strong>{soul.isActiveInDepartment ? 'Oui' : 'Non'}</strong>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="p-3.5 bg-white border border-slate-200 rounded-[5px] space-y-1">
              <div className="font-bold text-slate-700 uppercase mb-1">
                Arrivée & Visite à domicile
              </div>
              <div>
                Contexte d'arrivée :{' '}
                <strong>{soul.arrivalContext || 'Non renseigné'}</strong>
                {soul.arrivalSubContext ? ` (${soul.arrivalSubContext})` : ''}
                {soul.arrivalReferrerName ? ` — ${soul.arrivalReferrerName}` : ''}
              </div>
              {soul.canReceiveVisit !== undefined && (
                <div>
                  Visite à domicile :{' '}
                  {soul.canReceiveVisit ? (
                    <strong className="text-emerald-800">
                      Oui ({soul.visitDay || '-'} à {soul.visitTime || '-'})
                    </strong>
                  ) : (
                    <span className="text-amber-900">
                      Non ({soul.visitRefusalReason || 'Sans motif'})
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Consentements & Enregistreur */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-[5px] text-xs space-y-1">
            <div>
              Accord pour contacter :{' '}
              <strong>{soul.consentToContact ? 'Oui' : 'Non'}</strong> · Acté le{' '}
              <span className="font-mono">{soul.consentToContactDateLong}</span>
            </div>
            <div>
              Accord pour enregistrement :{' '}
              <strong>{soul.consentToRecord ? 'Oui' : 'Non'}</strong>
            </div>
            <div>
              Enregistré par : <strong>{soul.recordedByName}</strong>
              {soul.recordedByPhone ? ` (${soul.recordedByPhone})` : ''}
            </div>
            {soul.observation && (
              <div className="pt-1 border-t border-slate-200 italic text-slate-700">
                Observation : « {soul.observation} »
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 print:hidden">
          <div className="flex items-center space-x-2">
            {onEditSoul && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onEditSoul(soul);
                }}
                className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 rounded-[5px] text-xs font-bold"
              >
                {soul.accueilMode === 'express'
                  ? 'Compléter (Accueil Long)'
                  : 'Modifier la fiche'}
              </button>
            )}
            {onOpenFollowUp && soul.followUpState === 'ouvert' && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenFollowUp(soul);
                }}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-900 hover:bg-indigo-800 text-white rounded-[5px] text-xs font-bold"
              >
                <ClipboardList className="w-3.5 h-3.5" />
                <span>Ouvrir le Tableau de Suivi</span>
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-[5px] text-xs font-bold"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
