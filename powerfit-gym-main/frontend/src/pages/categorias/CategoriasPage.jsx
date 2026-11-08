import React, { useEffect, useState } from 'react';
import { obtenerMensajeError } from '../../utils/obtenerMensajeError';
import { categoriasService } from '../../api/categoriasService';
import { useToast } from '../../context/ToastContext';

export default function CategoriasPage() {
  const { addToast } = useToast();
  const [categorias, setCategorias] = useState([]);
  const [nombre, setNombre] = useState('');
  const [editId, setEditId] = useState(null);
  const cargar = async () => { try { setCategorias(await categoriasService.getAll()); } catch (error) { addToast(obtenerMensajeError(error), 'error'); } };
  useEffect(() => { cargar(); }, []);
  const guardar = async (event) => { event.preventDefault(); try { if (editId) await categoriasService.update(editId, { nombre }); else await categoriasService.create({ nombre }); setNombre(''); setEditId(null); await cargar(); } catch (error) { addToast(obtenerMensajeError(error), 'error'); } };
  const toggle = async (c) => { try { await categoriasService.toggleActive(c.id, c.activo); await cargar(); } catch (error) { addToast(obtenerMensajeError(error), 'error'); } };
  return <section className="space-y-5"><h1 className="text-2xl font-bold text-slate-900 dark:text-white">Categorías</h1><form onSubmit={guardar} className="flex gap-2 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"><input required value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Nombre de categoría" className="min-w-0 flex-1 rounded border p-2 dark:bg-slate-950" /><button className="rounded bg-emerald-600 px-4 py-2 text-white">{editId ? 'Guardar' : 'Crear'}</button></form><div className="overflow-x-auto rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"><table className="w-full text-left text-sm"><thead><tr><th className="p-3">Nombre</th><th className="p-3">Estado</th><th className="p-3">Acciones</th></tr></thead><tbody>{categorias.map((c) => <tr key={c.id} className="border-t border-slate-200 dark:border-slate-800"><td className="p-3">{c.nombre}</td><td className="p-3">{c.activo ? 'Activa' : 'Inactiva'}</td><td className="p-3"><button onClick={() => { setEditId(c.id); setNombre(c.nombre); }} className="mr-3 text-emerald-700 dark:text-emerald-400">Editar</button><button onClick={() => toggle(c)}>{c.activo ? 'Desactivar' : 'Reactivar'}</button></td></tr>)}</tbody></table></div></section>;
}



