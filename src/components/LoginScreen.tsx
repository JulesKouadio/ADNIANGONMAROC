import React, { useState } from 'react';
import { Lock, User, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useChurch } from '../context/ChurchContext';

export const LoginScreen: React.FC = () => {
  const { loading, login } = useChurch();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!username.trim()) {
      setErrorMsg("Veuillez saisir votre nom d'utilisateur.");
      return;
    }

    if (!password.trim()) {
      setErrorMsg('Veuillez saisir votre mot de passe.');
      return;
    }

    setSubmitting(true);
    try {
      await login(username, password);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Échec de connexion.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-indigo-950 text-white rounded-t-[5px] px-6 py-5">
          <p className="text-[11px] font-bold uppercase tracking-widest text-indigo-200">
            Service d'Accueil & de Suivi
          </p>
          <h1 className="text-xl font-bold tracking-tight mt-0.5">
            ENREGISTREMENT & SUIVI
          </h1>
          <p className="text-xs text-indigo-200 mt-1">
            Connexion à l'espace des hôtes d'accueil et accompagnateurs
          </p>
        </div>

        <div className="bg-white border border-t-0 border-slate-300 rounded-b-[5px] shadow-xs px-6 py-6">
          {loading ? (
            <div className="py-8 text-center text-xs text-slate-500 font-medium">
              Chargement en cours...
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-300 rounded-[5px] text-xs font-semibold text-rose-900">
                  {errorMsg}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-slate-700 mb-1.5">
                  Nom d'utilisateur <span className="text-rose-600">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    autoComplete="username"
                    placeholder="Votre nom d'utilisateur"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      setErrorMsg(null);
                    }}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-[5px] text-xs font-medium text-slate-900 focus:bg-white focus:border-indigo-700 focus:ring-1 focus:ring-indigo-700 outline-none"
                  />
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-slate-700 mb-1.5">
                  Mot de passe <span className="text-rose-600">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    placeholder="Votre mot de passe"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setErrorMsg(null);
                    }}
                    className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-[5px] text-xs font-medium text-slate-900 focus:bg-white focus:border-indigo-700 focus:ring-1 focus:ring-indigo-700 outline-none"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-700"
                    title={showPassword ? 'Masquer' : 'Afficher'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 bg-indigo-900 hover:bg-indigo-800 text-white text-xs font-bold rounded-[5px] shadow-2xs transition disabled:opacity-50"
              >
                <span>{submitting ? 'Vérification...' : 'Se connecter'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-[11px] text-slate-500 mt-4">
          Plateforme d'enregistrement et de suivi
        </p>
      </div>
    </div>
  );
};
