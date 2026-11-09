import React, { useEffect, useState } from 'react';
import { obtenerMensajeError } from '../../utils/obtenerMensajeError';
import { categoriasService } from '../../api/categoriasService';
import { useToast } from '../../context/ToastContext';
import { Ban, Pencil, UserCheck } from 'lucide-react';

export default function CategoriasPage() {
  const { addToast } = useToast();
  const [categorias, setCategorias] = useState([]);
  const [nombre, setNombre] = useState('');
  const [editId, setEditId] = useState(null);
  const cargar = async () => { try { setCategorias(await categoriasService.getAll()); } catch (error) { addToast(obtenerMensajeError(error), 'error'); } };
  useEffect(() => { cargar(); }, []);
  const guardar = async (event) => { event.preventDefault(); try { if (editId) await categoriasService.update(editId, { nombre }); else await categoriasService.create({ nombre }); setNombre(''); setEditId(null); await cargar(); } catch (error) { addToast(obtenerMensajeError(error), 'error'); } };
  const toggle = async (c) => { try { await categoriasService.toggleActive(c.id, c.activo); await cargar(); } catch (error) { addToast(obtenerMensajeError(error), 'error'); } };
  return <section className="space-y-5"><h1 className="text-2xl font-bold text-slate-900 dark:text-white">Categorías</h1><form onSubmit={guardar} className="flex gap-2 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"><input required value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Nombre de categoría" className="min-w-0 flex-1 rounded border p-2 dark:bg-slate-950" /><button className="rounded bg-emerald-600 px-4 py-2 text-white">{editId ? 'Guardar' : 'Crear'}</button></form><div className="overflow-x-auto rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"><table className="w-full text-left text-sm"><thead><tr><th className="p-3">Nombre</th><th className="p-3">Estado</th><th className="p-3 text-right">Acciones</th></tr></thead><tbody>{categorias.map((c) => <tr key={c.id} className="border-t border-slate-200 dark:border-slate-800"><td className="p-3">{c.nombre}</td><td className="p-3">{c.activo ? 'Activa' : 'Inactiva'}</td><td className="p-3"><div className="flex items-center justify-end gap-1.5"><button onClick={() => { setEditId(c.id); setNombre(c.nombre); }} className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors cursor-pointer" title="Editar" aria-label="Editar"><Pencil size={14} /></button>{c.activo ? <button onClick={() => toggle(c)} className="p-1.5 rounded-lg bg-red-100 hover:bg-red-200 dark:bg-red-500/10 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20 transition-colors cursor-pointer" title="Desactivar" aria-label="Desactivar"><Ban size={14} /></button> : <button onClick={() => toggle(c)} className="p-1.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 transition-colors cursor-pointer" title="Reactivar" aria-label="Reactivar"><UserCheck size={14} /></button>}</div></td></tr>)}</tbody></table></div></section>;
}
