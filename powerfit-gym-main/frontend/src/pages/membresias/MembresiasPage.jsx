import React, { useEffect, useState } from 'react';
import { obtenerMensajeError } from '../../utils/obtenerMensajeError';
import { Link } from 'react-router-dom';
import { membresiasService } from '../../api/membresiasService';
import { sociosService } from '../../api/sociosService';
import { categoriasService } from '../../api/categoriasService';
import { formatDate, formatCurrency } from '../../utils/formatters';
import { useToast } from '../../context/ToastContext';

export default function MembresiasPage() {
  const { addToast } = useToast();
  const [membresias, setMembresias] = useState([]);
  const [socios, setSocios] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [error, setError] = useState('');
  const cargar = async () => {
    try { const [m, s, c] = await Promise.all([membresiasService.getAll(), sociosService.getAll(), categoriasService.getAll()]); setMembresias(m); setSocios(s); setCategorias(c); }
    catch (error) { setError(obtenerMensajeError(error)); addToast(obtenerMensajeError(error), 'error'); }
  };
  useEffect(() => { cargar(); }, []);
  const desactivar = async (m) => {
    try { await membresiasService.delete(m.id); addToast('Membresía desactivada.', 'success'); await cargar(); }
    catch (error) { addToast(obtenerMensajeError(error), 'error'); }
  };
  const socioNombre = (m) => socios.find((s) => s.id === m.socio_id)?.nombre || `Socio #${m.socio_id}`;
  const categoriaNombre = (m) => categorias.find((c) => c.id === m.categoria_id)?.nombre || `Categoría #${m.categoria_id}`;
  return <section className="space-y-5">
    <header className="flex items-center justify-between"><div><h1 className="text-2xl font-bold text-slate-900 dark:text-white">Membresías</h1><p className="text-sm text-slate-600 dark:text-slate-400">Vigencia y monto administrados por el backend.</p></div><Link to="/membresias/nueva" className="rounded-lg bg-emerald-600 px-4 py-2 text-white">Nueva membresía</Link></header>
    {error && <p role="alert">{error}</p>}
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"><table className="w-full text-left text-sm"><thead><tr>{['Socio','Categoría','Inicio','Fin','Monto','Estado',''].map((h) => <th key={h} className="p-3">{h}</th>)}</tr></thead><tbody>{membresias.map((m) => <tr key={m.id} className="border-t border-slate-200 dark:border-slate-800"><td className="p-3">{socioNombre(m)}</td><td className="p-3">{categoriaNombre(m)}</td><td className="p-3">{formatDate(m.fecha_inicio)}</td><td className="p-3">{formatDate(m.fecha_fin)}</td><td className="p-3">{formatCurrency(m.monto_total || 0)}</td><td className="p-3">{m.activo ? 'Activa' : 'Inactiva'}</td><td className="p-3">{m.activo && <button onClick={() => desactivar(m)} className="text-red-700 dark:text-red-400">Desactivar</button>}</td></tr>)}</tbody></table></div>
  </section>;
}




