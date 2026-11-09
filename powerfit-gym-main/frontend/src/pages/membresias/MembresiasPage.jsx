import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { obtenerMensajeError } from '../../utils/obtenerMensajeError';
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
  const [editando, setEditando] = useState(null);
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [montoTotal, setMontoTotal] = useState('');

  // Carga las membresías y sus nombres relacionados.
  const cargar = async () => {
    try {
      const [lista, listaSocios, listaCategorias] = await Promise.all([
        membresiasService.getAll(),
        sociosService.getAll(),
        categoriasService.getAll(),
      ]);
      setMembresias(lista);
      setSocios(listaSocios);
      setCategorias(listaCategorias);
    } catch (error) {
      addToast(obtenerMensajeError(error), 'error');
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  // Abre la edición con los valores de la membresía elegida.
  const editar = (membresia) => {
    setEditando(membresia);
    setFechaInicio(membresia.fecha_inicio);
    setFechaFin(membresia.fecha_fin);
    setMontoTotal(membresia.monto_total);
  };

  // Valida y guarda los campos editables de RF27.
  const guardarEdicion = async (event) => {
    event.preventDefault();
    if (fechaFin < fechaInicio) {
      addToast('La fecha de fin debe ser igual o posterior a la fecha de inicio.', 'error');
      return;
    }
    if (Number(montoTotal) <= 0) {
      addToast('El monto debe ser mayor que cero.', 'error');
      return;
    }
    try {
      await membresiasService.actualizar(editando.id, {
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin,
        monto_total: Number(montoTotal),
      });
      addToast('Membresía actualizada.', 'success');
      setEditando(null);
      await cargar();
    } catch (error) {
      addToast(obtenerMensajeError(error), 'error');
    }
  };

  // Confirma la baja lógica de la membresía.
  const cancelar = async (membresia) => {
    if (!window.confirm(`¿Cancelar la membresía #${membresia.id}?`)) return;
    try {
      await membresiasService.delete(membresia.id);
      addToast('Membresía cancelada.', 'success');
      await cargar();
    } catch (error) {
      addToast(obtenerMensajeError(error), 'error');
    }
  };

  const fechaHoy = new Date().toLocaleDateString('en-CA');
  const nombreSocio = (membresia) => socios.find((socio) => socio.id === membresia.socio_id)?.nombre || `Socio #${membresia.socio_id}`;
  const nombreCategoria = (membresia) => categorias.find((categoria) => categoria.id === membresia.categoria_id)?.nombre || `Categoría #${membresia.categoria_id}`;

  return (
    <section className="space-y-5">
      <header className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Membresías</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">Consulta y actualización de membresías.</p>
        </div>
        <Link to="/membresias/nueva" className="rounded-lg bg-emerald-600 px-4 py-2 text-white">Nueva membresía</Link>
      </header>

      {editando && (
        <form onSubmit={guardarEdicion} className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 sm:grid-cols-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white sm:col-span-4">Editar membresía #{editando.id}</h2>
          <label className="text-sm text-slate-700 dark:text-slate-300">Fecha de inicio
            <input required type="date" value={fechaInicio} onChange={(event) => setFechaInicio(event.target.value)} className="mt-1 block w-full rounded border p-2 dark:bg-slate-950" />
          </label>
          <label className="text-sm text-slate-700 dark:text-slate-300">Fecha de fin
            <input required type="date" value={fechaFin} onChange={(event) => setFechaFin(event.target.value)} className="mt-1 block w-full rounded border p-2 dark:bg-slate-950" />
          </label>
          <label className="text-sm text-slate-700 dark:text-slate-300">Monto
            <input required type="number" min="0.01" step="0.01" value={montoTotal} onChange={(event) => setMontoTotal(event.target.value)} className="mt-1 block w-full rounded border p-2 dark:bg-slate-950" />
          </label>
          <div className="flex items-end gap-2">
            <button type="submit" className="rounded-lg bg-emerald-600 px-4 py-2 text-white">Guardar</button>
            <button type="button" onClick={() => setEditando(null)} className="rounded-lg border px-4 py-2">Cancelar</button>
          </div>
        </form>
      )}

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <table className="w-full text-left text-sm">
          <thead><tr><th className="p-3">Socio</th><th className="p-3">Tipo de membresía</th><th className="p-3">Fecha de inicio</th><th className="p-3">Fecha de fin</th><th className="p-3">Monto</th><th className="p-3">Estado</th><th className="p-3">Acciones</th></tr></thead>
          <tbody>
            {membresias.map((membresia) => {
              const estado = !membresia.activo ? 'Cancelada' : membresia.fecha_fin >= fechaHoy ? 'Vigente' : 'Vencida';
              return (
                <tr key={membresia.id} className="border-t border-slate-200 dark:border-slate-800">
                  <td className="p-3">{nombreSocio(membresia)}</td>
                  <td className="p-3">{nombreCategoria(membresia)}</td>
                  <td className="p-3">{formatDate(membresia.fecha_inicio)}</td>
                  <td className="p-3">{formatDate(membresia.fecha_fin)}</td>
                  <td className="p-3">{formatCurrency(membresia.monto_total || 0)}</td>
                  <td className="p-3">{estado}</td>
                  <td className="space-x-3 p-3">
                    {membresia.activo && <>
                      <button onClick={() => editar(membresia)} className="text-emerald-700 dark:text-emerald-400">Editar</button>
                      <button onClick={() => cancelar(membresia)} className="text-red-700 dark:text-red-400">Cancelar</button>
                    </>}
                  </td>
                </tr>
              );
            })}
            {membresias.length === 0 && <tr><td colSpan="7" className="p-5 text-center text-slate-500">No hay membresías registradas.</td></tr>}
          </tbody>
        </table>
      </div>
    </section>
  );
}
