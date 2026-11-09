import React, { useEffect, useState } from 'react';
import { obtenerMensajeError } from '../../utils/obtenerMensajeError';
import { useNavigate } from 'react-router-dom';
import { categoriasService } from '../../api/categoriasService';
import { sociosService } from '../../api/sociosService';
import { membresiasService } from '../../api/membresiasService';
import { useToast } from '../../context/ToastContext';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';

export default function NuevaMembresiaPage() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [socios, setSocios] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [socioId, setSocioId] = useState('');
  const [categoriaId, setCategoriaId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([sociosService.getAll(), categoriasService.getAll()])
      .then(([sociosData, categoriasData]) => {
        setSocios(sociosData.filter((socio) => socio.activo));
        setCategorias(categoriasData.filter((categoria) => categoria.activo));
      })
      .catch((error) => addToast(obtenerMensajeError(error), 'error'))
      .finally(() => setLoading(false));
  }, [addToast]);

  const contratar = async (event) => {
    event.preventDefault();
    if (!socioId || !categoriaId) return addToast('Selecciona un socio y una categoría.', 'error');
    try {
      setSaving(true);
      await membresiasService.create({ socioId, categoriaId, fechaInicio: new Date().toLocaleDateString('en-CA') });
      addToast('Membresía contratada.', 'success');
      navigate('/membresias');
    } catch (error) {
      addToast(obtenerMensajeError(error), 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader message="Cargando datos..." />;
  return (
    <section className="mx-auto max-w-2xl space-y-5">
      <header>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Contratar membresía</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">El servidor calcula la vigencia y el monto.</p>
      </header>
      <form onSubmit={contratar} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Socio
          <select required value={socioId} onChange={(event) => setSocioId(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2 text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white">
            <option value="">Selecciona un socio</option>
            {socios.map((socio) => <option key={socio.id} value={socio.id}>{socio.nombre}</option>)}
          </select>
        </label>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Categoría
          <select required value={categoriaId} onChange={(event) => setCategoriaId(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2 text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white">
            <option value="">Selecciona una categoría</option>
            {categorias.map((categoria) => <option key={categoria.id} value={categoria.id}>{categoria.nombre}</option>)}
          </select>
        </label>
        <Button type="submit" loading={saving} disabled={!socioId || !categoriaId}>Contratar</Button>
      </form>
    </section>
  );
}
