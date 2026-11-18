import React, { useState, useMemo } from 'react';
import {
  Plus,
  UserPlus,
  Edit3,
  PauseCircle,
  PlayCircle,
  Shield,
  Users,
} from 'lucide-react';
import { useChurch } from '../context/ChurchContext';
import { AccountRole, AccompanimentTeam, HostSubRole, HostUser } from '../types';

export const TeamsAndHostsManager: React.FC = () => {
  const {
    currentHost,
    hosts,
    teams,
    createHost,
    updateHost,
    transferPrincipalAuthority,
    createTeam,
    updateTeam,
  } = useChurch();

  const isResponsable = currentHost?.role === 'Responsable';
  const isChefEquipe = currentHost?.role === "Chef d'équipe";

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Team modal states
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [editingTeam, setEditingTeam] = useState<AccompanimentTeam | null>(null);
  const [teamName, setTeamName] = useState('');
  const [teamLeaderId, setTeamLeaderId] = useState('');

  // Host modal states
  const [showHostModal, setShowHostModal] = useState(false);
  const [editingHost, setEditingHost] = useState<HostUser | null>(null);
  const [hLastName, setHLastName] = useState('');
  const [hFirstNames, setHFirstNames] = useState('');
  const [hPhone, setHPhone] = useState('');
  const [hLocation, setHLocation] = useState('');
  const [hUsername, setHUsername] = useState('');
  const [hPassword, setHPassword] = useState('');
  const [hSubRole, setHSubRole] = useState<HostSubRole>('Accompagnateur');
  const [hTeamId, setHTeamId] = useState('');

  // Passation / Transfer Modal
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferTargetId, setTransferTargetId] = useState('');

  // Chefs d'équipe disponibles pour diriger une équipe (un chef d'équipe max par équipe, 1 équipe max par chef)
  const eligibleChefs = useMemo(() => {
    return hosts.filter((h) => {
      if (h.role !== "Chef d'équipe" || h.status !== 'active') return false;
      const alreadyLeading = teams.find(
        (t) => t.leaderId === h.id && (!editingTeam || t.id !== editingTeam.id)
      );
      return !alreadyLeading;
    });
  }, [hosts, teams, editingTeam]);

  const anyChefExists = useMemo(
    () => hosts.some((h) => h.role === "Chef d'équipe" && h.status === 'active'),
    [hosts]
  );

  // Hosts visible according to role
  const visibleHosts = useMemo(() => {
    if (isResponsable) return hosts;
    if (isChefEquipe && currentHost) {
      return hosts.filter(
        (h) => h.teamId === currentHost.teamId && h.role === 'Accompagnateur'
      );
    }
    return [];
  }, [hosts, isResponsable, isChefEquipe, currentHost]);

  const openCreateHost = () => {
    setErrorMsg(null);
    setEditingHost(null);
    setHLastName('');
    setHFirstNames('');
    setHPhone('');
    setHLocation('');
    setHUsername('');
    setHPassword('');
    setHSubRole('Accompagnateur');
    setHTeamId(isChefEquipe && currentHost?.teamId ? currentHost.teamId : '');
    setShowHostModal(true);
  };

  const openEditHost = (h: HostUser) => {
    setErrorMsg(null);
    setEditingHost(h);
    setHLastName(h.lastName);
    setHFirstNames(h.firstNames);
    setHPhone(h.phone);
    setHLocation(h.location || '');
    setHUsername(h.username);
    setHPassword('');
    setHSubRole(h.subRole);
    setHTeamId(h.teamId || '');
    setShowHostModal(true);
  };

  const mapSubRoleToAccountRole = (sr: HostSubRole): AccountRole => {
    if (sr === 'Responsable principal' || sr === 'Responsable adjoint') return 'Responsable';
    if (sr === "Chef d'équipe") return "Chef d'équipe";
    return 'Accompagnateur';
  };

  const handleSaveHost = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const role = mapSubRoleToAccountRole(hSubRole);
    const assignedTeam = isChefEquipe ? currentHost?.teamId || '' : hTeamId;

    try {
      if (editingHost) {
        await updateHost(editingHost.id, {
          lastName: hLastName.trim().toUpperCase(),
          firstNames: hFirstNames.trim(),
          phone: hPhone.trim(),
          location: hLocation.trim(),
          username: hUsername.trim(),
          role,
          subRole: hSubRole,
          teamId: assignedTeam,
          newPassword: hPassword.trim() || undefined,
        });
        setSuccessMsg(`Profil de ${hFirstNames} ${hLastName} mis à jour.`);
      } else {
        await createHost({
          lastName: hLastName,
          firstNames: hFirstNames,
          phone: hPhone,
          location: hLocation,
          username: hUsername,
          password: hPassword,
          role,
          subRole: hSubRole,
          teamId: assignedTeam,
        });
        setSuccessMsg(`Hôte d'accueil ${hFirstNames} ${hLastName} créé avec succès.`);
      }
      setShowHostModal(false);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Erreur lors de la sauvegarde.');
    }
  };

  const handleToggleHostStatus = async (h: HostUser) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    if (h.subRole === 'Responsable principal') {
      setErrorMsg("Impossible de suspendre le Responsable principal.");
      return;
    }
    try {
      const nextStatus = h.status === 'active' ? 'suspended' : 'active';
      await updateHost(h.id, { status: nextStatus });
      setSuccessMsg(
        `Le compte de ${h.firstNames} ${h.lastName} est maintenant ${
          nextStatus === 'active' ? 'actif' : 'suspendu'
        }.`
      );
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Erreur de statut.');
    }
  };

  const openCreateTeam = () => {
    setErrorMsg(null);
    if (!anyChefExists) {
      setErrorMsg(
        "La création d'une équipe d'accompagnement nécessite d'avoir d'abord créé au moins un hôte avec le profil « Chef d'équipe »."
      );
      return;
    }
    if (eligibleChefs.length === 0) {
      setErrorMsg(
        "Tous les Chefs d'équipe actifs dirigent déjà une équipe. Créez d'abord un nouveau Chef d'équipe."
      );
      return;
    }
    setEditingTeam(null);
    setTeamName('');
    setTeamLeaderId(eligibleChefs[0]?.id || '');
    setShowTeamModal(true);
  };

  const openEditTeam = (team: AccompanimentTeam) => {
    setErrorMsg(null);
    setEditingTeam(team);
    setTeamName(team.name);
    setTeamLeaderId(team.leaderId);
    setShowTeamModal(true);
  };

  const handleSaveTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      if (editingTeam) {
        await updateTeam(editingTeam.id, { name: teamName, leaderId: teamLeaderId });
        setSuccessMsg(`Équipe « ${teamName} » mise à jour.`);
      } else {
        await createTeam(teamName, teamLeaderId);
        setSuccessMsg(`Équipe « ${teamName} » créée avec succès.`);
      }
      setShowTeamModal(false);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Erreur équipe.');
    }
  };

  const handleToggleTeamStatus = async (t: AccompanimentTeam) => {
    setErrorMsg(null);
    try {
      const nextStatus = t.status === 'active' ? 'suspended' : 'active';
      await updateTeam(t.id, { status: nextStatus });
      setSuccessMsg(
        `L'équipe « ${t.name} » est maintenant ${
          nextStatus === 'active' ? 'active' : 'suspendue'
        }.`
      );
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Erreur de statut équipe.');
    }
  };

  const handleTransferAuthority = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferTargetId) return;
    setErrorMsg(null);
    try {
      await transferPrincipalAuthority(transferTargetId);
      setShowTransferModal(false);
      setSuccessMsg("L'autorité de Responsable principal a été transférée avec succès.");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Erreur de transfert.');
    }
  };

  const currentPrincipal = hosts.find((h) => h.subRole === 'Responsable principal');

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Gestion des Équipes d'Accompagnement & Hôtes d'Accueil
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {isResponsable
              ? 'Créez les hôtes (Chefs d’équipe, Accompagnateurs, Responsables adjoints) et organisez les équipes.'
              : `Gérez les accompagnateurs de votre équipe (${currentHost?.teamName || '-'}).`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {isResponsable && (
            <>
              <button
                type="button"
                onClick={() => {
                  setTransferTargetId('');
                  setShowTransferModal(true);
                }}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 rounded-[5px] text-xs font-bold"
              >
                <Shield className="w-3.5 h-3.5 text-indigo-900" />
                <span>Passation 1er Responsable</span>
              </button>

              <button
                type="button"
                onClick={openCreateTeam}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-white border border-indigo-900 text-indigo-950 hover:bg-indigo-50 rounded-[5px] text-xs font-bold"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Nouvelle Équipe</span>
              </button>
            </>
          )}

          <button
            type="button"
            onClick={openCreateHost}
            className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 bg-indigo-900 hover:bg-indigo-800 text-white rounded-[5px] text-xs font-bold"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Nouvel Hôte d'accueil</span>
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 bg-rose-50 border border-rose-300 rounded-[5px] text-xs font-semibold text-rose-900">
          {errorMsg}
        </div>
      )}
      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-[5px] text-xs font-semibold text-emerald-900">
          {successMsg}
        </div>
      )}

      {/* Section Équipes d'accompagnement (Responsable) */}
      {isResponsable && (
        <div className="bg-white rounded-[5px] border border-slate-200 p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
            <h2 className="text-sm font-bold uppercase tracking-wider text-indigo-950 flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>Équipes d'Accompagnement ({teams.length})</span>
            </h2>
            <span className="text-[11px] text-slate-500">
              1 Chef d'équipe maximum par équipe · 1 équipe maximum par Chef d'équipe
            </span>
          </div>

          {teams.length === 0 ? (
            <p className="text-xs text-slate-500 py-3">
              Aucune équipe créée. Créez d'abord au moins un hôte au profil « Chef d'équipe », puis créez votre première équipe.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {teams.map((t) => {
                const members = hosts.filter((h) => h.teamId === t.id && h.status === 'active');
                return (
                  <div
                    key={t.id}
                    className={`p-4 rounded-[5px] border ${
                      t.status === 'suspended'
                        ? 'bg-slate-50 border-slate-300 opacity-75'
                        : 'bg-white border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">{t.name}</h3>
                        <p className="text-xs text-slate-600 mt-0.5">
                          Chef d'équipe : <strong>{t.leaderName}</strong>
                        </p>
                        {t.leaderPhone && (
                          <p className="text-[11px] font-mono text-slate-500">{t.leaderPhone}</p>
                        )}
                      </div>
                      <span
                        className={`text-[11px] font-bold ${
                          t.status === 'active' ? 'text-emerald-700' : 'text-rose-700'
                        }`}
                      >
                        {t.status === 'active' ? 'Active' : 'Suspendue'}
                      </span>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-100 text-[11px] text-slate-600">
                      Membres actifs : <strong className="tabular-nums">{members.length}</strong>
                    </div>

                    <div className="mt-3 flex items-center justify-end space-x-2">
                      <button
                        type="button"
                        onClick={() => openEditTeam(t)}
                        className="inline-flex items-center space-x-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-[5px] text-xs font-bold"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>Modifier</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggleTeamStatus(t)}
                        className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-[5px] text-xs font-bold ${
                          t.status === 'active'
                            ? 'bg-rose-50 hover:bg-rose-100 text-rose-800'
                            : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {t.status === 'active' ? (
                          <>
                            <PauseCircle className="w-3 h-3" />
                            <span>Suspendre</span>
                          </>
                        ) : (
                          <>
                            <PlayCircle className="w-3 h-3" />
                            <span>Rétablir</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Section Hôtes d'accueil */}
      <div className="bg-white rounded-[5px] border border-slate-200 shadow-2xs overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-indigo-950">
            Liste des Hôtes d'Accueil ({visibleHosts.length})
          </h2>
          {currentPrincipal && (
            <span className="text-xs text-slate-600">
              1er Responsable actuel :{' '}
              <strong>
                {currentPrincipal.firstNames} {currentPrincipal.lastName}
              </strong>{' '}
              ({currentPrincipal.username})
            </span>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-100 text-slate-800 uppercase font-bold text-[11px] border-b border-slate-300">
              <tr>
                <th className="py-2.5 px-3 border-r border-slate-200">Nom & Prénoms</th>
                <th className="py-2.5 px-3 border-r border-slate-200">Identifiant (Login)</th>
                <th className="py-2.5 px-3 border-r border-slate-200">Téléphone</th>
                <th className="py-2.5 px-3 border-r border-slate-200">Localisation</th>
                <th className="py-2.5 px-3 border-r border-slate-200">Profil / Rôle</th>
                <th className="py-2.5 px-3 border-r border-slate-200">Équipe assignée</th>
                <th className="py-2.5 px-3 border-r border-slate-200 text-center">Statut</th>
                <th className="py-2.5 px-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {visibleHosts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-6 text-center text-slate-500 italic">
                    Aucun hôte d'accueil enregistré dans ce périmètre.
                  </td>
                </tr>
              ) : (
                visibleHosts.map((h) => (
                  <tr key={h.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 border-r border-slate-200 font-bold text-slate-900 whitespace-nowrap">
                      {h.lastName} {h.firstNames}
                    </td>
                    <td className="py-2.5 px-3 border-r border-slate-200 font-mono text-indigo-950 font-semibold">
                      {h.username}
                    </td>
                    <td className="py-2.5 px-3 border-r border-slate-200 font-mono tabular-nums">
                      {h.phone || '-'}
                    </td>
                    <td className="py-2.5 px-3 border-r border-slate-200">{h.location || '-'}</td>
                    <td className="py-2.5 px-3 border-r border-slate-200 font-semibold">
                      {h.subRole}
                    </td>
                    <td className="py-2.5 px-3 border-r border-slate-200">
                      {h.teamName || '-'}
                    </td>
                    <td className="py-2.5 px-3 border-r border-slate-200 text-center font-bold">
                      <span
                        className={h.status === 'active' ? 'text-emerald-700' : 'text-rose-700'}
                      >
                        {h.status === 'active' ? 'Actif' : 'Suspendu'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center space-x-1.5">
                        <button
                          type="button"
                          onClick={() => openEditHost(h)}
                          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-[5px] text-[11px] font-bold"
                        >
                          Modifier
                        </button>
                        {h.subRole !== 'Responsable principal' && (
                          <button
                            type="button"
                            onClick={() => handleToggleHostStatus(h)}
                            className={`px-2 py-1 rounded-[5px] text-[11px] font-bold ${
                              h.status === 'active'
                                ? 'bg-rose-50 hover:bg-rose-100 text-rose-800'
                                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {h.status === 'active' ? 'Suspendre' : 'Rétablir'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Créer / Modifier Hôte */}
      {showHostModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-2xs">
          <div className="bg-white rounded-[5px] max-w-lg w-full p-5 border border-slate-300 shadow-xl">
            <h3 className="text-sm font-bold text-slate-900 uppercase mb-3">
              {editingHost
                ? `Modifier : ${editingHost.firstNames} ${editingHost.lastName}`
                : "Créer un Hôte d'Accueil"}
            </h3>

            <form onSubmit={handleSaveHost} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    Nom <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={hLastName}
                    onChange={(e) => setHLastName(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-[5px] uppercase"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    Prénoms <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={hFirstNames}
                    onChange={(e) => setHFirstNames(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-[5px]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    Téléphone <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={hPhone}
                    onChange={(e) => setHPhone(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-[5px] font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    Localisation
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Yopougon Maroc"
                    value={hLocation}
                    onChange={(e) => setHLocation(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-[5px]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    Nom d'utilisateur (Connexion) <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: téléphone ou pseudo"
                    value={hUsername}
                    onChange={(e) => setHUsername(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-[5px] font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    {editingHost ? 'Nouveau mot de passe (optionnel)' : 'Mot de passe *'}
                  </label>
                  <input
                    type="password"
                    required={!editingHost}
                    placeholder={editingHost ? 'Laisser vide pour conserver' : 'Minimum 4 caractères'}
                    value={hPassword}
                    onChange={(e) => setHPassword(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-[5px]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    Type d'Hôte d'accueil
                  </label>
                  {editingHost?.subRole === 'Responsable principal' ? (
                    <input
                      type="text"
                      disabled
                      value="Responsable principal"
                      className="w-full px-3 py-1.5 bg-slate-100 border border-slate-300 rounded-[5px] font-bold text-slate-700"
                    />
                  ) : isResponsable ? (
                    <select
                      value={hSubRole}
                      onChange={(e) => setHSubRole(e.target.value as HostSubRole)}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-[5px] font-semibold"
                    >
                      <option value="Accompagnateur">Accompagnateur</option>
                      <option value="Chef d'équipe">Chef d'équipe</option>
                      <option value="Responsable adjoint">Responsable adjoint</option>
                    </select>
                  ) : (
                    <input
                      type="text"
                      disabled
                      value="Accompagnateur"
                      className="w-full px-3 py-1.5 bg-slate-100 border border-slate-300 rounded-[5px] font-bold text-slate-700"
                    />
                  )}
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    Équipe d'accompagnement
                  </label>
                  {isChefEquipe ? (
                    <input
                      type="text"
                      disabled
                      value={currentHost?.teamName || 'Votre équipe'}
                      className="w-full px-3 py-1.5 bg-slate-100 border border-slate-300 rounded-[5px] font-semibold text-slate-700"
                    />
                  ) : (
                    <select
                      value={hTeamId}
                      onChange={(e) => setHTeamId(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-[5px] font-semibold"
                    >
                      <option value="">— Aucune équipe assignée —</option>
                      {teams.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowHostModal(false)}
                  className="px-3 py-1.5 bg-slate-200 text-slate-800 rounded-[5px] font-bold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-900 hover:bg-indigo-800 text-white rounded-[5px] font-bold"
                >
                  {editingHost ? 'Enregistrer les modifications' : 'Créer le profil'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Créer / Modifier Équipe */}
      {showTeamModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-2xs">
          <div className="bg-white rounded-[5px] max-w-md w-full p-5 border border-slate-300 shadow-xl">
            <h3 className="text-sm font-bold text-slate-900 uppercase mb-3">
              {editingTeam ? `Modifier l'équipe : ${editingTeam.name}` : "Nouvelle Équipe d'Accompagnement"}
            </h3>

            <form onSubmit={handleSaveTeam} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Nom de l'équipe <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Équipe Néhémie"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-[5px]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Chef d'équipe <span className="text-rose-600">*</span>
                </label>
                <select
                  required
                  value={teamLeaderId}
                  onChange={(e) => setTeamLeaderId(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-[5px] font-semibold"
                >
                  {eligibleChefs.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.firstNames} {c.lastName} ({c.phone})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowTeamModal(false)}
                  className="px-3 py-1.5 bg-slate-200 text-slate-800 rounded-[5px] font-bold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-900 hover:bg-indigo-800 text-white rounded-[5px] font-bold"
                >
                  {editingTeam ? 'Mettre à jour' : "Créer l'équipe"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Passation d'autorité 1er Responsable */}
      {showTransferModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-2xs">
          <div className="bg-white rounded-[5px] max-w-md w-full p-5 border border-slate-300 shadow-xl">
            <h3 className="text-sm font-bold text-slate-900 uppercase mb-2">
              Léguer l'autorité de 1er Responsable
            </h3>
            <p className="text-xs text-slate-600 mb-3">
              Vous pouvez soit modifier directement le nom et l'identifiant du Responsable principal dans le tableau, soit transférer ce rôle à un autre hôte actif ci-dessous.
            </p>

            <form onSubmit={handleTransferAuthority} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Nouveau Responsable principal <span className="text-rose-600">*</span>
                </label>
                <select
                  required
                  value={transferTargetId}
                  onChange={(e) => setTransferTargetId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-[5px] font-semibold"
                >
                  <option value="">— Sélectionner un hôte actif —</option>
                  {hosts
                    .filter((h) => h.status === 'active' && h.subRole !== 'Responsable principal')
                    .map((h) => (
                      <option key={h.id} value={h.id}>
                        {h.firstNames} {h.lastName} ({h.subRole} · {h.username})
                      </option>
                    ))}
                </select>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowTransferModal(false)}
                  className="px-3 py-1.5 bg-slate-200 text-slate-800 rounded-[5px] font-bold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-900 hover:bg-indigo-800 text-white rounded-[5px] font-bold"
                >
                  Confirmer la passation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
