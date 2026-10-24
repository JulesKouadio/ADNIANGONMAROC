import React, { useState } from 'react';
import { 
  Calendar, 
  User, 
  Phone, 
  MapPin, 
  Navigation, 
  Users, 
  Clock, 
  HeartHandshake, 
  CheckCircle2, 
  Send, 
  Printer, 
  Plus
} from 'lucide-react';
import { useChurch } from '../context/ChurchContext';
import { SoulGender } from '../types';
import { formatDateFr } from '../utils/date';

interface SoulRegistrationFormProps {
  onSuccessNavigate?: () => void;
}

export const SoulRegistrationForm: React.FC<SoulRegistrationFormProps> = ({ onSuccessNavigate }) => {
  const { 
    prayerCells, 
    addNewSoul, 
    savedRecorder, 
    setSavedRecorder,
    addPrayerCell 
  } = useChurch();

  // Form states
  const todayStr = new Date().toISOString().split('T')[0];
  const [receptionDate, setReceptionDate] = useState<string>(todayStr);
  const [gender, setGender] = useState<SoulGender>('HOMME');
  const [lastName, setLastName] = useState<string>('');
  const [firstNames, setFirstNames] = useState<string>('');
  const [neighborhood, setNeighborhood] = useState<string>('');
  const [addressLandmark, setAddressLandmark] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [prayerCell, setPrayerCell] = useState<string>(prayerCells[0]?.name || '');

  // Visit states
  const [canReceiveVisit, setCanReceiveVisit] = useState<boolean>(true);
  const [visitDay, setVisitDay] = useState<string>('Samedi');
  const [visitTime, setVisitTime] = useState<string>('16h00');
  const [visitRefusalReason, setVisitRefusalReason] = useState<string>('');

  // Acquaintance states
  const [knowsSomeoneInChurch, setKnowsSomeoneInChurch] = useState<boolean>(false);
  const [knownPersonName, setKnownPersonName] = useState<string>('');

  // Recorder states
  const [recordedByName, setRecordedByName] = useState<string>(savedRecorder.name || '');
  const [recordedByPhone, setRecordedByPhone] = useState<string>(savedRecorder.phone || '');

  // Observation state
  const [observation, setObservation] = useState<string>('');

  // UI state
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [createdSoulData, setCreatedSoulData] = useState<any | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
  const [showNewCellQuickModal, setShowNewCellQuickModal] = useState<boolean>(false);
  const [newCellName, setNewCellName] = useState('');
  const [newCellLeader, setNewCellLeader] = useState('');
  const [newCellPhone, setNewCellPhone] = useState('');

  // Automatically select first cell when cells are loaded or created
  React.useEffect(() => {
    if ((!prayerCell || !prayerCells.some(c => c.name === prayerCell)) && prayerCells.length > 0) {
      setPrayerCell(prayerCells[0].name);
    }
  }, [prayerCells, prayerCell]);

  const genderOptions: { label: SoulGender; sub: string }[] = [
    { label: 'HOMME', sub: 'Homme adulte' },
    { label: 'FEMME', sub: 'Femme adulte' },
    { label: 'JEUNE', sub: 'Jeune / Étudiant' },
    { label: 'ENFANT', sub: 'Enfant' },
  ];

  const daysOfWeek = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!lastName.trim() || !firstNames.trim()) {
      alert("Veuillez renseigner le nom et les prénoms de la personne.");
      return;
    }

    if (!phoneNumber.trim()) {
      alert("Veuillez renseigner le numéro de téléphone de contact.");
      return;
    }

    if (!neighborhood.trim()) {
      alert("Veuillez renseigner le quartier d'habitation.");
      return;
    }

    if (!recordedByName.trim()) {
      alert("Veuillez renseigner le nom de la personne qui effectue l'enregistrement.");
      return;
    }

    if (!canReceiveVisit && !visitRefusalReason.trim()) {
      alert("Veuillez indiquer la raison du refus de visite afin de guider le suivi.");
      return;
    }

    if (knowsSomeoneInChurch && !knownPersonName.trim()) {
      alert("Veuillez indiquer le nom de la personne connue dans l'église.");
      return;
    }

    // Save recorder info for future fast input
    setSavedRecorder({
      name: recordedByName.trim(),
      phone: recordedByPhone.trim(),
    });

    setIsSubmitting(true);

    const soulPayload = {
      receptionDate: formatDateFr(receptionDate),
      gender,
      lastName: lastName.trim().toUpperCase(),
      firstNames: firstNames.trim(),
      neighborhood: neighborhood.trim(),
      addressLandmark: addressLandmark.trim(),
      phoneNumber: phoneNumber.trim(),
      prayerCell: prayerCell || (prayerCells[0]?.name ?? 'Cellule Principale'),
      canReceiveVisit,
      visitDay: canReceiveVisit ? visitDay : '',
      visitTime: canReceiveVisit ? visitTime : '',
      visitRefusalReason: !canReceiveVisit ? visitRefusalReason.trim() : '',
      knowsSomeoneInChurch,
      knownPersonName: knowsSomeoneInChurch ? knownPersonName.trim() : '',
      recordedByName: recordedByName.trim(),
      recordedByPhone: recordedByPhone.trim(),
      observation: observation.trim(),
      followUpStatus: 'nouveau' as const,
    };

    try {
      const id = await addNewSoul(soulPayload);
      setCreatedSoulData({ ...soulPayload, id });
      setShowSuccessModal(true);
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l'enregistrement de la fiche.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setLastName('');
    setFirstNames('');
    setNeighborhood('');
    setAddressLandmark('');
    setPhoneNumber('');
    setObservation('');
    setKnowsSomeoneInChurch(false);
    setKnownPersonName('');
    setCanReceiveVisit(true);
    setVisitRefusalReason('');
    setShowSuccessModal(false);
    setCreatedSoulData(null);
  };

  const handleAddQuickCell = async () => {
    if (!newCellName.trim() || !newCellLeader.trim() || !newCellPhone.trim()) {
      alert("Remplissez le nom de la cellule, le nom du responsable et son numéro.");
      return;
    }
    const newId = await addPrayerCell({
      name: newCellName.trim(),
      neighborhood: neighborhood.trim() || 'Secteur église',
      leaderName: newCellLeader.trim(),
      leaderPhone: newCellPhone.trim(),
      meetingDay: 'Mercredi',
      meetingTime: '18h30 - 20h00',
    });
    setPrayerCell(newCellName.trim());
    setShowNewCellQuickModal(false);
    setNewCellName('');
    setNewCellLeader('');
    setNewCellPhone('');
  };

  const formatCleanPhone = (phone: string) => {
    return phone.replace(/[^0-9+]/g, '');
  };

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6">
      {/* Official Header */}
      <div className="bg-indigo-950 rounded-[5px] p-6 text-white shadow-xs mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-[11px] font-bold tracking-widest text-indigo-200 uppercase">
              Service d'Accueil & de Suivi
            </span>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-0.5">
              Fiche d'Enregistrement d'une Nouvelle Âme
            </h1>
            <p className="text-xs text-indigo-200 mt-1 max-w-2xl">
              Renseignez les données pour attribuer immédiatement une cellule de prière et planifier le suivi.
            </p>
          </div>
          <div className="text-right shrink-0">
            <span className="inline-block bg-indigo-900 border border-indigo-800 text-indigo-200 text-xs px-2.5 py-1 rounded-[5px] font-mono">
              Date : {formatDateFr(receptionDate)}
            </span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Réception & Genre */}
        <div className="bg-white rounded-[5px] p-5 sm:p-6 shadow-2xs border border-slate-200">
          <div className="border-b border-slate-200 pb-3 mb-5">
            <h2 className="text-sm font-bold uppercase tracking-wider text-indigo-950">
              1. Date de Réception & Genre
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                  Date de la réception <span className="text-rose-600">*</span>
                </label>
                <span className="text-[11px] font-bold text-indigo-900 bg-indigo-50 px-2 py-0.5 rounded-[5px] border border-indigo-200 font-mono">
                  {formatDateFr(receptionDate)}
                </span>
              </div>
              <div className="relative">
                <input
                  type="date"
                  required
                  value={receptionDate}
                  onChange={(e) => setReceptionDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-[5px] text-xs font-medium text-slate-900 focus:bg-white focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none"
                />
                <Calendar className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                Genre de la nouvelle personne <span className="text-rose-600">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {genderOptions.map((opt) => (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() => setGender(opt.label)}
                    className={`py-2 px-2 rounded-[5px] border text-center transition-all ${
                      gender === opt.label
                        ? 'bg-indigo-900 border-indigo-900 text-white font-bold shadow-2xs'
                        : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50 font-medium'
                    }`}
                  >
                    <span className="block text-xs font-bold">{opt.label}</span>
                    <span className={`block text-[10px] ${gender === opt.label ? 'text-indigo-200' : 'text-slate-500'}`}>
                      {opt.sub}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Identité */}
        <div className="bg-white rounded-[5px] p-5 sm:p-6 shadow-2xs border border-slate-200">
          <div className="border-b border-slate-200 pb-3 mb-5">
            <h2 className="text-sm font-bold uppercase tracking-wider text-indigo-950">
              2. Identité & Coordonnées
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                Nom <span className="text-rose-600">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="Ex: KOUASSI"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-[5px] text-xs font-medium text-slate-900 uppercase focus:bg-white focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none"
                />
                <User className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                Prénoms <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Emmanuel Jean-Luc"
                value={firstNames}
                onChange={(e) => setFirstNames(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-[5px] text-xs font-medium text-slate-900 capitalize focus:bg-white focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                Numéro de téléphone <span className="text-rose-600">*</span>
              </label>
              <div className="relative">
                <input
                  type="tel"
                  required
                  placeholder="Ex: +225 07 00 11 22 33"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-[5px] text-xs font-bold text-slate-900 tracking-wide focus:bg-white focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none"
                />
                <Phone className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Habitation & Repère (Exact label: "Repère") */}
        <div className="bg-white rounded-[5px] p-5 sm:p-6 shadow-2xs border border-slate-200">
          <div className="border-b border-slate-200 pb-3 mb-5">
            <h2 className="text-sm font-bold uppercase tracking-wider text-indigo-950">
              3. Habitation & Localisation
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                Quartier d'habitation <span className="text-rose-600">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="Ex: Yopougon Maroc, Cocody Riviera 3..."
                  value={neighborhood}
                  onChange={(e) => setNeighborhood(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-[5px] text-xs font-medium text-slate-900 focus:bg-white focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none"
                />
                <MapPin className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                Repère
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Ex: Face à la pharmacie, portail bleu"
                  value={addressLandmark}
                  onChange={(e) => setAddressLandmark(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-[5px] text-xs font-medium text-slate-900 focus:bg-white focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none"
                />
                <Navigation className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Cellule de Prière */}
        <div className="bg-white rounded-[5px] p-5 sm:p-6 shadow-2xs border border-slate-200">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-5">
            <h2 className="text-sm font-bold uppercase tracking-wider text-indigo-950">
              4. Cellule de Prière Confiée
            </h2>
            <button
              type="button"
              onClick={() => setShowNewCellQuickModal(true)}
              className="text-xs font-bold text-indigo-900 hover:underline flex items-center space-x-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Nouvelle cellule</span>
            </button>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
              Cellule de prière attribuée <span className="text-rose-600">*</span>
            </label>
            {prayerCells.length === 0 ? (
              <div className="p-3 bg-slate-50 border border-dashed border-slate-300 rounded-[5px] text-xs">
                <p className="text-slate-700 font-medium mb-2">
                  Aucune cellule de prière n'a encore été créée.
                </p>
                <button
                  type="button"
                  onClick={() => setShowNewCellQuickModal(true)}
                  className="px-3 py-1.5 bg-indigo-900 hover:bg-indigo-800 text-white font-bold rounded-[5px] inline-flex items-center space-x-1 shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Créer la première cellule de prière</span>
                </button>
              </div>
            ) : (
              <select
                value={prayerCell}
                onChange={(e) => setPrayerCell(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-[5px] text-xs font-semibold text-slate-900 focus:bg-white focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none"
              >
                {prayerCells.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name} — Responsable : {c.leaderName} ({c.leaderPhone})
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Section 5: Visite */}
        <div className="bg-white rounded-[5px] p-5 sm:p-6 shadow-2xs border border-slate-200">
          <div className="border-b border-slate-200 pb-3 mb-5">
            <h2 className="text-sm font-bold uppercase tracking-wider text-indigo-950">
              5. Visite à Domicile
            </h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                Peut-elle recevoir de la visite ? <span className="text-rose-600">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3 max-w-sm">
                <button
                  type="button"
                  onClick={() => setCanReceiveVisit(true)}
                  className={`py-2 px-3 rounded-[5px] border text-xs font-bold transition ${
                    canReceiveVisit
                      ? 'bg-indigo-900 border-indigo-900 text-white'
                      : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  OUI
                </button>
                <button
                  type="button"
                  onClick={() => setCanReceiveVisit(false)}
                  className={`py-2 px-3 rounded-[5px] border text-xs font-bold transition ${
                    !canReceiveVisit
                      ? 'bg-rose-900 border-rose-900 text-white'
                      : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  NON
                </button>
              </div>
            </div>

            {canReceiveVisit ? (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-[5px] grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                    Jour de la visite <span className="text-rose-600">*</span>
                  </label>
                  <select
                    value={visitDay}
                    onChange={(e) => setVisitDay(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-[5px] text-xs font-medium text-slate-900 outline-none"
                  >
                    {daysOfWeek.map((day) => (
                      <option key={day} value={day}>{day}</option>
                    ))}
                    <option value="En semaine">En semaine</option>
                    <option value="Samedi ou Dimanche">Samedi ou Dimanche</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                    Heure de la visite <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: 16h00 ou 18h30"
                    value={visitTime}
                    onChange={(e) => setVisitTime(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-[5px] text-xs font-medium text-slate-900 outline-none"
                  />
                </div>
              </div>
            ) : (
              <div className="p-3 bg-amber-50/70 border border-amber-300 rounded-[5px]">
                <label className="block text-xs font-bold text-amber-950 uppercase tracking-wide mb-1">
                  Pourquoi ? (Motif du refus de visite) <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  required={!canReceiveVisit}
                  placeholder="Ex: Horaires de travail, indisponibilité temporaire, préfère un appel..."
                  value={visitRefusalReason}
                  onChange={(e) => setVisitRefusalReason(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-amber-300 rounded-[5px] text-xs text-slate-900 outline-none"
                />
              </div>
            )}
          </div>
        </div>

        {/* Section 6: Connaissance dans l'Église */}
        <div className="bg-white rounded-[5px] p-5 sm:p-6 shadow-2xs border border-slate-200">
          <div className="border-b border-slate-200 pb-3 mb-5">
            <h2 className="text-sm font-bold uppercase tracking-wider text-indigo-950">
              6. Connaissance dans l'Église
            </h2>
          </div>

          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
              Connaît-elle quelqu'un dans l'église ? <span className="text-rose-600">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3 max-w-sm">
              <button
                type="button"
                onClick={() => setKnowsSomeoneInChurch(true)}
                className={`py-2 px-3 rounded-[5px] border text-xs font-bold transition ${
                  knowsSomeoneInChurch
                    ? 'bg-indigo-900 border-indigo-900 text-white'
                    : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                }`}
              >
                OUI
              </button>
              <button
                type="button"
                onClick={() => setKnowsSomeoneInChurch(false)}
                className={`py-2 px-3 rounded-[5px] border text-xs font-bold transition ${
                  !knowsSomeoneInChurch
                    ? 'bg-slate-800 border-slate-800 text-white'
                    : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                }`}
              >
                NON
              </button>
            </div>

            {knowsSomeoneInChurch && (
              <div className="pt-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                  Nom de la personne <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  required={knowsSomeoneInChurch}
                  placeholder="Ex: Frère Paul Kouadio, Diaconesse Mireille..."
                  value={knownPersonName}
                  onChange={(e) => setKnownPersonName(e.target.value)}
                  className="w-full max-w-md px-3 py-2 bg-slate-50 border border-slate-300 rounded-[5px] text-xs font-medium text-slate-900 outline-none"
                />
              </div>
            )}
          </div>
        </div>

        {/* Section 7: Enregistré par & Observation */}
        <div className="bg-white rounded-[5px] p-5 sm:p-6 shadow-2xs border border-slate-200">
          <div className="border-b border-slate-200 pb-3 mb-5">
            <h2 className="text-sm font-bold uppercase tracking-wider text-indigo-950">
              7. Enregistreur & Observation
            </h2>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                  Nom de la personne qui l'a enregistrée <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Frère Marc"
                  value={recordedByName}
                  onChange={(e) => setRecordedByName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-[5px] text-xs font-medium text-slate-900 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                  Son numéro de téléphone
                </label>
                <input
                  type="tel"
                  placeholder="Ex: +225 07 11 22 33 44"
                  value={recordedByPhone}
                  onChange={(e) => setRecordedByPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-[5px] text-xs font-medium text-slate-900 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                Observation
              </label>
              <textarea
                rows={3}
                placeholder="Remarques, requêtes de prière, demande de baptême..."
                value={observation}
                onChange={(e) => setObservation(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-[5px] text-xs text-slate-900 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Buttons - Flutter style radius: 5px */}
        <div className="flex flex-col sm:flex-row items-center justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-2">
          <button
            type="button"
            onClick={handleResetForm}
            className="w-full sm:w-auto px-4 py-2.5 text-xs font-bold text-slate-700 bg-slate-200 hover:bg-slate-300 rounded-[5px] transition"
          >
            Réinitialiser
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto px-6 py-2.5 bg-indigo-900 hover:bg-indigo-800 text-white text-xs font-bold rounded-[5px] shadow-2xs transition disabled:opacity-50"
          >
            {isSubmitting ? 'Enregistrement en cours...' : 'Enregistrer la Nouvelle Âme'}
          </button>
        </div>
      </form>

      {/* Success Modal */}
      {showSuccessModal && createdSoulData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-2xs">
          <div className="bg-white rounded-[5px] max-w-md w-full p-6 shadow-xl border border-slate-300">
            <h3 className="text-base font-bold text-slate-900 text-center mb-1">
              Fiche Enregistrée avec Succès
            </h3>
            <p className="text-center text-xs text-slate-600 mb-5">
              <strong>{createdSoulData.firstNames} {createdSoulData.lastName}</strong> ({createdSoulData.gender}) a été enregistré(e) et affecté(e) à la cellule <strong>{createdSoulData.prayerCell}</strong>.
            </p>

            <div className="space-y-2">
              <a
                href={`https://wa.me/${formatCleanPhone(createdSoulData.phoneNumber)}?text=${encodeURIComponent(
                  `Chalom ${createdSoulData.firstNames},\nNous vous remercions chaleureusement pour votre présence à l'église. Vous êtes confié(e) à la cellule de prière "${createdSoulData.prayerCell}". Que Dieu vous bénisse abondamment !`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="w-full flex items-center justify-center space-x-2 py-2 px-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-[5px] text-xs font-bold transition"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Envoyer WhatsApp de Bienvenue</span>
              </a>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleResetForm}
                  className="w-full py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-[5px] text-xs font-bold transition"
                >
                  + Nouveau Formulaire
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowSuccessModal(false);
                    if (onSuccessNavigate) onSuccessNavigate();
                  }}
                  className="w-full py-2 px-3 bg-indigo-900 hover:bg-indigo-800 text-white rounded-[5px] text-xs font-bold transition"
                >
                  Voir Grand Tableau
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Add Prayer Cell Modal */}
      {showNewCellQuickModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-2xs">
          <div className="bg-white rounded-[5px] max-w-md w-full p-5 shadow-xl border border-slate-300">
            <h3 className="text-sm font-bold text-slate-900 uppercase mb-3">
              Créer une Cellule de Prière
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Nom de la cellule
                </label>
                <input
                  type="text"
                  placeholder="Ex: Béthanie"
                  value={newCellName}
                  onChange={(e) => setNewCellName(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-[5px] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Responsable
                </label>
                <input
                  type="text"
                  placeholder="Ex: Frère David"
                  value={newCellLeader}
                  onChange={(e) => setNewCellLeader(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-[5px] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Téléphone du Responsable
                </label>
                <input
                  type="tel"
                  placeholder="Ex: +225 07..."
                  value={newCellPhone}
                  onChange={(e) => setNewCellPhone(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-[5px] outline-none"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewCellQuickModal(false)}
                  className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:text-slate-800"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleAddQuickCell}
                  className="px-4 py-1.5 bg-indigo-900 hover:bg-indigo-800 text-white rounded-[5px] text-xs font-bold transition"
                >
                  Ajouter
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
