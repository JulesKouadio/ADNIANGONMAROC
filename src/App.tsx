import React, { useState } from 'react';
import { ChurchProvider } from './context/ChurchContext';
import { Navbar } from './components/Navbar';
import { SoulRegistrationForm } from './components/SoulRegistrationForm';
import { SoulsList } from './components/SoulsList';
import { PrayerCellsManager } from './components/PrayerCellsManager';
import { DashboardStats } from './components/DashboardStats';
function AppContent() {
  const [activeTab, setActiveTab] = useState<'register' | 'souls' | 'stats' | 'cells'>('souls');

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 pb-16">
        {activeTab === 'register' && (
          <SoulRegistrationForm onSuccessNavigate={() => setActiveTab('souls')} />
        )}
        {activeTab === 'souls' && (
          <SoulsList onNavigateToRegister={() => setActiveTab('register')} />
        )}
        {activeTab === 'cells' && <PrayerCellsManager />}
        {activeTab === 'stats' && (
          <DashboardStats
            onNavigateToRegister={() => setActiveTab('register')}
            onNavigateToSouls={() => setActiveTab('souls')}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto">
          <p className="text-slate-600 font-medium">
            Plateforme d'enregistrement et de suivi
          </p>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <ChurchProvider>
      <AppContent />
    </ChurchProvider>
  );
}
