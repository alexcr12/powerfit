import React, { useEffect, useState } from 'react';
import { obtenerMensajeError } from '../../utils/obtenerMensajeError';
import { useNavigate } from 'react-router-dom';
import { sociosService } from '../../api/sociosService';
import { productosService } from '../../api/productosService';
import { asistenciasService } from '../../api/asistenciasService';
import { useToast } from '../../context/ToastContext';
import Button from '../../components/common/Button';

export default function NuevaAsistenciaPage() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [socios, setSocios] = useState([]);
  const [clases, setClases] = useState([]);
  const [socioId, setSocioId] = useState('');
  const [productoId, setProductoId] = useState('');
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    Promise.all([sociosService.getAll(), productosService.getClases()])
      .then(([s, c]) => { setSocios(s.filter((socio) => socio.activo)); setClases(c); })
      .catch((error) => addToast(obtenerMensajeError(error), 'error'));
  }, [addToast]);
  const registrar = async (event) => {
    event.preventDefault();
    try {
      setSaving(true);
      await asistenciasService.create({ socioId, productoId, fechaHora: new Date().toISOString().slice(0, 19).replace('T', ' ') });
      addToast('Asistencia registrada.', 'success');
      navigate('/asistencias');
    } catch (error) { addToast(obtenerMensajeError(error), 'error'); }
    finally { setSaving(false); }
  };
  return <section className="mx-auto max-w-xl space-y-5">
    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Registrar asistencia a clase</h1>
    <form onSubmit={registrar} className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <label className="block text-sm text-slate-700 dark:text-slate-300">Socio<select required value={socioId} onChange={(e) => setSocioId(e.target.value)} className="mt-1 w-full rounded border p-2 dark:bg-slate-950">{<option value="">Selecciona socio</option>}{socios.map((s) => <option key={s.id} value={s.id}>{s.nombre} · {s.documento}</option>)}</select></label>
      <label className="block text-sm text-slate-700 dark:text-slate-300">Clase<select required value={productoId} onChange={(e) => setProductoId(e.target.value)} className="mt-1 w-full rounded border p-2 dark:bg-slate-950">{<option value="">Selecciona clase</option>}{clases.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}</select></label>
      <p className="text-xs text-slate-600 dark:text-slate-400">El backend valida la membresía correspondiente a la categoría de la clase.</p>
      <Button type="submit" loading={saving} disabled={!socioId || !productoId}>Registrar</Button>
    </form>
  </section>;
}



