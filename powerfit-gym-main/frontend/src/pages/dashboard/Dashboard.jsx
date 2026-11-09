import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { obtenerMensajeError } from '../../utils/obtenerMensajeError';
import api, { API_BASE_URL } from '../../api/axiosInstance';
import { useToast } from '../../context/ToastContext';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client/dist/sockjs.min.js';

export default function Dashboard() {
  const { addToast } = useToast();
  const [metricas, setMetricas] = useState(null);
  const [contadores, setContadores] = useState([]);
  const [conectado, setConectado] = useState(false);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let activo = true;

    // Carga las métricas y el contador inicial del día.
    Promise.all([api.get('/metricas'), api.get('/asistencias/contador-hoy')])
      .then(([respuestaMetricas, respuestaContadores]) => {
        if (!activo) return;
        setMetricas(respuestaMetricas.data);
        setContadores(respuestaContadores.data);
      })
      .catch((error) => {
        if (activo) addToast(obtenerMensajeError(error), 'error');
      })
      .finally(() => {
        if (activo) {
          setCargando(false);
          cliente.activate();
        }
      });

    // Recibe y aplica los cambios de contador publicados por el backend.
    const cliente = new Client({
      webSocketFactory: () => new SockJS(`${API_BASE_URL}/ws`),
      reconnectDelay: 5000,
      onConnect: () => {
        setConectado(true);
        cliente.subscribe('/topic/asistencias', (mensaje) => {
          const contador = JSON.parse(mensaje.body);
          const fechaHoy = new Date().toLocaleDateString('en-CA');
          if (contador.fecha !== fechaHoy) return;

          setContadores((actuales) => {
            const existe = actuales.some((item) => item.productoId === contador.productoId);
            if (existe) return actuales.map((item) => item.productoId === contador.productoId ? contador : item);
            return [...actuales, contador];
          });
        });
      },
      onWebSocketClose: () => setConectado(false),
      onStompError: () => setConectado(false),
    });
    return () => {
      activo = false;
      cliente.deactivate();
    };
  }, [addToast]);

  const totalAsistencias = contadores.reduce((total, item) => total + item.total, 0);
  const membresiasPorTipo = metricas?.membresiasVigentesPorTipo || [];
  const maxMembresias = Math.max(0, ...membresiasPorTipo.map((item) => item.total));
  const maxAsistencias = Math.max(0, ...contadores.map((item) => item.total));

  return (
    <main className="space-y-6">
      <header className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Resumen de membresías y clases de hoy.</p>
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">WebSocket: {conectado ? 'conectado' : 'desconectado'}</p>
      </header>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Membresías vigentes por tipo</h2>
        <article className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm text-slate-600 dark:text-slate-400">Cuántas membresías vigentes hay de cada tipo.</p>
          {membresiasPorTipo.length === 0 && !cargando && <p className="text-sm text-slate-500 dark:text-slate-400">Sin datos</p>}
          {membresiasPorTipo.map((item) => {
            const ancho = maxMembresias === 0 ? 0 : (item.total / maxMembresias) * 100;
            return (
              <div key={item.categoria} className="grid grid-cols-[5rem_1fr_2rem] items-center gap-3">
                <span className="text-sm text-slate-700 dark:text-slate-300">{item.categoria}</span>
                <div className="h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                  <div className="h-full rounded-full bg-emerald-600 transition-all duration-500" style={{ width: `${ancho}%` }} />
                </div>
                <span className="text-right text-sm font-semibold text-slate-900 dark:text-white">{item.total}</span>
              </div>
            );
          })}
        </article>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Asistencias de hoy</h2>
        <article className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm text-slate-600 dark:text-slate-400">Total del día</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{cargando ? '…' : totalAsistencias}</p>
        </article>
        <article className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <h3 className="font-semibold text-slate-900 dark:text-white">Asistencias por clase</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">Compara cuántas asistencias tuvo cada clase hoy.</p>
          {contadores.length === 0 && !cargando && <p className="text-sm text-slate-500 dark:text-slate-400">Sin datos</p>}
          {contadores.map((item) => {
            const ancho = maxAsistencias === 0 ? 0 : (item.total / maxAsistencias) * 100;
            return (
              <div key={item.productoId} className="grid grid-cols-[6rem_1fr_2rem] items-center gap-3">
                <span className="text-sm text-slate-700 dark:text-slate-300">{item.producto}</span>
                <div className="h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                  <div className="h-full rounded-full bg-emerald-600 transition-all duration-500" style={{ width: `${ancho}%` }} />
                </div>
                <span className="text-right text-sm font-semibold text-slate-900 dark:text-white">{item.total}</span>
              </div>
            );
          })}
        </article>
      </section>

      <nav className="flex flex-wrap gap-3 text-sm">
        <Link className="text-emerald-700 dark:text-emerald-400" to="/asistencias">Ver asistencias</Link>
        <Link className="text-emerald-700 dark:text-emerald-400" to="/membresias">Ver membresías</Link>
      </nav>
    </main>
  );
}

