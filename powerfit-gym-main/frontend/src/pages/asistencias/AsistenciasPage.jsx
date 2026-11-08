import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { obtenerMensajeError } from '../../utils/obtenerMensajeError';
import { asistenciasService } from '../../api/asistenciasService';
import { productosService } from '../../api/productosService';
import { sociosService } from '../../api/sociosService';
import { useToast } from '../../context/ToastContext';
import ConfirmDialog from '../../components/common/ConfirmDialog';

export default function AsistenciasPage() {
  const { addToast } = useToast();
  const [asistencias, setAsistencias] = useState([]);
  const [socios, setSocios] = useState([]);
  const [clases, setClases] = useState([]);
  const [socioFiltro, setSocioFiltro] = useState('');
  const [fechaFiltro, setFechaFiltro] = useState('');
  const [asistenciaEditar, setAsistenciaEditar] = useState(null);
  const [fechaHora, setFechaHora] = useState('');
  const [productoId, setProductoId] = useState('');
  const [confirmDelete, setConfirmDelete] = useState({ isOpen: false, asistencia: null, loading: false });

  // Carga el listado inicial, socios y clases activas.
  const cargarDatos = async () => {
    try {
      const [lista, listaSocios, listaClases] = await Promise.all([
        asistenciasService.getAll(),
        sociosService.getAll(),
        productosService.getClases(),
      ]);
      setAsistencias(lista);
      setSocios(listaSocios);
      setClases(listaClases);
    } catch (error) {
      addToast(obtenerMensajeError(error), 'error');
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  // Consulta por socio cuando se elige un filtro.
  const filtrarSocio = async (id) => {
    setSocioFiltro(id);
    try {
      setAsistencias(id ? await asistenciasService.getBySocioId(id) : await asistenciasService.getAll());
    } catch (error) {
      addToast(obtenerMensajeError(error), 'error');
    }
  };

  // Restablece los filtros y vuelve a cargar todas las asistencias.
  const limpiarFiltros = async () => {
    setSocioFiltro('');
    setFechaFiltro('');
    try {
      setAsistencias(await asistenciasService.getAll());
    } catch (error) {
      addToast(obtenerMensajeError(error), 'error');
    }
  };

  // Abre el formulario con la fecha y clase actuales.
  const abrirEdicion = (asistencia) => {
    setAsistenciaEditar(asistencia);
    setFechaHora((asistencia.fecha_hora || '').replace(' ', 'T').slice(0, 16));
    setProductoId(String(asistencia.producto_id || ''));
  };

  // Actualiza fecha y clase de la asistencia seleccionada.
  const guardarEdicion = async (event) => {
    event.preventDefault();
    try {
      await asistenciasService.update(asistenciaEditar.id, {
        fecha_hora: fechaHora,
        producto_id: productoId,
      });
      addToast('Asistencia actualizada.', 'success');
      setAsistenciaEditar(null);
      await cargarDatos();
    } catch (error) {
      addToast(obtenerMensajeError(error), 'error');
    }
  };

  // Abre la confirmación de borrado físico.
  const eliminar = (asistencia) => setConfirmDelete({ isOpen: true, asistencia, loading: false });

  // Elimina físicamente la asistencia después de confirmar.
  const confirmarEliminacion = async () => {
    try {
      setConfirmDelete((actual) => ({ ...actual, loading: true }));
      await asistenciasService.delete(confirmDelete.asistencia.id);
      addToast('Registro de asistencia eliminado físicamente.', 'info');
      setConfirmDelete({ isOpen: false, asistencia: null, loading: false });
      await cargarDatos();
    } catch (error) {
      addToast(obtenerMensajeError(error), 'error');
      setConfirmDelete((actual) => ({ ...actual, loading: false }));
    }
  };
  const listaFiltrada = asistencias.filter((asistencia) => {
    const fecha = String(asistencia.fecha_hora || '').slice(0, 10);
    return !fechaFiltro || fecha === fechaFiltro;
  });

  return (
    <main className="space-y-5">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Asistencias</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">Registros de asistencia a clases.</p>
        </div>
        <Link to="/asistencias/nueva" className="rounded-lg bg-emerald-600 px-4 py-2 text-sm text-white">Registrar asistencia</Link>
      </header>

      <section className="flex flex-wrap items-end gap-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <label className="text-sm text-slate-700 dark:text-slate-300">Socio
          <select value={socioFiltro} onChange={(event) => filtrarSocio(event.target.value)} className="mt-1 block rounded-lg border border-slate-300 bg-white p-2 text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white">
            <option value="">Todos</option>
            {socios.map((socio) => <option key={socio.id} value={socio.id}>{socio.nombre}</option>)}
          </select>
        </label>
        <label className="text-sm text-slate-700 dark:text-slate-300">Fecha
          <input type="date" value={fechaFiltro} onChange={(event) => setFechaFiltro(event.target.value)} className="mt-1 block rounded-lg border border-slate-300 bg-white p-2 text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
        </label>
        <button onClick={limpiarFiltros} className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 dark:border-slate-700 dark:text-slate-200">Limpiar filtros</button>
      </section>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <table className="w-full text-left text-sm">
          <thead><tr><th className="p-3">Socio</th><th className="p-3">Clase</th><th className="p-3">Fecha y hora</th><th className="p-3">Acciones</th></tr></thead>
          <tbody>
            {listaFiltrada.map((asistencia) => (
              <tr key={asistencia.id} className="border-t border-slate-200 dark:border-slate-800">
                <td className="p-3">{socios.find((socio) => socio.id === asistencia.socio_id)?.nombre || `Socio #${asistencia.socio_id}`}</td>
                <td className="p-3">{asistencia.producto_nombre || clases.find((clase) => clase.id === asistencia.producto_id)?.nombre || `Clase #${asistencia.producto_id}`}</td>
                <td className="p-3">{(asistencia.fecha_hora || '').replace('T', ' ')}</td>
                <td className="space-x-3 p-3">
                  <button onClick={() => abrirEdicion(asistencia)} className="text-emerald-700 dark:text-emerald-400">Editar</button>
                  <button onClick={() => eliminar(asistencia)} className="text-red-700 dark:text-red-400">Eliminar</button>
                </td>
              </tr>
            ))}
            {listaFiltrada.length === 0 && <tr><td colSpan="4" className="p-5 text-center text-slate-500">No hay asistencias para mostrar.</td></tr>}
          </tbody>
        </table>
      </div>

      {asistenciaEditar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <form onSubmit={guardarEdicion} className="w-full max-w-md space-y-4 rounded-xl bg-white p-5 dark:bg-slate-900">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Editar asistencia</h2>
            <label className="block text-sm text-slate-700 dark:text-slate-300">Fecha y hora
              <input required type="datetime-local" value={fechaHora} onChange={(event) => setFechaHora(event.target.value)} className="mt-1 block w-full rounded-lg border border-slate-300 bg-white p-2 dark:border-slate-700 dark:bg-slate-950" />
            </label>
            <label className="block text-sm text-slate-700 dark:text-slate-300">Clase
              <select required value={productoId} onChange={(event) => setProductoId(event.target.value)} className="mt-1 block w-full rounded-lg border border-slate-300 bg-white p-2 dark:border-slate-700 dark:bg-slate-950">
                {clases.map((clase) => <option key={clase.id} value={clase.id}>{clase.nombre}</option>)}
              </select>
            </label>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setAsistenciaEditar(null)} className="rounded-lg border px-3 py-2 text-sm">Cancelar</button>
              <button type="submit" className="rounded-lg bg-emerald-600 px-3 py-2 text-sm text-white">Guardar cambios</button>
            </div>
          </form>
        </div>
      )}
          <ConfirmDialog
        isOpen={confirmDelete.isOpen}
        onClose={() => setConfirmDelete({ isOpen: false, asistencia: null, loading: false })}
        onConfirm={confirmarEliminacion}
        title="¿Eliminar Asistencia (Físico)?"
        message={`¿Está seguro de eliminar definitivamente el registro de asistencia #${confirmDelete.asistencia?.id}? Esta operación eliminará el registro de la base de datos (RF21).`}
        confirmText="Eliminar Definitivamente"
        variant="danger"
        loading={confirmDelete.loading}
      />
    </main>
  );
}

