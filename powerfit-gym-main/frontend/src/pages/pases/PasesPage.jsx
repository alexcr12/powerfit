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
  const [fechaUso, setFechaUso] = useState(() => new Date().toISOString().slice(0, 10));
  const [disponibles, setDisponibles] = useState(null);
  const [saving, setSaving] = useState(false);
  const cargar = async () => { try { const [p, s] = await Promise.all([pasesService.getAll(), sociosService.getAll()]); setPases(p); setSocios(s); } catch (error) { addToast(obtenerMensajeError(error), 'error'); } };
  useEffect(() => { cargar(); }, []);
  useEffect(() => { if (!socioId) { setDisponibles(null); return; } pasesService.getDisponibles(socioId, fechaUso).then(setDisponibles).catch((error) => { setDisponibles(null); addToast(obtenerMensajeError(error), 'error'); }); }, [socioId, fechaUso]);
  const emitir = async (event) => { event.preventDefault(); try { setSaving(true); await pasesService.create({ socioId, nombreInv, fechaUso }); addToast('Pase generado.', 'success'); setNombreInv(''); await cargar(); } catch (error) { addToast(obtenerMensajeError(error), 'error'); } finally { setSaving(false); } };
  return <section className="space-y-5"><h1 className="text-2xl font-bold text-slate-900 dark:text-white">Pases de invitado</h1><form onSubmit={emitir} className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 sm:grid-cols-4"><select required value={socioId} onChange={(e) => setSocioId(e.target.value)} className="rounded border p-2 dark:bg-slate-950"><option value="">Socio</option>{socios.filter((s) => s.activo).map((s) => <option key={s.id} value={s.id}>{s.nombre}</option>)}</select><input required value={nombreInv} onChange={(e) => setNombreInv(e.target.value)} placeholder="Nombre del invitado" className="rounded border p-2 dark:bg-slate-950"/><input required type="date" value={fechaUso} onChange={(e) => setFechaUso(e.target.value)} className="rounded border p-2 dark:bg-slate-950"/><button disabled={saving || disponibles?.restantes === 0} className="rounded bg-emerald-600 px-4 py-2 text-white">Generar pase</button>{disponibles && <p className="text-sm text-slate-600 dark:text-slate-300 sm:col-span-4">Disponibles: {disponibles.restantes} de {disponibles.tope} este mes.</p>}</form><div className="overflow-x-auto rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"><table className="w-full text-left text-sm"><thead><tr><th className="p-3">Invitado</th><th className="p-3">Socio</th><th className="p-3">Fecha</th><th className="p-3">Estado</th></tr></thead><tbody>{pases.map((p) => <tr key={p.id} className="border-t border-slate-200 dark:border-slate-800"><td className="p-3">{p.nombre_inv}</td><td className="p-3">{socios.find((s) => s.id === p.socio_id)?.nombre || `#${p.socio_id}`}</td><td className="p-3">{formatDate(p.fecha_uso)}</td><td className="p-3">{p.activo ? 'Activo' : 'Anulado'}</td></tr>)}</tbody></table></div></section>;
}



