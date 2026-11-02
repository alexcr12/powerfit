import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CreditCard, CheckCircle2, AlertTriangle, Gift, Tag, ArrowRight, ShieldCheck, User, Package
} from 'lucide-react';
import { sociosService } from '../../api/sociosService';
import { productosService } from '../../api/productosService';
import { categoriasService } from '../../api/categoriasService';
import { membresiasService } from '../../api/membresiasService';
import { useToast } from '../../context/ToastContext';
import { formatCurrency } from '../../utils/formatters';
import {
  calcularMontoMembresia, evaluarPrimeraMembresia, calcularLimitePases
} from '../../utils/businessRules';
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
  const [selectedProductIds, setSelectedProductIds] = useState([]);
  const [isPrimeraMembresia, setIsPrimeraMembresia] = useState(false);
  const [socioPreviasCount, setSocioPreviasCount] = useState(0);
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
        addToast('Error al cargar datos para contratación de membresía.', 'error');
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
      setSocioPreviasCount(0);
      return;
    }

    try {
      const historial = await membresiasService.getBySocioId(socioId);
      const evaluacion = evaluarPrimeraMembresia(historial);
      setIsPrimeraMembresia(evaluacion.esPrimera);
      setSocioPreviasCount(evaluacion.totalPrevias);
    } catch {
      setIsPrimeraMembresia(false);
    }
  };

  const handleToggleProduct = (prodId) => {
    setSelectedProductIds((prev) =>
      prev.includes(prodId) ? prev.filter((id) => id !== prodId) : [...prev, prodId]
    );
  };

  const selectedProducts = productos
    .filter((p) => selectedProductIds.includes(p.id))
    .map((p) => ({
      ...p,
      precio_base: Number(p.precioBase ?? p.precio_base ?? 0),
    }));

  const financialSummary = calcularMontoMembresia(selectedProducts);
  const pasesSummary = calcularLimitePases(selectedProducts, isPrimeraMembresia);

  const handleConfirmarContratacion = async () => {
    if (!selectedSocioId) {
      addToast('Debe seleccionar a un socio.', 'error');
      return;
    }
    if (selectedProducts.length === 0) {
      addToast('Debe elegir al menos un producto para la membresía.', 'error');
      return;
    }

    try {
      setSaving(true);
      const hoy = new Date();
      const fechaInicio = hoy.toISOString().split('T')[0];
      const fin = new Date(hoy);
      fin.setMonth(fin.getMonth() + 1);
      const fechaFin = fin.toISOString().split('T')[0];

      await membresiasService.create({
        socioId: Number(selectedSocioId),
        fechaInicio: fechaInicio,
        fechaFin: fechaFin,
        montoTotal: Number(financialSummary.montoTotal),
        esPrimera: Boolean(isPrimeraMembresia),
        productos: selectedProducts,
      });

      addToast(
        `¡Membresía contratada exitosamente! Total: ${formatCurrency(financialSummary.montoTotal)}`,
        'success',
        4000
      );
      navigate('/membresias');
    } catch (err) {
      console.error('Error detallado:', err?.response?.data || err);
      addToast('Error al registrar la membresía y productos.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader message="Cargando catálogo..." />;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Cabecera */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Contratar Nueva Membresía</h1>
          <span className="text-xs bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 px-2 py-0.5 rounded-full font-medium">
            Macro RF14 • Reglas R1, R4, R5
          </span>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Arma una suscripción mensual eligiendo servicios individuales para el socio.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna Izquierda */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* PASO 1 */}
          <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm dark:shadow-xl space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center">
                1
              </span>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Seleccionar Socio</h2>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Socio Titular (Solo Activos) *
              </label>
              <select
                value={selectedSocioId}
                onChange={(e) => handleSocioChange(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:border-emerald-500 transition-colors"
              >
                <option value="">-- Seleccione un socio --</option>
                {socios.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nombre} - DNI: {s.documento} ({s.telefono})
                  </option>
                ))}
              </select>
            </div>

            {selectedSocioId && (
              <div
                className={`p-3.5 rounded-2xl border text-xs flex items-start gap-3 ${
                  isPrimeraMembresia
                    ? 'bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-500/40 text-purple-800 dark:text-purple-200'
                    : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                <Gift size={18} className={isPrimeraMembresia ? 'text-purple-500 dark:text-purple-400 shrink-0 mt-0.5' : 'text-slate-400 dark:text-slate-500 shrink-0 mt-0.5'} />
                <div>
                  {isPrimeraMembresia ? (
                    <>
                      <strong className="text-purple-700 dark:text-purple-300 font-bold block mb-0.5">
                        ¡Primera Membresía Detectada! (Regla R5)
                      </strong>
                      Este socio no tiene membresías previas. Se le otorgará <strong>+1 pase de invitado adicional</strong>.
                    </>
                  ) : (
                    <>
                      <strong className="text-slate-700 dark:text-slate-300 font-semibold block mb-0.5">
                        Socio Recurrente
                      </strong>
                      El socio cuenta con {socioPreviasCount} membresía(s) anterior(es).
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* PASO 2 */}
          <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm dark:shadow-xl space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center">
                  2
                </span>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">Elegir Servicios</h2>
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                {selectedProductIds.length} seleccionados
              </span>
            </div>

            <div className="space-y-5">
              {categorias.map((cat) => {
                const prodsEnCat = productos.filter((p) => {
                  const catId = p.categoria?.id ?? p.categoriaId ?? p.categoria_id;
                  return catId === cat.id;
                });

                if (prodsEnCat.length === 0) return null;

                return (
                  <div key={cat.id} className="space-y-2.5">
                    <h3 className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                      <Tag size={13} />
                      {cat.nombre}
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {prodsEnCat.map((p) => {
                        const isChecked = selectedProductIds.includes(p.id);
                        const precio = Number(p.precioBase ?? p.precio_base ?? 0);

                        return (
                          <div
                            key={p.id}
                            onClick={() => handleToggleProduct(p.id)}
                            className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                              isChecked
                                ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-500 shadow-sm dark:shadow-md'
                                : 'bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-slate-700'
                            }`}
                          >
                            <div className="flex items-start gap-2.5">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {}}
                                className="mt-1 rounded border-slate-300 dark:border-slate-700 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                              />
                              <div>
                                <span className={`text-xs font-semibold block ${isChecked ? 'text-emerald-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                                  {p.nombre}
                                </span>
                                <span className="text-[11px] text-slate-500 dark:text-slate-500 block">{p.sede}</span>
                              </div>
                            </div>
                            <span className={`font-mono text-xs font-bold shrink-0 ${isChecked ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'}`}>
                              {formatCurrency(precio)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA (RESUMEN) */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm dark:shadow-xl space-y-5 sticky top-20">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CreditCard size={18} className="text-emerald-600 dark:text-emerald-400" />
              Resumen
            </h2>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {selectedProducts.length === 0 ? (
                <p className="text-xs text-slate-500 py-3 text-center italic">
                  Aún no has seleccionado productos
                </p>
              ) : (
                selectedProducts.map((p) => (
                  <div key={p.id} className="flex justify-between items-center text-xs py-1 border-b border-slate-200 dark:border-slate-800/60">
                    <span className="text-slate-600 dark:text-slate-300 truncate max-w-[170px]">{p.nombre}</span>
                    <span className="font-mono text-slate-800 dark:text-slate-200">
                      {formatCurrency(p.precioBase ?? p.precio_base ?? 0)}
                    </span>
                  </div>
                ))
              )}
            </div>

            <div
              className={`p-3.5 rounded-2xl border text-xs leading-relaxed ${
                financialSummary.aplicaDescuento
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-500/40 text-emerald-800 dark:text-emerald-200'
                  : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400'
              }`}
            >
              <div className="flex items-center gap-1.5 font-bold mb-1">
                <Tag size={14} className={financialSummary.aplicaDescuento ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'} />
                <span>Regla R4 (Descuento 15%):</span>
              </div>
              <p>{financialSummary.mensaje}</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-xs space-y-1">
              <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                <span className="font-semibold">Pases Otorgados:</span>
                <span className="font-bold text-purple-600 dark:text-purple-400 font-mono text-sm">
                  {pasesSummary.limiteTotal} pases
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {pasesSummary.desglose}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>Subtotal</span>
                <span className="font-mono text-slate-800 dark:text-slate-200">{formatCurrency(financialSummary.subtotal)}</span>
              </div>

              {financialSummary.aplicaDescuento && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                  <span>Descuento 15% (R4)</span>
                  <span className="font-mono">-{formatCurrency(financialSummary.montoDescuento)}</span>
                </div>
              )}

              <div className="flex justify-between items-center text-sm font-bold text-slate-900 dark:text-white pt-2 border-t border-slate-200 dark:border-slate-800">
                <span>Monto Total:</span>
                <span className="text-xl font-mono text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(financialSummary.montoTotal)}
                </span>
              </div>
            </div>

            <Button
              onClick={handleConfirmarContratacion}
              disabled={!selectedSocioId || selectedProducts.length === 0}
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