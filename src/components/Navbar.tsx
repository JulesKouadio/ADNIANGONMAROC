import { 
  Users, 
  UserPlus, 
  BarChart3, 
  Home, 
  Download, 
  ClipboardCheck,
  TableProperties
} from 'lucide-react';
import { useChurch } from '../context/ChurchContext';

interface NavbarProps {
  activeTab: 'register' | 'souls' | 'stats' | 'cells';
  setActiveTab: (tab: 'register' | 'souls' | 'stats' | 'cells') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const { souls, exportToCsv } = useChurch();

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Identity (Clean & static, no church icon) */}
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-[5px] bg-indigo-900 flex items-center justify-center text-white shadow-2xs">
              <ClipboardCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-base sm:text-lg text-slate-900 tracking-tight block leading-tight">
                ENREGISTREMENT & SUIVI
              </span>
            </div>
          </div>

          {/* Navigation Links - Flutter Style radius:5 */}
          <nav className="hidden md:flex items-center space-x-1 bg-slate-100 p-1 rounded-[5px] border border-slate-200">
            <button
              onClick={() => setActiveTab('register')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-[5px] text-xs font-bold transition-all ${
                activeTab === 'register'
                  ? 'bg-indigo-900 text-white shadow-xs'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Enregistrer une Âme</span>
            </button>

            <button
              onClick={() => setActiveTab('souls')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-[5px] text-xs font-bold transition-all relative ${
                activeTab === 'souls'
                  ? 'bg-indigo-900 text-white shadow-xs'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <TableProperties className="w-3.5 h-3.5" />
              <span>Registre & Tableau ({souls.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('cells')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-[5px] text-xs font-bold transition-all ${
                activeTab === 'cells'
                  ? 'bg-indigo-900 text-white shadow-xs'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              <span>Cellules de Prière</span>
            </button>

            <button
              onClick={() => setActiveTab('stats')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-[5px] text-xs font-bold transition-all ${
                activeTab === 'stats'
                  ? 'bg-indigo-900 text-white shadow-xs'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Statistiques</span>
            </button>
          </nav>

          {/* Right Action: Export CSV */}
          <div className="flex items-center space-x-2">
            {souls.length > 0 && (
              <button
                onClick={exportToCsv}
                title="Exporter toutes les informations en CSV / Excel"
                className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 rounded-[5px] transition-colors border border-slate-300 shadow-2xs"
              >
                <Download className="w-3.5 h-3.5 text-slate-600" />
                <span>Exporter CSV</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-slate-100 text-xs">
          <button
            onClick={() => setActiveTab('register')}
            className={`flex flex-col items-center py-1 px-2 rounded-[5px] font-bold ${
              activeTab === 'register' ? 'text-indigo-900 font-extrabold bg-indigo-50' : 'text-slate-600'
            }`}
          >
            <UserPlus className="w-4 h-4 mb-0.5" />
            <span>Enregistrer</span>
          </button>
          <button
            onClick={() => setActiveTab('souls')}
            className={`flex flex-col items-center py-1 px-2 rounded-[5px] font-bold ${
              activeTab === 'souls' ? 'text-indigo-900 font-extrabold bg-indigo-50' : 'text-slate-600'
            }`}
          >
            <TableProperties className="w-4 h-4 mb-0.5" />
            <span>Tableau ({souls.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('cells')}
            className={`flex flex-col items-center py-1 px-2 rounded-[5px] font-bold ${
              activeTab === 'cells' ? 'text-indigo-900 font-extrabold bg-indigo-50' : 'text-slate-600'
            }`}
          >
            <Home className="w-4 h-4 mb-0.5" />
            <span>Cellules</span>
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`flex flex-col items-center py-1 px-2 rounded-[5px] font-bold ${
              activeTab === 'stats' ? 'text-indigo-900 font-extrabold bg-indigo-50' : 'text-slate-600'
            }`}
          >
            <BarChart3 className="w-4 h-4 mb-0.5" />
            <span>Statistiques</span>
          </button>
        </div>
      </div>
    </header>
  );
};
