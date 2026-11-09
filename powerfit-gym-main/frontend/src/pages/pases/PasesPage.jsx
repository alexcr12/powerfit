import React, { useEffect, useState } from 'react';
import { obtenerMensajeError } from '../../utils/obtenerMensajeError';
import { pasesService } from '../../api/pasesService';
import { sociosService } from '../../api/sociosService';
import { useToast } from '../../context/ToastContext';
import { formatDate } from '../../utils/formatters';

export default function PasesPage() {
  const { addToast } = useToast();
  const [pases, setPases] = useState([]);
  const [socios, setSocios] = useState([]);
  const [socioId, setSocioId] = useState('');
  const [nombreInv, setNombreInv] = useState('');
  const [fechaUso, setFechaUso] = useState(() => new Date().toLocaleDateString('en-CA'));
  const [disponibles, setDisponibles] = useState(null);
  const [editando, setEditando] = useState(null);
  const [saving, setSaving] = useState(false);

  // Recarga la lista y la disponibilidad del socio seleccionado.
  const recargarTodo = async (idSocio = socioId, fecha = fechaUso) => {
    try {
      const [lista, datosDisponibles] = await Promise.all([
        pasesService.getAll(),
        idSocio ? pasesService.getDisponibles(idSocio, fecha) : Promise.resolve(null),
      ]);
      setPases(lista);
      setDisponibles(datosDisponibles);
    } catch (error) {
      addToast(obtenerMensajeError(error), 'error');
    }
  };

  useEffect(() => {
    recargarTodo();
    sociosService.getAll()
      .then(setSocios)
      .catch((error) => addToast(obtenerMensajeError(error), 'error'));
  }, []);

  // Actualiza los datos del mes seleccionado para el socio.
  useEffect(() => {
    if (!socioId) {
      setDisponibles(null);
      return;
    }
    pasesService.getDisponibles(socioId, fechaUso)
      .then(setDisponibles)
      .catch((error) => {
        setDisponibles(null);
        addToast(obtenerMensajeError(error), 'error');
      });
  }, [socioId, fechaUso, addToast]);

  // Crea o edita un pase según el modo del formulario.
  const guardar = async (event) => {
    event.preventDefault();
    try {
      setSaving(true);
      if (editando) {
        await pasesService.actualizar(editando.id, { nombre_inv: nombreInv.trim(), fecha_uso: fechaUso });
        addToast('Pase actualizado.', 'success');
      } else {
        await pasesService.create({ socioId, nombreInv, fechaUso });
        addToast('Pase generado.', 'success');
      }
      setEditando(null);
      setNombreInv('');
      await recargarTodo();
    } catch (error) {
      addToast(obtenerMensajeError(error), 'error');
    } finally {
      setSaving(false);
    }
  };

  // Carga los datos del pase elegido en el formulario.
  const editar = (pase) => {
    setEditando(pase);
    setSocioId(String(pase.socio_id));
    setNombreInv(pase.nombre_inv);
    setFechaUso(pase.fecha_uso);
  };

  // Confirma y anula el pase seleccionado.
  const anular = async (pase) => {
    if (!window.confirm(`¿Anular el pase de ${pase.nombre_inv}?`)) return;
    try {
      await pasesService.anular(pase.id);
      addToast('Pase anulado.', 'success');
      await recargarTodo();
    } catch (error) {
      addToast(obtenerMensajeError(error), 'error');
    }
  };

  const cancelarEdicion = () => {
    setEditando(null);
    setNombreInv('');
  };

  return (
    <section className="space-y-5">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Pases de invitado</h1>

      <form onSubmit={guardar} className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 sm:grid-cols-4">
        {!editando && (
          <select required value={socioId} onChange={(event) => setSocioId(event.target.value)} className="rounded border p-2 dark:bg-slate-950">
            <option value="">Selecciona un socio</option>
            {socios.filter((socio) => socio.activo).map((socio) => <option key={socio.id} value={socio.id}>{socio.nombre}</option>)}
          </select>
        )}
        <input required value={nombreInv} onChange={(event) => setNombreInv(event.target.value)} placeholder="Nombre del invitado" className="rounded border p-2 dark:bg-slate-950" />
        <input required type="date" value={fechaUso} onChange={(event) => setFechaUso(event.target.value)} className="rounded border p-2 dark:bg-slate-950" />
        <button disabled={saving || (!editando && (!socioId || disponibles?.restantes === 0))} className="rounded bg-emerald-600 px-4 py-2 text-white">
          {saving ? 'Guardando…' : editando ? 'Guardar cambios' : 'Generar pase'}
        </button>
        {editando && <button type="button" onClick={cancelarEdicion} className="rounded border px-4 py-2">Cancelar edición</button>}
        {!editando && disponibles && (
          <div className="text-sm text-slate-600 dark:text-slate-300 sm:col-span-4">
            <p>Tope: {disponibles.tope} · Usados: {disponibles.usados} · Restantes: {disponibles.restantes}{disponibles.primeraMembresia ? ' (primera membresía)' : ''}</p>
            {disponibles.restantes === 0 && <p>No quedan pases disponibles para este mes.</p>}
          </div>
        )}
      </form>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <table className="w-full text-left text-sm">
          <thead><tr><th className="p-3">Socio</th><th className="p-3">Invitado</th><th className="p-3">Fecha de uso</th><th className="p-3">Estado</th><th className="p-3">Acciones</th></tr></thead>
          <tbody>
            {pases.map((pase) => (
              <tr key={pase.id} className="border-t border-slate-200 dark:border-slate-800">
                <td className="p-3">{socios.find((socio) => socio.id === pase.socio_id)?.nombre || `#${pase.socio_id}`}</td>
                <td className="p-3">{pase.nombre_inv}</td>
                <td className="p-3">{formatDate(pase.fecha_uso)}</td>
                <td className="p-3">{pase.activo ? 'Activo' : 'Anulado'}</td>
                <td className="space-x-3 p-3">
                  {pase.activo && <>
                    <button onClick={() => editar(pase)} className="text-emerald-700 dark:text-emerald-400">Editar</button>
                    <button onClick={() => anular(pase)} className="text-red-700 dark:text-red-400">Anular</button>
                  </>}
                </td>
              </tr>
            ))}
            {pases.length === 0 && <tr><td colSpan="5" className="p-5 text-center text-slate-500">No hay pases registrados.</td></tr>}
          </tbody>
        </table>
      </div>
    </section>
  );
}


