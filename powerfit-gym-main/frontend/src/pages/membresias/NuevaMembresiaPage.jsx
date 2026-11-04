import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Lock } from 'lucide-react';
import { sociosService } from '../../api/sociosService';
import { productosService } from '../../api/productosService';
import { categoriasService } from '../../api/categoriasService';
import { membresiasService } from '../../api/membresiasService';
import { useToast } from '../../context/ToastContext';
import { formatCurrency } from '../../utils/formatters';
import { evaluarPrimeraMembresia, calcularMontoMembresia } from '../../utils/businessRules';
import Loader from '../../components/common/Loader';
import Button from '../../components/common/Button';

export default function NuevaMembresiaPage() {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [socios, setSocios] = useState([]);
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedSocioId, setSelectedSocioId] = useState('');
  const [selectedCategoriaId, setSelectedCategoriaId] = useState('');
  const [selectedProductIds, setSelectedProductIds] = useState([]);
  const [isPrimeraMembresia, setIsPrimeraMembresia] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [socData, prodData, catData] = await Promise.all([
          sociosService.getAll(),
          productosService.getAll(),
          categoriasService.getAll(),
        ]);
        setSocios(socData.filter((s) => s.activo));
        setProductos(prodData.filter((p) => p.activo));
        setCategorias(catData.filter((c) => c.activo));
      } catch {
        addToast('Error al cargar datos.', 'error');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [addToast]);

  const handleSocioChange = async (socioId) => {
    setSelectedSocioId(socioId);
    if (!socioId) {
      setIsPrimeraMembresia(false);
      return;
    }
    try {
      const historial = await membresiasService.getBySocioId(socioId);
      const evaluacion = evaluarPrimeraMembresia(historial);
      setIsPrimeraMembresia(evaluacion.esPrimera);
    } catch {
      setIsPrimeraMembresia(false);
    }
  };

  const handleCategoriaSelect = (catId) => {
    setSelectedCategoriaId(catId);
    const catSeleccionada = categorias.find(c => c.id === catId);
    
    if (catSeleccionada && catSeleccionada.beneficiosBase) {
      setSelectedProductIds(catSeleccionada.beneficiosBase.map(p => p.id));
    } else {
      setSelectedProductIds([]);
    }
  };

  const productosBase = productos
    .filter(p => selectedProductIds.includes(p.id))
    .map(p => ({ ...p, precio_base: Number(p.precioBase ?? p.precio_base ?? 0) }));

  const financialSummary = calcularMontoMembresia(productosBase);

  const handleConfirmarContratacion = async () => {
    if (!selectedSocioId) return addToast('Selecciona un socio.', 'error');
    if (!selectedCategoriaId) return addToast('Selecciona el tipo de membresía.', 'error');

    try {
      setSaving(true);
      const hoy = new Date();
      const fechaInicio = hoy.toISOString().split('T')[0];
      const fin = new Date(hoy);
      fin.setMonth(fin.getMonth() + 1);
      const fechaFin = fin.toISOString().split('T')[0];

      const currentCatName = categorias.find(c => c.id === selectedCategoriaId)?.nombre;

      await membresiasService.create({
        socioId: Number(selectedSocioId),
        fechaInicio: fechaInicio,
        fechaFin: fechaFin,
        montoTotal: financialSummary.montoTotal,
        esPrimera: Boolean(isPrimeraMembresia),
        productos: productosBase,
      });

      addToast(`¡Membresía ${currentCatName} contratada! Total: ${formatCurrency(financialSummary.montoTotal)}`, 'success');
      navigate('/membresias');
    } catch (err) {
      addToast('Error al registrar la membresía.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader message="Cargando datos..." />;

  const currentCatName = categorias.find(c => c.id === selectedCategoriaId)?.nombre;
  const baseBenefits = categorias.find(c => c.id === Number(selectedCategoriaId))?.beneficiosBase?.map(p => p.id) || [];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Contratar Nueva Membresía</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Selecciona el tipo de membresía. Los beneficios se asignan automáticamente.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          
          <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm dark:shadow-xl space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center">1</span>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Datos del Socio y Plan</h2>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">Socio Titular *</label>
              <select
                value={selectedSocioId}
                onChange={(e) => handleSocioChange(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-slate-100"
              >
                <option value="">-- Seleccione un socio --</option>
                {socios.map((s) => (
                  <option key={s.id} value={s.id}>{s.nombre} - DNI: {s.documento}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">Tipo de Membresía *</label>
              <div className="grid grid-cols-3 gap-3">
                {categorias.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => handleCategoriaSelect(cat.id)}
                    className={`py-3 rounded-xl text-sm font-bold border transition-all flex flex-col items-center justify-center ${
                      selectedCategoriaId === cat.id
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-md'
                        : 'bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-emerald-500'
                    }`}
                  >
                    <span>{cat.nombre}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm dark:shadow-xl space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center">2</span>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Beneficios Incluidos</h2>
            </div>
            <p className="text-xs text-slate-500">
              {selectedCategoriaId 
                ? 'Estos son los beneficios que incluye tu plan automáticamente.' 
                : 'Primero selecciona un plan para ver sus beneficios.'}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {productos.map((p) => {
                const isBase = baseBenefits.includes(p.id);
                const precio = Number(p.precioBase ?? p.precio_base ?? 0);
                
                return (
                  <div
                    key={p.id}
                    className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                      isBase
                        ? 'bg-emerald-100 dark:bg-emerald-900/40 border-emerald-500'
                        : 'bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 opacity-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input type="checkbox" checked={isBase} readOnly className="rounded text-emerald-600" />
                      <div>
                        <span className={`text-xs font-semibold block ${isBase ? 'text-emerald-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                          {p.nombre}
                        </span>
                        {isBase && <span className="text-[10px] text-slate-600 dark:text-slate-400 font-mono">{formatCurrency(precio)}</span>}
                      </div>
                    </div>
                    {isBase && <Lock size={14} className="text-emerald-600" title="Incluido en el plan" />}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm dark:shadow-xl space-y-5 sticky top-20">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CreditCard size={18} className="text-emerald-600" /> Resumen
            </h2>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-xs space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400">Membresía:</span>
                <span className="font-bold text-slate-900 dark:text-white uppercase">
                  {currentCatName || 'No elegida'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400">Beneficios:</span>
                <span className="font-bold text-slate-900 dark:text-white">{selectedProductIds.length}</span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-slate-200 dark:border-slate-800 text-base">
                <span className="font-bold text-slate-900 dark:text-white">Total:</span>
                <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(financialSummary.montoTotal || 0)}
                </span>
              </div>
            </div>

            <Button
              onClick={handleConfirmarContratacion}
              disabled={!selectedSocioId || !selectedCategoriaId}
              loading={saving}
              className="w-full py-3"
            >
              Registrar Pago (RF14)
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}