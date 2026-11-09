import React, { useEffect, useState } from 'react';
import { obtenerMensajeError } from '../../utils/obtenerMensajeError';
import { productosService } from '../../api/productosService';
import { categoriasService } from '../../api/categoriasService';
import { useToast } from '../../context/ToastContext';

export default function ProductosPage() {
  const { addToast } = useToast();
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [form, setForm] = useState({ nombre: '', categoria_id: '', requiere_asistencia: false });
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState('');
  const cargar = async () => {
    try { const [p, c] = await Promise.all([productosService.getAll(), categoriasService.getAll()]); setProductos(p); setCategorias(c); }
    catch (error) { setError(obtenerMensajeError(error)); addToast(obtenerMensajeError(error), 'error'); }
  };
  useEffect(() => { cargar(); }, []);
  const guardar = async (event) => {
    event.preventDefault();
    try {
      if (editId) await productosService.update(editId, form); else await productosService.create(form);
      setForm({ nombre: '', categoria_id: '', requiere_asistencia: false }); setEditId(null); await cargar();
      addToast('Producto guardado.', 'success');
    } catch (error) { addToast(obtenerMensajeError(error), 'error'); }
  };
  const editar = (p) => { setEditId(p.id); setForm({ nombre: p.nombre, categoria_id: p.categoria_id, requiere_asistencia: p.requiere_asistencia }); };
  const activar = async (p) => { try { if (p.activo) await productosService.deactivate(p.id); else await productosService.reactivate(p.id); await cargar(); } catch (error) { addToast(obtenerMensajeError(error), 'error'); } };
  return <section className="space-y-5">
    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Productos y clases</h1>
    <form onSubmit={guardar} className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 sm:grid-cols-4">
      <input required value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} placeholder="Nombre" className="rounded border p-2 dark:bg-slate-950" />
      <select required value={form.categoria_id} onChange={(e) => setForm({ ...form, categoria_id: e.target.value })} className="rounded border p-2 dark:bg-slate-950"><option value="">Categoría</option>{categorias.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}</select>
      <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300"><input type="checkbox" checked={form.requiere_asistencia} onChange={(e) => setForm({ ...form, requiere_asistencia: e.target.checked })} /> Es clase</label>
      <button className="rounded bg-emerald-600 px-4 py-2 text-white">{editId ? 'Guardar cambios' : 'Crear producto'}</button>
    </form>
    {error && <p role="alert">{error}</p>}
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"><table className="w-full text-left text-sm"><thead><tr><th className="p-3">Producto</th><th className="p-3">Categoría</th><th className="p-3">Tipo</th><th className="p-3">Estado</th><th className="p-3">Acciones</th></tr></thead><tbody>{productos.map((p) => <tr key={p.id} className="border-t border-slate-200 dark:border-slate-800"><td className="p-3">{p.nombre}</td><td className="p-3">{categorias.find((c) => c.id === p.categoria_id)?.nombre || p.categoria_id}</td><td className="p-3">{p.requiere_asistencia ? 'Clase' : 'Amenidad'}</td><td className="p-3">{p.activo ? 'Activo' : 'Inactivo'}</td><td className="p-3"><button onClick={() => editar(p)} className="mr-3 text-emerald-700 dark:text-emerald-400">Editar</button><button onClick={() => activar(p)}>{p.activo ? 'Desactivar' : 'Reactivar'}</button></td></tr>)}</tbody></table></div>
  </section>;
}
