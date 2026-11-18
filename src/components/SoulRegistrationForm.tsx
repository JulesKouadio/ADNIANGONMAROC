import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  Calendar,
  MapPin,
  Navigation,
  Phone,
  Send,
  User,
  Crosshair,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import { useChurch } from '../context/ChurchContext';
import {
  AccueilMode,
  ArrivalContextType,
  NewSoul,
  SoulGender,
  StayDuration,
  WelcomeContextType,
} from '../types';
import { getCommunes, getQuartiers, getSecteurs } from '../data/abidjanSectors';
import { WELCOME_CONTEXT_OPTIONS } from '../data/churchConstants';
import {
  formatDateFr,
  formatLongDateFr,
  formatShortDateFr,
  toIsoDateInput,
} from '../utils/date';

interface SoulRegistrationFormProps {
  editingSoul?: NewSoul | null;
  onCancelEdit?: () => void;
  onSelectExistingSoulToEdit?: (soul: NewSoul) => void;
  onSuccessNavigate?: () => void;
}

export const SoulRegistrationForm: React.FC<SoulRegistrationFormProps> = ({
  editingSoul,
  onCancelEdit,
  onSelectExistingSoulToEdit,
  onSuccessNavigate,
}) => {
  const { currentHost, findSoulByPhone, addNewSoul, updateSoul } = useChurch();

  const isEditing = Boolean(editingSoul);

  // Mode Express / Long
  const [accueilMode, setAccueilMode] = useState<AccueilMode>(
    editingSoul?.accueilMode || 'long'
  );

  // 1. Contexte d'accueil
  const [welcomeContextType, setWelcomeContextType] = useState<WelcomeContextType>(
    editingSoul?.welcomeContextType || 'Culte'
  );
  const [welcomeMeetingDay, setWelcomeMeetingDay] = useState<string>(
    editingSoul?.welcomeMeetingDay || 'Mardi'
  );
  const [receptionDateIso, setReceptionDateIso] = useState<string>(
    editingSoul ? toIsoDateInput(editingSoul.receptionDate) : new Date().toISOString().split('T')[0]
  );

  // 2. Identité
  const [gender, setGender] = useState<SoulGender>(editingSoul?.gender || 'HOMME');
  const [lastName, setLastName] = useState<string>(editingSoul?.lastName || '');
  const [firstNames, setFirstNames] = useState<string>(editingSoul?.firstNames || '');
  const [phoneNumber, setPhoneNumber] = useState<string>(editingSoul?.phoneNumber || '');

  // 3. Localisation (Commune -> Quartier -> Secteur)
  const communes = getCommunes();
  const [commune, setCommune] = useState<string>(editingSoul?.commune || 'Yopougon');
  const quartiers = getQuartiers(commune);
  const [quartier, setQuartier] = useState<string>(
    editingSoul?.quartier || quartiers[0] || ''
  );
  const secteurs = getSecteurs(commune, quartier);
  const [secteur, setSecteur] = useState<string>(
    editingSoul?.secteur || secteurs[0] || ''
  );
  const [addressLandmark, setAddressLandmark] = useState<string>(
    editingSoul?.addressLandmark || ''
  );
  const [gps, setGps] = useState<string>(editingSoul?.gps || '');
  const [stayDuration, setStayDuration] = useState<StayDuration>(
    editingSoul?.stayDuration || 'Permanent'
  );
  const [locatingGps, setLocatingGps] = useState(false);

  // 4. Visite à domicile (conservée selon demande utilisateur)
  const [canReceiveVisit, setCanReceiveVisit] = useState<boolean>(
    editingSoul?.canReceiveVisit !== undefined ? editingSoul.canReceiveVisit : true
  );
  const [visitDay, setVisitDay] = useState<string>(editingSoul?.visitDay || 'Samedi');
  const [visitTime, setVisitTime] = useState<string>(editingSoul?.visitTime || '16h00');
  const [visitRefusalReason, setVisitRefusalReason] = useState<string>(
    editingSoul?.visitRefusalReason || ''
  );

  // 5. Contexte d'arrivée (Accueil long)
  const [arrivalContext, setArrivalContext] = useState<ArrivalContextType>(
    editingSoul?.arrivalContext || 'Librement'
  );
  const [arrivalSubContext, setArrivalSubContext] = useState<string>(
    editingSoul?.arrivalSubContext || ''
  );
  const [arrivalReferrerName, setArrivalReferrerName] = useState<string>(
    editingSoul?.arrivalReferrerName || ''
  );

  // 6. Vie spirituelle (cascade)
  const [isChristian, setIsChristian] = useState<boolean>(
    editingSoul?.isChristian !== undefined ? editingSoul.isChristian : false
  );
  const [isAssemblyMember, setIsAssemblyMember] = useState<boolean>(
    editingSoul?.isAssemblyMember !== undefined ? editingSoul.isAssemblyMember : false
  );
  const [isBaptized, setIsBaptized] = useState<boolean>(
    editingSoul?.isBaptized !== undefined ? editingSoul.isBaptized : false
  );
  const [isActiveInDepartment, setIsActiveInDepartment] = useState<boolean>(
    editingSoul?.isActiveInDepartment !== undefined ? editingSoul.isActiveInDepartment : false
  );

  // 7. Consentements obligatoires
  const [consentToContact, setConsentToContact] = useState<boolean>(
    editingSoul?.consentToContact || false
  );
  const [consentToContactDateLong, setConsentToContactDateLong] = useState<string>(
    editingSoul?.consentToContactDateLong || ''
  );
  const [consentToRecord, setConsentToRecord] = useState<boolean>(
    editingSoul?.consentToRecord || false
  );

  // 8. Observation
  const [observation, setObservation] = useState<string>(editingSoul?.observation || '');

  // UI feedback
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [savedSoulModal, setSavedSoulModal] = useState<NewSoul | null>(null);

  // Re-sync state when editingSoul prop changes
  useEffect(() => {
    if (editingSoul) {
      setAccueilMode(editingSoul.accueilMode || 'long');
      setWelcomeContextType(editingSoul.welcomeContextType || 'Culte');
      setWelcomeMeetingDay(editingSoul.welcomeMeetingDay || 'Mardi');
      setReceptionDateIso(toIsoDateInput(editingSoul.receptionDate));
      setGender(editingSoul.gender || 'HOMME');
      setLastName(editingSoul.lastName || '');
      setFirstNames(editingSoul.firstNames || '');
      setPhoneNumber(editingSoul.phoneNumber || '');
      setCommune(editingSoul.commune || 'Yopougon');
      setQuartier(editingSoul.quartier || '');
      setSecteur(editingSoul.secteur || '');
      setAddressLandmark(editingSoul.addressLandmark || '');
      setGps(editingSoul.gps || '');
      setStayDuration(editingSoul.stayDuration || 'Permanent');
      setCanReceiveVisit(editingSoul.canReceiveVisit !== undefined ? editingSoul.canReceiveVisit : true);
      setVisitDay(editingSoul.visitDay || 'Samedi');
      setVisitTime(editingSoul.visitTime || '16h00');
      setVisitRefusalReason(editingSoul.visitRefusalReason || '');
      setArrivalContext(editingSoul.arrivalContext || 'Librement');
      setArrivalSubContext(editingSoul.arrivalSubContext || '');
      setArrivalReferrerName(editingSoul.arrivalReferrerName || '');
      setIsChristian(Boolean(editingSoul.isChristian));
      setIsAssemblyMember(Boolean(editingSoul.isAssemblyMember));
      setIsBaptized(Boolean(editingSoul.isBaptized));
      setIsActiveInDepartment(Boolean(editingSoul.isActiveInDepartment));
      setConsentToContact(Boolean(editingSoul.consentToContact));
      setConsentToContactDateLong(editingSoul.consentToContactDateLong || '');
      setConsentToRecord(Boolean(editingSoul.consentToRecord));
      setObservation(editingSoul.observation || '');
      setFormError(null);
    }
  }, [editingSoul]);

  // Duplicate phone key detection
  const duplicateSoul = phoneNumber.trim().length >= 6
    ? findSoulByPhone(phoneNumber, editingSoul?.id)
    : undefined;

  const handleCommuneChange = (newCommune: string) => {
    setCommune(newCommune);
    const nextQuartiers = getQuartiers(newCommune);
    const firstQ = nextQuartiers[0] || '';
    setQuartier(firstQ);
    const nextSecteurs = getSecteurs(newCommune, firstQ);
    setSecteur(nextSecteurs[0] || '');
  };

  const handleQuartierChange = (newQuartier: string) => {
    setQuartier(newQuartier);
    const nextSecteurs = getSecteurs(commune, newQuartier);
    setSecteur(nextSecteurs[0] || '');
  };

  const handleCaptureGps = () => {
    if (!navigator.geolocation) {
      setFormError("La géolocalisation n'est pas prise en charge par ce navigateur.");
      return;
    }
    setLocatingGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = `${pos.coords.latitude.toFixed(6)}, ${pos.coords.longitude.toFixed(6)}`;
        setGps(coords);
        setLocatingGps(false);
      },
      () => {
        setFormError("Impossible de récupérer la position GPS. Vous pouvez la saisir manuellement.");
        setLocatingGps(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handleReset = () => {
    setFormError(null);
    setLastName('');
    setFirstNames('');
    setPhoneNumber('');
    setAddressLandmark('');
    setGps('');
    setStayDuration('Permanent');
    setCanReceiveVisit(true);
    setVisitDay('Samedi');
    setVisitTime('16h00');
    setVisitRefusalReason('');
    setArrivalContext('Librement');
    setArrivalSubContext('');
    setArrivalReferrerName('');
    setIsChristian(false);
    setIsAssemblyMember(false);
    setIsBaptized(false);
    setIsActiveInDepartment(false);
    setConsentToContact(false);
    setConsentToContactDateLong('');
    setConsentToRecord(false);
    setObservation('');
    setSavedSoulModal(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (duplicateSoul) {
      setFormError(
        `Le numéro ${phoneNumber} existe déjà dans le registre (${duplicateSoul.firstNames} ${duplicateSoul.lastName}). Ouvrez la fiche existante pour la compléter.`
      );
      return;
    }

    if (!lastName.trim() || !firstNames.trim() || !phoneNumber.trim()) {
      setFormError("Veuillez renseigner le nom, les prénoms et le numéro de téléphone.");
      return;
    }

    if (!commune || !quartier || !secteur) {
      setFormError("Veuillez sélectionner la commune, le quartier et le secteur.");
      return;
    }

    if (!consentToContact) {
      setFormError(
        "L'accord explicite de l'âme pour être contactée est obligatoire avant validation."
      );
      return;
    }

    if (!consentToRecord) {
      setFormError(
        "L'accord explicite de l'âme pour l'enregistrement de ses données personnelles est obligatoire."
      );
      return;
    }

    if (accueilMode === 'long' && !canReceiveVisit && !visitRefusalReason.trim()) {
      setFormError("Veuillez indiquer le motif en cas de refus de visite à domicile.");
      return;
    }

    const effectiveContactDateLong =
      consentToContactDateLong || formatLongDateFr(new Date());

    const shortReceptionDate = formatShortDateFr(receptionDateIso);

    const payloadBase = {
      accueilMode,
      welcomeContextType,
      welcomeMeetingDay:
        welcomeContextType === 'Réunion du soir' ? welcomeMeetingDay : '',
      receptionDate: shortReceptionDate,
      gender,
      lastName: lastName.trim().toUpperCase(),
      firstNames: firstNames.trim(),
      phoneNumber: phoneNumber.trim(),
      commune,
      quartier,
      secteur,
      addressLandmark: addressLandmark.trim(),
      gps: accueilMode === 'long' ? gps.trim() : editingSoul?.gps || '',
      stayDuration: accueilMode === 'long' ? stayDuration : editingSoul?.stayDuration,
      canReceiveVisit:
        accueilMode === 'long' ? canReceiveVisit : editingSoul?.canReceiveVisit,
      visitDay:
        accueilMode === 'long' && canReceiveVisit ? visitDay : editingSoul?.visitDay || '',
      visitTime:
        accueilMode === 'long' && canReceiveVisit ? visitTime : editingSoul?.visitTime || '',
      visitRefusalReason:
        accueilMode === 'long' && !canReceiveVisit
          ? visitRefusalReason.trim()
          : editingSoul?.visitRefusalReason || '',
      arrivalContext:
        accueilMode === 'long' ? arrivalContext : editingSoul?.arrivalContext,
      arrivalSubContext:
        accueilMode === 'long'
          ? arrivalContext === 'Librement'
            ? ''
            : arrivalSubContext || (arrivalContext === 'Membre' ? 'Recommandation' : 'Annonce')
          : editingSoul?.arrivalSubContext,
      arrivalReferrerName:
        accueilMode === 'long' && arrivalContext !== 'Librement'
          ? arrivalReferrerName.trim()
          : editingSoul?.arrivalReferrerName || '',
      isChristian,
      isAssemblyMember:
        accueilMode === 'long' && isChristian
          ? isAssemblyMember
          : editingSoul?.isAssemblyMember,
      isBaptized:
        accueilMode === 'long' && isChristian ? isBaptized : editingSoul?.isBaptized,
      isActiveInDepartment:
        accueilMode === 'long' && isChristian && isBaptized
          ? isActiveInDepartment
          : editingSoul?.isActiveInDepartment,
      consentToContact: true,
      consentToContactDateLong: effectiveContactDateLong,
      consentToRecord: true,
      recordedById: editingSoul?.recordedById || currentHost?.id || '',
      recordedByName:
        editingSoul?.recordedByName ||
        (currentHost ? `${currentHost.firstNames} ${currentHost.lastName}` : 'Hôte'),
      recordedByPhone: editingSoul?.recordedByPhone || currentHost?.phone || '',
      observation: accueilMode === 'long' ? observation.trim() : editingSoul?.observation || '',
    };

    setIsSubmitting(true);
    try {
      if (isEditing && editingSoul) {
        await updateSoul(editingSoul.id, payloadBase);
        setSavedSoulModal({ ...editingSoul, ...payloadBase });
      } else {
        const newId = await addNewSoul(payloadBase);
        setSavedSoulModal({
          ...payloadBase,
          id: newId,
          normalizedPhone: phoneNumber.trim(),
          followUpState: 'en_attente_decision',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Erreur lors de l'enregistrement dans Firebase."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const daysOfWeek = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

  const cleanPhone = (phone: string) => phone.replace(/[^0-9+]/g, '');

  return (
    <div className="max-w-5xl mx-auto py-6 px-4 sm:px-6">
      {/* Header Container - Uniform Indigo/Purple without orange bar */}
      <div className="bg-indigo-950 rounded-[5px] p-5 sm:p-6 text-white shadow-2xs mb-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[11px] font-bold tracking-widest text-indigo-200 uppercase">
              Service d'Accueil & de Suivi
            </span>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight mt-0.5">
              {isEditing
                ? `Compléter la fiche : ${editingSoul?.firstNames} ${editingSoul?.lastName}`
                : 'Recevoir — Enregistrement d’une Âme'}
            </h1>
            <p className="text-xs text-indigo-200 mt-1">
              Date courte : {formatShortDateFr(receptionDateIso)} · Date d'édition :{' '}
              {formatDateFr(receptionDateIso)}
            </p>
          </div>

          <div className="flex items-center space-x-1 bg-indigo-900 p-1 rounded-[5px] border border-indigo-800 shrink-0 self-start">
            <button
              type="button"
              onClick={() => setAccueilMode('express')}
              className={`px-3 py-1.5 text-xs font-bold rounded-[5px] transition ${
                accueilMode === 'express'
                  ? 'bg-white text-indigo-950'
                  : 'text-indigo-200 hover:text-white'
              }`}
            >
              Accueil Express
            </button>
            <button
              type="button"
              onClick={() => setAccueilMode('long')}
              className={`px-3 py-1.5 text-xs font-bold rounded-[5px] transition ${
                accueilMode === 'long'
                  ? 'bg-white text-indigo-950'
                  : 'text-indigo-200 hover:text-white'
              }`}
            >
              Accueil Long
            </button>
          </div>
        </div>
      </div>

      {/* Warning banner for Accueil Express */}
      {accueilMode === 'express' && (
        <div className="mb-5 p-3.5 bg-amber-50 border border-amber-300 rounded-[5px] flex items-start space-x-2.5 text-xs text-amber-950">
          <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Mode Accueil Express (Enregistrement partiel)</p>
            <p className="mt-0.5">
              Seuls les champs essentiels sont affichés pour une réception rapide. Les champs résiduels
              pourront être complétés plus tard en <strong>Accueil Long</strong>. La fermeture d'un
              suivi n'est possible qu'une fois l'Accueil Long complété.
            </p>
          </div>
        </div>
      )}

      {formError && (
        <div className="mb-5 p-3.5 bg-rose-50 border border-rose-300 rounded-[5px] text-xs font-semibold text-rose-900">
          {formError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* 1. Contexte d'accueil */}
        <div className="bg-white rounded-[5px] p-5 border border-slate-200 shadow-2xs">
          <h2 className="text-sm font-bold uppercase tracking-wider text-indigo-950 border-b border-slate-200 pb-2.5 mb-4">
            1. Contexte d'Accueil
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                Événement d'accueil <span className="text-rose-600">*</span>
              </label>
              <select
                value={welcomeContextType}
                onChange={(e) => setWelcomeContextType(e.target.value as WelcomeContextType)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-[5px] text-xs font-semibold text-slate-900 outline-none focus:border-indigo-700"
              >
                {WELCOME_CONTEXT_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            {welcomeContextType === 'Réunion du soir' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                  Jour de réunion <span className="text-rose-600">*</span>
                </label>
                <select
                  value={welcomeMeetingDay}
                  onChange={(e) => setWelcomeMeetingDay(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-[5px] text-xs font-semibold text-slate-900 outline-none focus:border-indigo-700"
                >
                  <option value="Mardi">Mardi</option>
                  <option value="Jeudi">Jeudi</option>
                </select>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase">
                  Date courte <span className="text-rose-600">*</span>
                </label>
                <span className="text-[11px] font-mono font-semibold text-indigo-900">
                  {formatShortDateFr(receptionDateIso)}
                </span>
              </div>
              <div className="relative">
                <input
                  type="date"
                  required
                  value={receptionDateIso}
                  onChange={(e) => setReceptionDateIso(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-[5px] text-xs font-medium text-slate-900 outline-none focus:border-indigo-700"
                />
                <Calendar className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* 2. Identité (Téléphone = clé unique) */}
        <div className="bg-white rounded-[5px] p-5 border border-slate-200 shadow-2xs">
          <h2 className="text-sm font-bold uppercase tracking-wider text-indigo-950 border-b border-slate-200 pb-2.5 mb-4">
            2. Identité de l'Âme
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                Téléphone (Clé unique) <span className="text-rose-600">*</span>
              </label>
              <div className="relative">
                <input
                  type="tel"
                  required
                  placeholder="Ex: 0700112233"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className={`w-full px-3 py-2 bg-slate-50 border rounded-[5px] text-xs font-bold font-mono text-slate-900 outline-none focus:bg-white ${
                    duplicateSoul ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-300 focus:border-indigo-700'
                  }`}
                />
                <Phone className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                Nom <span className="text-rose-600">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="Ex: KOUASSI"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-[5px] text-xs font-medium text-slate-900 uppercase outline-none focus:bg-white focus:border-indigo-700"
                />
                <User className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                Prénoms <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Emmanuel"
                value={firstNames}
                onChange={(e) => setFirstNames(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-[5px] text-xs font-medium text-slate-900 capitalize outline-none focus:bg-white focus:border-indigo-700"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                Catégorie / Genre
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as SoulGender)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-[5px] text-xs font-semibold text-slate-900 outline-none focus:border-indigo-700"
              >
                <option value="HOMME">HOMME</option>
                <option value="FEMME">FEMME</option>
                <option value="JEUNE">JEUNE</option>
                <option value="ENFANT">ENFANT</option>
              </select>
            </div>
          </div>

          {/* Alerte doublon téléphone */}
          {duplicateSoul && (
            <div className="mt-4 p-3.5 bg-rose-50 border border-rose-300 rounded-[5px] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="text-rose-950">
                <p className="font-bold">
                  Doublon détecté : Ce numéro appartient déjà à {duplicateSoul.firstNames}{' '}
                  {duplicateSoul.lastName}
                </p>
                <p className="text-rose-800 mt-0.5">
                  Mode actuel :{' '}
                  <strong>
                    {duplicateSoul.accueilMode === 'express' ? 'Accueil Express (Partiel)' : 'Accueil Long'}
                  </strong>{' '}
                  · Reçu(e) le {duplicateSoul.receptionDate} ({duplicateSoul.commune} / {duplicateSoul.quartier})
                </p>
              </div>
              {onSelectExistingSoulToEdit && (
                <button
                  type="button"
                  onClick={() => onSelectExistingSoulToEdit(duplicateSoul)}
                  className="inline-flex items-center space-x-1.5 px-3 py-2 bg-indigo-900 hover:bg-indigo-800 text-white rounded-[5px] font-bold shrink-0"
                >
                  <span>Ouvrir la fiche existante pour la compléter</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* 3. Localisation */}
        <div className="bg-white rounded-[5px] p-5 border border-slate-200 shadow-2xs">
          <h2 className="text-sm font-bold uppercase tracking-wider text-indigo-950 border-b border-slate-200 pb-2.5 mb-4">
            3. Localisation
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                Commune <span className="text-rose-600">*</span>
              </label>
              <select
                value={commune}
                onChange={(e) => handleCommuneChange(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-[5px] text-xs font-semibold text-slate-900 outline-none focus:border-indigo-700"
              >
                {communes.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                Quartier <span className="text-rose-600">*</span>
              </label>
              <select
                value={quartier}
                onChange={(e) => handleQuartierChange(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-[5px] text-xs font-semibold text-slate-900 outline-none focus:border-indigo-700"
              >
                {quartiers.map((q) => (
                  <option key={q} value={q}>
                    {q}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                Secteur <span className="text-rose-600">*</span>
              </label>
              <select
                value={secteur}
                onChange={(e) => setSecteur(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-[5px] text-xs font-semibold text-slate-900 outline-none focus:border-indigo-700"
              >
                {secteurs.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
            <div className={accueilMode === 'express' ? 'sm:col-span-3' : ''}>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                Repère
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Ex: Face à la pharmacie, portail bleu"
                  value={addressLandmark}
                  onChange={(e) => setAddressLandmark(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-[5px] text-xs font-medium text-slate-900 outline-none focus:bg-white focus:border-indigo-700"
                />
                <Navigation className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
              </div>
            </div>

            {accueilMode === 'long' && (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                    GPS (Coordonnées)
                  </label>
                  <div className="flex space-x-1.5">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        placeholder="Lat, Lng ou lien Maps"
                        value={gps}
                        onChange={(e) => setGps(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-[5px] text-xs font-mono text-slate-900 outline-none focus:bg-white focus:border-indigo-700"
                      />
                      <MapPin className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
                    </div>
                    <button
                      type="button"
                      onClick={handleCaptureGps}
                      disabled={locatingGps}
                      title="Capturer la position actuelle"
                      className="px-2.5 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-[5px] text-slate-700 text-xs font-bold shrink-0"
                    >
                      <Crosshair className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                    Durée sur place
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['Permanent', 'Provisoire'] as StayDuration[]).map((dur) => (
                      <button
                        key={dur}
                        type="button"
                        onClick={() => setStayDuration(dur)}
                        className={`py-2 px-3 rounded-[5px] border text-xs font-bold transition ${
                          stayDuration === dur
                            ? 'bg-indigo-900 border-indigo-900 text-white'
                            : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {dur}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* 4. Visite à domicile & Contexte d'arrivée (Accueil Long uniquement) */}
        {accueilMode === 'long' && (
          <>
            <div className="bg-white rounded-[5px] p-5 border border-slate-200 shadow-2xs">
              <h2 className="text-sm font-bold uppercase tracking-wider text-indigo-950 border-b border-slate-200 pb-2.5 mb-4">
                4. Visite à Domicile
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                    Peut-elle recevoir de la visite ?
                  </label>
                  <div className="grid grid-cols-2 gap-2 max-w-xs">
                    <button
                      type="button"
                      onClick={() => setCanReceiveVisit(true)}
                      className={`py-2 px-3 rounded-[5px] border text-xs font-bold ${
                        canReceiveVisit
                          ? 'bg-indigo-900 border-indigo-900 text-white'
                          : 'bg-white border-slate-300 text-slate-700'
                      }`}
                    >
                      OUI
                    </button>
                    <button
                      type="button"
                      onClick={() => setCanReceiveVisit(false)}
                      className={`py-2 px-3 rounded-[5px] border text-xs font-bold ${
                        !canReceiveVisit
                          ? 'bg-rose-900 border-rose-900 text-white'
                          : 'bg-white border-slate-300 text-slate-700'
                      }`}
                    >
                      NON
                    </button>
                  </div>
                </div>

                {canReceiveVisit ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-3 rounded-[5px] border border-slate-200">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                        Jour de visite souhaité
                      </label>
                      <select
                        value={visitDay}
                        onChange={(e) => setVisitDay(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-[5px] text-xs font-medium text-slate-900"
                      >
                        {daysOfWeek.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                        <option value="En semaine">En semaine</option>
                        <option value="Samedi ou Dimanche">Samedi ou Dimanche</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                        Heure souhaitée
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: 16h00"
                        value={visitTime}
                        onChange={(e) => setVisitTime(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-[5px] text-xs font-medium text-slate-900"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="bg-amber-50 p-3 rounded-[5px] border border-amber-300">
                    <label className="block text-xs font-bold text-amber-950 uppercase mb-1">
                      Motif du refus de visite <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="text"
                      required={!canReceiveVisit}
                      placeholder="Ex: Contraintes professionnelles, préfère un appel..."
                      value={visitRefusalReason}
                      onChange={(e) => setVisitRefusalReason(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-amber-300 rounded-[5px] text-xs text-slate-900"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-[5px] p-5 border border-slate-200 shadow-2xs">
              <h2 className="text-sm font-bold uppercase tracking-wider text-indigo-950 border-b border-slate-200 pb-2.5 mb-4">
                5. Contexte d'Arrivée
              </h2>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {(['Membre', 'Invitation', 'Librement'] as ArrivalContextType[]).map((ctx) => (
                    <button
                      key={ctx}
                      type="button"
                      onClick={() => {
                        setArrivalContext(ctx);
                        if (ctx === 'Membre') setArrivalSubContext('Recommandation');
                        else if (ctx === 'Invitation') setArrivalSubContext('Annonce');
                        else setArrivalSubContext('');
                      }}
                      className={`py-2 px-3 rounded-[5px] border text-xs font-bold transition ${
                        arrivalContext === ctx
                          ? 'bg-indigo-900 border-indigo-900 text-white'
                          : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {ctx}
                    </button>
                  ))}
                </div>

                {arrivalContext === 'Membre' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-3 rounded-[5px] border border-slate-200">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                        Précision (Membre)
                      </label>
                      <select
                        value={arrivalSubContext || 'Recommandation'}
                        onChange={(e) => setArrivalSubContext(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-[5px] text-xs font-semibold text-slate-900"
                      >
                        <option value="Recommandation">Recommandation</option>
                        <option value="Sans recommandation">Sans recommandation</option>
                      </select>
                    </div>
                    {arrivalSubContext !== 'Sans recommandation' && (
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                          Nom du recommandataire
                        </label>
                        <input
                          type="text"
                          placeholder="Nom et prénoms"
                          value={arrivalReferrerName}
                          onChange={(e) => setArrivalReferrerName(e.target.value)}
                          className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-[5px] text-xs text-slate-900"
                        />
                      </div>
                    )}
                  </div>
                )}

                {arrivalContext === 'Invitation' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-3 rounded-[5px] border border-slate-200">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                        Source de l'invitation
                      </label>
                      <select
                        value={arrivalSubContext || 'Annonce'}
                        onChange={(e) => setArrivalSubContext(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-[5px] text-xs font-semibold text-slate-900"
                      >
                        <option value="Annonce">Annonce</option>
                        <option value="Membre">Membre</option>
                      </select>
                    </div>
                    {arrivalSubContext === 'Membre' && (
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                          Nom du membre ayant invité
                        </label>
                        <input
                          type="text"
                          placeholder="Nom et prénoms du membre"
                          value={arrivalReferrerName}
                          onChange={(e) => setArrivalReferrerName(e.target.value)}
                          className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-[5px] text-xs text-slate-900"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* 6. Vie spirituelle (Cascade) */}
        <div className="bg-white rounded-[5px] p-5 border border-slate-200 shadow-2xs">
          <h2 className="text-sm font-bold uppercase tracking-wider text-indigo-950 border-b border-slate-200 pb-2.5 mb-4">
            {accueilMode === 'long' ? '6. Vie Spirituelle' : '4. Vie Spirituelle'}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                Chrétien ? <span className="text-rose-600">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setIsChristian(true)}
                  className={`py-2 rounded-[5px] border text-xs font-bold ${
                    isChristian
                      ? 'bg-indigo-900 border-indigo-900 text-white'
                      : 'bg-white border-slate-300 text-slate-700'
                  }`}
                >
                  Oui
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsChristian(false);
                    setIsAssemblyMember(false);
                    setIsBaptized(false);
                    setIsActiveInDepartment(false);
                  }}
                  className={`py-2 rounded-[5px] border text-xs font-bold ${
                    !isChristian
                      ? 'bg-slate-800 border-slate-800 text-white'
                      : 'bg-white border-slate-300 text-slate-700'
                  }`}
                >
                  Non
                </button>
              </div>
            </div>

            {accueilMode === 'long' && isChristian && (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                    Membre de l'assemblée ?
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setIsAssemblyMember(true)}
                      className={`py-2 rounded-[5px] border text-xs font-bold ${
                        isAssemblyMember
                          ? 'bg-indigo-900 border-indigo-900 text-white'
                          : 'bg-white border-slate-300 text-slate-700'
                      }`}
                    >
                      Oui
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsAssemblyMember(false)}
                      className={`py-2 rounded-[5px] border text-xs font-bold ${
                        !isAssemblyMember
                          ? 'bg-slate-800 border-slate-800 text-white'
                          : 'bg-white border-slate-300 text-slate-700'
                      }`}
                    >
                      Non
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                    Baptisé(e) ?
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setIsBaptized(true)}
                      className={`py-2 rounded-[5px] border text-xs font-bold ${
                        isBaptized
                          ? 'bg-indigo-900 border-indigo-900 text-white'
                          : 'bg-white border-slate-300 text-slate-700'
                      }`}
                    >
                      Oui
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsBaptized(false);
                        setIsActiveInDepartment(false);
                      }}
                      className={`py-2 rounded-[5px] border text-xs font-bold ${
                        !isBaptized
                          ? 'bg-slate-800 border-slate-800 text-white'
                          : 'bg-white border-slate-300 text-slate-700'
                      }`}
                    >
                      Non
                    </button>
                  </div>
                </div>

                {isBaptized && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                      Actif dans un département ?
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setIsActiveInDepartment(true)}
                        className={`py-2 rounded-[5px] border text-xs font-bold ${
                          isActiveInDepartment
                            ? 'bg-indigo-900 border-indigo-900 text-white'
                            : 'bg-white border-slate-300 text-slate-700'
                        }`}
                      >
                        Oui
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsActiveInDepartment(false)}
                        className={`py-2 rounded-[5px] border text-xs font-bold ${
                          !isActiveInDepartment
                            ? 'bg-slate-800 border-slate-800 text-white'
                            : 'bg-white border-slate-300 text-slate-700'
                        }`}
                      >
                        Non
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Consentements & Observation */}
        <div className="bg-white rounded-[5px] p-5 border border-slate-200 shadow-2xs space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-indigo-950 border-b border-slate-200 pb-2.5">
            Consentements & Validation
          </h2>

          <div className="space-y-3">
            <label className="flex items-start space-x-3 p-3 bg-slate-50 border border-slate-200 rounded-[5px] cursor-pointer">
              <input
                type="checkbox"
                checked={consentToContact}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setConsentToContact(checked);
                  if (checked) {
                    setConsentToContactDateLong(formatLongDateFr(new Date()));
                  } else {
                    setConsentToContactDateLong('');
                  }
                }}
                className="mt-0.5 h-4 w-4 text-indigo-900 border-slate-300 rounded-[3px]"
              />
              <div className="text-xs">
                <span className="font-bold text-slate-900">
                  Accord pour contacter <span className="text-rose-600">*</span>
                </span>
                <p className="text-slate-600 mt-0.5">
                  L'âme donne librement et volontairement son accord explicite pour être contactée dans le cadre de son accompagnement.
                </p>
                {consentToContact && consentToContactDateLong && (
                  <p className="text-[11px] font-mono text-indigo-900 font-semibold mt-1">
                    Acté le : {consentToContactDateLong}
                  </p>
                )}
              </div>
            </label>

            <label className="flex items-start space-x-3 p-3 bg-slate-50 border border-slate-200 rounded-[5px] cursor-pointer">
              <input
                type="checkbox"
                checked={consentToRecord}
                onChange={(e) => setConsentToRecord(e.target.checked)}
                className="mt-0.5 h-4 w-4 text-indigo-900 border-slate-300 rounded-[3px]"
              />
              <div className="text-xs">
                <span className="font-bold text-slate-900">
                  Accord pour enregistrement <span className="text-rose-600">*</span>
                </span>
                <p className="text-slate-600 mt-0.5">
                  L'âme consent librement et explicitement à l'enregistrement de ses données personnelles avant validation de cette fiche.
                </p>
              </div>
            </label>
          </div>

          {accueilMode === 'long' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                Observation / Requête de prière
              </label>
              <textarea
                rows={3}
                placeholder="Notes complémentaires recueillies lors de la réception..."
                value={observation}
                onChange={(e) => setObservation(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-[5px] text-xs text-slate-900 outline-none focus:bg-white focus:border-indigo-700"
              />
            </div>
          )}

          <div className="text-xs text-slate-500 pt-1">
            Enregistré par :{' '}
            <strong className="text-slate-800">
              {currentHost ? `${currentHost.firstNames} ${currentHost.lastName}` : '-'}
            </strong>
            {currentHost?.phone && ` (${currentHost.phone})`}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-2.5 pt-2">
          {isEditing && onCancelEdit ? (
            <button
              type="button"
              onClick={onCancelEdit}
              className="w-full sm:w-auto px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-[5px] text-xs font-bold"
            >
              Annuler la modification
            </button>
          ) : (
            <button
              type="button"
              onClick={handleReset}
              className="w-full sm:w-auto px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-[5px] text-xs font-bold"
            >
              Réinitialiser
            </button>
          )}

          <button
            type="submit"
            disabled={isSubmitting || Boolean(duplicateSoul)}
            className="w-full sm:w-auto px-6 py-2.5 bg-indigo-900 hover:bg-indigo-800 text-white rounded-[5px] text-xs font-bold shadow-2xs transition disabled:opacity-50"
          >
            {isSubmitting
              ? 'Enregistrement dans Firebase...'
              : isEditing
              ? 'Mettre à jour la fiche'
              : `Valider (${accueilMode === 'express' ? 'Accueil Express' : 'Accueil Long'})`}
          </button>
        </div>
      </form>

      {/* Success Modal */}
      {savedSoulModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-2xs">
          <div className="bg-white rounded-[5px] max-w-md w-full p-6 border border-slate-300 shadow-xl">
            <div className="w-10 h-10 rounded-[5px] bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 text-center">
              {isEditing ? 'Fiche Mise à Jour dans Firebase' : 'Âme Enregistrée dans Firebase'}
            </h3>
            <p className="text-xs text-slate-600 text-center mt-1 mb-5">
              <strong>
                {savedSoulModal.firstNames} {savedSoulModal.lastName}
              </strong>{' '}
              ({savedSoulModal.commune} · {savedSoulModal.quartier} · {savedSoulModal.secteur}) a
              bien été sauvegardé(e) en mode{' '}
              <strong>
                {savedSoulModal.accueilMode === 'express' ? 'Accueil Express' : 'Accueil Long'}
              </strong>
              .
            </p>

            <div className="space-y-2">
              <a
                href={`https://wa.me/${cleanPhone(savedSoulModal.phoneNumber)}?text=${encodeURIComponent(
                  `Chalom ${savedSoulModal.firstNames},\nNous vous remercions chaleureusement pour votre présence (${savedSoulModal.welcomeContextType}). Que Dieu vous bénisse abondamment !`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="w-full flex items-center justify-center space-x-2 py-2 px-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-[5px] text-xs font-bold"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Message WhatsApp de Bienvenue</span>
              </a>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setSavedSoulModal(null);
                    if (isEditing && onCancelEdit) {
                      onCancelEdit();
                    } else {
                      handleReset();
                    }
                  }}
                  className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-[5px] text-xs font-bold"
                >
                  {isEditing ? 'Continuer' : '+ Recevoir une autre Âme'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSavedSoulModal(null);
                    if (onSuccessNavigate) onSuccessNavigate();
                  }}
                  className="py-2 px-3 bg-indigo-900 hover:bg-indigo-800 text-white rounded-[5px] text-xs font-bold"
                >
                  Voir Registre & Assignation
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
