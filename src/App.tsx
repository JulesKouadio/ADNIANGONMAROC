import React, { useEffect, useState } from 'react';
import { ChurchProvider, useChurch } from './context/ChurchContext';
import { LoginScreen } from './components/LoginScreen';
import { AppTab, Navbar } from './components/Navbar';
import { SoulRegistrationForm } from './components/SoulRegistrationForm';
import { SoulsList } from './components/SoulsList';
import { FollowUpWorkspace } from './components/FollowUpWorkspace';
import { RexView } from './components/RexView';
import { ReportsView } from './components/ReportsView';
import { TeamsAndHostsManager } from './components/TeamsAndHostsManager';
import { DashboardStats } from './components/DashboardStats';
import { NewSoul } from './types';

class AppErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; errorMsg: string }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, errorMsg: '' };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, errorMsg: error.message };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white border border-rose-300 rounded-[5px] p-6 space-y-3">
            <h2 className="text-base font-bold text-rose-900">
              Une erreur applicative est survenue
            </h2>
            <p className="text-xs text-slate-700 break-words">{this.state.errorMsg}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-indigo-900 text-white rounded-[5px] text-xs font-bold"
            >
              Recharger l'application
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function AppContent() {
  const { currentHost, syncError, clearSyncError } = useChurch();

  const [activeTab, setActiveTab] = useState<AppTab>('souls');
  const [editingSoul, setEditingSoul] = useState<NewSoul | null>(null);
  const [focusedFollowUpSoulId, setFocusedFollowUpSoulId] = useState<string | null>(null);

  // Direct user to appropriate initial workspace based on role on sign-in
  useEffect(() => {
    if (!currentHost) return;
    if (currentHost.role === 'Responsable') {
      setActiveTab('souls');
    } else if (currentHost.role === "Chef d'équipe") {
      setActiveTab('followup');
    } else {
      setActiveTab('followup');
    }
  }, [currentHost?.id]);

  if (!currentHost) {
    return <LoginScreen />;
  }

  const handleOpenEditSoul = (soul: NewSoul) => {
    setEditingSoul(soul);
    setActiveTab('register');
  };

  const handleOpenFollowUpForSoul = (soul: NewSoul) => {
    setFocusedFollowUpSoulId(soul.id);
    setActiveTab('followup');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          if (tab !== 'register') {
            setEditingSoul(null);
          }
          setActiveTab(tab);
        }}
      />

      {syncError && (
        <div className="max-w-[98%] mx-auto w-full px-2 sm:px-4 pt-3 print:hidden">
          <div className="p-3 bg-rose-50 border border-rose-300 rounded-[5px] text-xs font-semibold text-rose-900 flex items-center justify-between">
            <span>{syncError}</span>
            <button type="button" onClick={clearSyncError} className="underline font-bold ml-3">
              Fermer
            </button>
          </div>
        </div>
      )}

      <main className="flex-1 pb-12">
        {activeTab === 'register' && (
          <SoulRegistrationForm
            editingSoul={editingSoul}
            onCancelEdit={() => {
              setEditingSoul(null);
              setActiveTab('souls');
            }}
            onSelectExistingSoulToEdit={(existingSoul) => {
              setEditingSoul(existingSoul);
            }}
            onSuccessNavigate={() => {
              setEditingSoul(null);
              setActiveTab('souls');
            }}
          />
        )}

        {activeTab === 'souls' && (
          <SoulsList
            onNavigateToRegister={() => {
              setEditingSoul(null);
              setActiveTab('register');
            }}
            onEditSoul={handleOpenEditSoul}
            onOpenFollowUpForSoul={handleOpenFollowUpForSoul}
          />
        )}

        {activeTab === 'followup' && (
          <FollowUpWorkspace initialSoulId={focusedFollowUpSoulId} />
        )}

        {activeTab === 'rex' && <RexView />}

        {activeTab === 'reports' && <ReportsView />}

        {activeTab === 'teams' &&
          (currentHost.role === 'Responsable' || currentHost.role === "Chef d'équipe") && (
            <TeamsAndHostsManager />
          )}

        {activeTab === 'stats' && <DashboardStats />}
      </main>

      <footer className="bg-white border-t border-slate-200 py-4 px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-500 print:hidden">
        <div className="max-w-7xl mx-auto">
          <p className="text-slate-600 font-medium">Plateforme d'enregistrement et de suivi</p>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AppErrorBoundary>
      <ChurchProvider>
        <AppContent />
      </ChurchProvider>
    </AppErrorBoundary>
  );
}
