import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  CreditCard,
  CalendarCheck,
  Ticket,
  ArrowRight,
  Clock,
  Sparkles
} from 'lucide-react';
import api from '../../api/axiosInstance';
import { useAuth } from '../../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    sociosActivos: 0,
    membresiasVigentes: 0,
    asistenciasHoy: 0,
    pasesEmitidos: 0,
  });
  const [recentAsistencias, setRecentAsistencias] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);
        const [resSocios, resMembresias, resAsistencias, resPases] = await Promise.all([
          api.get('/socios'),
          api.get('/membresias'),
          api.get('/asistencias'),
          api.get('/pases_invitado'),
        ]);

        const socios = resSocios.data || [];
        const membresias = resMembresias.data || [];
        const asistencias = resAsistencias.data || [];
        const pases = resPases.data || [];

        const hoyStr = new Date().toISOString().split('T')[0];
        const hoyAsist = asistencias.filter((a) => a.fechaHora?.startsWith(hoyStr) || a.fecha_hora?.startsWith(hoyStr));

        setStats({
          sociosActivos: socios.filter((s) => s.activo).length,
          membresiasVigentes: membresias.filter((m) => m.estado === 'activa').length,
          asistenciasHoy: hoyAsist.length > 0 ? hoyAsist.length : asistencias.slice(-5).length,
          pasesEmitidos: pases.length,
        });

        // 🔥 ARREGLO DEL BUG "SOCIO #UNDEFINED"
        const sociosMap = Object.fromEntries(socios.map((s) => [s.id, s.nombre]));
        const ultimas = [...asistencias].reverse().slice(0, 5).map((a) => {
          // Busca el nombre en el objeto anidado (socio.nombre) o en el mapa por ID
          const idSocio = a.socio?.id || a.socio_id;
          return {
            ...a,
            socioNombre: a.socio?.nombre || sociosMap[idSocio] || `Socio #${idSocio || 'Desconocido'}`,
          };
        });
        setRecentAsistencias(ultimas);
      } catch (err) {
        console.error('Error al cargar métricas del dashboard:', err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  return (
    <div className="space-y-6">
      {/* TARJETA DE BIENVENIDA */}
            {/* TARJETA DE BIENVENIDA */}
      <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-gradient-to-r dark:from-emerald-800 dark:via-emerald-950 dark:to-slate-900 border border-slate-200 dark:border-emerald-500/30 p-6 sm:p-8 shadow-sm dark:shadow-2xl dark:shadow-emerald-900/20 transition-colors duration-300">
        <div className="relative z-10 max-w-2xl">
          
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-500/20 border border-emerald-200 dark:border-emerald-400/30 text-emerald-700 dark:text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-3">
            <Sparkles size={14} />
            Sistema PowerFit GYM • Avance 1
          </div>
          
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Bienvenido, <span className="text-emerald-600 dark:text-emerald-400">{user?.nombre}</span>
          </h1>
          
          <p className="text-slate-600 dark:text-slate-200 text-sm mt-2 leading-relaxed font-medium">
            Plataforma integral de gestión administrativa, suscripciones individuales y control de accesos para el personal de gimnasio.
          </p>
          
        </div>
      </div>
      {/* CUADROS DE ESTADÍSTICAS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm dark:shadow-lg flex items-center justify-between transition-colors">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Socios Activos</p>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white mt-1">{loading ? '-' : stats.sociosActivos}</h3>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">Habilitados en recepción</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <Users size={22} />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm dark:shadow-lg flex items-center justify-between transition-colors">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Membresías Vigentes</p>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white mt-1">{loading ? '-' : stats.membresiasVigentes}</h3>
            <span className="text-[11px] text-blue-600 dark:text-emerald-400 font-medium">Suscripciones al día</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <CreditCard size={22} />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm dark:shadow-lg flex items-center justify-between transition-colors">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Asistencias</p>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white mt-1">{loading ? '-' : stats.asistenciasHoy}</h3>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Registradas recientemente</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <CalendarCheck size={22} />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm dark:shadow-lg flex items-center justify-between transition-colors">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Pases Invitados</p>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white mt-1">{loading ? '-' : stats.pasesEmitidos}</h3>
            <span className="text-[11px] text-purple-600 dark:text-purple-400 font-medium">Bajo reglas R1 y R5</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-400">
            <Ticket size={22} />
          </div>
        </div>
      </div>

      {/* BOTONES DE ACCESO RÁPIDO */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          to="/asistencias/nueva"
          className="group p-5 rounded-2xl bg-white dark:bg-gradient-to-br dark:from-slate-900 dark:to-slate-900/80 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 transition-all shadow-sm dark:shadow-lg flex items-center justify-between"
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-slate-800 dark:text-white font-bold text-sm group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
              <CalendarCheck size={18} className="text-emerald-600 dark:text-emerald-400" />
              <span>Registrar Asistencia (RF18)</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Valida membresía activa antes del ingreso</p>
          </div>
          <ArrowRight size={18} className="text-slate-400 dark:text-slate-500 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
        </Link>

        <Link
          to="/membresias/nueva"
          className="group p-5 rounded-2xl bg-white dark:bg-gradient-to-br dark:from-slate-900 dark:to-slate-900/80 border border-slate-200 dark:border-slate-800 hover:border-blue-500/50 dark:hover:border-blue-500/50 transition-all shadow-sm dark:shadow-lg flex items-center justify-between"
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-slate-800 dark:text-white font-bold text-sm group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              <CreditCard size={18} className="text-blue-600 dark:text-blue-400" />
              <span>Contratar Membresía (RF14)</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Selección de productos con descuento R4</p>
          </div>
          <ArrowRight size={18} className="text-slate-400 dark:text-slate-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
        </Link>

        <Link
          to="/socios/nuevo"
          className="group p-5 rounded-2xl bg-white dark:bg-gradient-to-br dark:from-slate-900 dark:to-slate-900/80 border border-slate-200 dark:border-slate-800 hover:border-purple-500/50 dark:hover:border-purple-500/50 transition-all shadow-sm dark:shadow-lg flex items-center justify-between"
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-slate-800 dark:text-white font-bold text-sm group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
              <Users size={18} className="text-purple-600 dark:text-purple-400" />
              <span>Registrar Nuevo Socio (RF01)</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Alta de cliente para atención en recepción</p>
          </div>
          <ArrowRight size={18} className="text-slate-400 dark:text-slate-500 group-hover:text-purple-600 dark:group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
        </Link>
      </div>

      {/* ÚLTIMAS ASISTENCIAS */}
      <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm dark:shadow-lg transition-colors">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock size={18} className="text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-base font-bold text-slate-800 dark:text-white">Últimas Asistencias en Molinete</h2>
          </div>
          <Link
            to="/asistencias"
            className="text-xs text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 dark:hover:text-emerald-300 font-medium flex items-center gap-1"
          >
            <span>Ver historial completo</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {recentAsistencias.length === 0 ? (
          <p className="text-xs text-slate-500 py-4 text-center">No hay registros recientes</p>
        ) : (
          <div className="divide-y divide-slate-200 dark:divide-slate-800">
            {recentAsistencias.map((item) => (
              <div key={item.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-slate-700 dark:text-slate-200 block">{item.socioNombre}</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">{item.sede}</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-600 dark:text-slate-300 font-mono">
                    {(item.fechaHora || item.fecha_hora || '').replace('T', ' ')}
                  </span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block">Acceso validado</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}