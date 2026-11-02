import React from 'react';
import { LogOut, Menu, ShieldCheck, UserCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ROLE_LABELS, ROLES } from '../../constants/roles';

export default function Navbar({ onToggleSidebar }) {
  const { user, logout } = useAuth();

  return (
    <header className="h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between transition-colors duration-300">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          aria-label="Abrir menú"
        >
          <Menu size={20} />
        </button>
        <div className="flex items-center gap-2">
          <span className="hidden sm:inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 hidden sm:inline-block">
            API Conectada (Spring Boot)
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-3 pl-3 pr-2 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
          <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 border border-slate-300 dark:border-slate-700">
            {user?.rol === ROLES.ADMIN ? <ShieldCheck size={18} /> : <UserCheck size={18} />}
          </div>
          <div className="text-left hidden md:block">
            <p className="text-xs font-semibold text-slate-800 dark:text-white leading-tight">
              {user?.nombre || 'Usuario'}
            </p>
            <span className={`text-[10px] font-medium uppercase tracking-wider px-1.5 py-0.2 rounded ${
              user?.rol === ROLES.ADMIN
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
            }`}>
              {ROLE_LABELS[user?.rol] || user?.rol}
            </span>
          </div>
        </div>

        <button
          onClick={logout}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-red-500/10 text-slate-600 hover:text-red-500 dark:bg-slate-800/80 dark:hover:bg-red-500/20 dark:text-slate-300 dark:hover:text-red-400 border border-slate-300 dark:border-slate-700/80 dark:hover:border-red-500/30 text-xs font-medium transition-all cursor-pointer"
          title="Cerrar Sesión"
        >
          <LogOut size={16} />
          <span className="hidden sm:inline">Cerrar Sesión</span>
        </button>
      </div>
    </header>
  );
}