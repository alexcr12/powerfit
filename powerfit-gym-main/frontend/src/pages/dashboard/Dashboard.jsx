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
          const hoy = new Date();
          const fechaHoy = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`;
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

  const asistenciasMetricas = metricas?.asistenciasHoy;

  return (
    <main className="space-y-6">
      <header className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Resumen de membresías y clases de hoy.</p>
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">WebSocket: {conectado ? 'conectado' : 'desconectado'}</p>
      </header>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Membresías vigentes por tipo</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {(metricas?.membresiasVigentesPorTipo || []).map((item) => (
            <article key={item.categoria} className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <p className="text-sm text-slate-600 dark:text-slate-400">{item.categoria}</p>
              <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{cargando ? '…' : item.total}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Asistencias de hoy</h2>
        <article className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm text-slate-600 dark:text-slate-400">Total del día</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{cargando ? '…' : asistenciasMetricas?.total ?? 0}</p>
        </article>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {(asistenciasMetricas?.porClase || []).map((item) => (
            <article key={item.producto} className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <p className="text-sm text-slate-600 dark:text-slate-400">{item.producto}</p>
              <p className="mt-1 text-xl font-bold text-slate-900 dark:text-white">{cargando ? '…' : item.total}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Contador en tiempo real por clase</h2>
        {contadores.length === 0 && !cargando && <p className="text-sm text-slate-500">No hay clases para mostrar.</p>}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {contadores.map((item) => (
            <article key={item.productoId} className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <p className="text-sm text-slate-600 dark:text-slate-400">{item.producto}</p>
              <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{item.total}</p>
            </article>
          ))}
        </div>
      </section>

      <nav className="flex flex-wrap gap-3 text-sm">
        <Link className="text-emerald-700 dark:text-emerald-400" to="/asistencias">Ver asistencias</Link>
        <Link className="text-emerald-700 dark:text-emerald-400" to="/membresias">Ver membresías</Link>
      </nav>
    </main>
  );
}

