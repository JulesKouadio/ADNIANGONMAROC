import React, { useState } from 'react';
import {
  UserPlus,
  TableProperties,
  ClipboardList,
  BookOpen,
  FileSpreadsheet,
  Users,
  BarChart3,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { useChurch } from '../context/ChurchContext';

export type AppTab =
  | 'register'
  | 'souls'
  | 'followup'
  | 'rex'
  | 'reports'
  | 'teams'
  | 'stats';

interface NavbarProps {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const { currentHost, logout, souls } = useChurch();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (!currentHost) return null;

  const canManageTeamsOrHosts =
    currentHost.role === 'Responsable' || currentHost.role === "Chef d'équipe";

  const navItems: { id: AppTab; label: string; icon: React.ReactNode; visible: boolean }[] = [
    {
      id: 'register',
      label: 'Recevoir',
      icon: <UserPlus className="w-3.5 h-3.5" />,
      visible: true,
    },
    {
      id: 'souls',
      label: `Âmes (${souls.length})`,
      icon: <TableProperties className="w-3.5 h-3.5" />,
      visible: true,
    },
    {
      id: 'followup',
      label: 'Suivi & Synthèse',
      icon: <ClipboardList className="w-3.5 h-3.5" />,
      visible: true,
    },
    {
      id: 'rex',
      label: 'REX',
      icon: <BookOpen className="w-3.5 h-3.5" />,
      visible: true,
    },
    {
      id: 'reports',
      label: 'Rapports',
      icon: <FileSpreadsheet className="w-3.5 h-3.5" />,
      visible: true,
    },
    {
      id: 'teams',
      label: 'Équipes & Hôtes',
      icon: <Users className="w-3.5 h-3.5" />,
      visible: canManageTeamsOrHosts,
    },
    {
      id: 'stats',
      label: 'Statistiques',
      icon: <BarChart3 className="w-3.5 h-3.5" />,
      visible: true,
    },
  ];

  const handleSelect = (tab: AppTab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-2xs print:hidden">
      <div className="max-w-[98%] mx-auto px-3 sm:px-6">
        <div className="flex items-center justify-between h-14 gap-4">
          {/* Zone 1: Brand wordmark */}
          <button
            type="button"
            onClick={() => handleSelect('souls')}
            className="text-left whitespace-nowrap shrink-0"
          >
            <span className="font-bold text-sm sm:text-base text-indigo-950 tracking-tight">
              ENREGISTREMENT & SUIVI
            </span>
          </button>

          {/* Zone 2: Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1 bg-slate-100 p-1 rounded-[5px] border border-slate-200 overflow-x-auto">
            {navItems
              .filter((item) => item.visible)
              .map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelect(item.id)}
                  className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-[5px] text-xs font-bold whitespace-nowrap shrink-0 transition-colors ${
                    activeTab === item.id
                      ? 'bg-indigo-900 text-white shadow-2xs'
                      : 'text-slate-700 hover:text-slate-900 hover:bg-white'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              ))}
          </nav>

          {/* Zone 3: Connected Host & Logout */}
          <div className="flex items-center space-x-2 shrink-0">
            <div className="hidden sm:flex flex-col items-end text-right leading-tight">
              <span className="text-xs font-bold text-slate-900 whitespace-nowrap">
                {currentHost.firstNames} {currentHost.lastName}
              </span>
              <span className="text-[11px] text-slate-500 whitespace-nowrap">
                {currentHost.subRole}
                {currentHost.teamName ? ` · ${currentHost.teamName}` : ''}
              </span>
            </div>

            <button
              type="button"
              onClick={logout}
              title="Se déconnecter"
              className="flex items-center space-x-1 px-2.5 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-[5px] transition-colors whitespace-nowrap shrink-0"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Déconnexion</span>
            </button>

            <button
              type="button"
              onClick={() => setMobileMenuOpen((v) => !v)}
              className="lg:hidden p-1.5 text-slate-700 bg-slate-100 border border-slate-300 rounded-[5px]"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden pb-3 pt-2 border-t border-slate-200 space-y-2">
            <div className="sm:hidden px-1 pb-2 border-b border-slate-100 text-xs">
              <span className="font-bold text-slate-900">
                {currentHost.firstNames} {currentHost.lastName}
              </span>
              <span className="text-slate-500"> · {currentHost.subRole}</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {navItems
                .filter((item) => item.visible)
                .map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelect(item.id)}
                    className={`flex items-center space-x-1.5 px-3 py-2 rounded-[5px] text-xs font-bold transition-colors ${
                      activeTab === item.id
                        ? 'bg-indigo-900 text-white'
                        : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                    }`}
                  >
                    {item.icon}
                    <span className="truncate">{item.label}</span>
                  </button>
                ))}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
