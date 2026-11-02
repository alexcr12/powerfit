import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CreditCard, Plus, Eye, Ban, Calendar, Gift, Trash2 } from 'lucide-react';
import { membresiasService } from '../../api/membresiasService';
import { sociosService } from '../../api/sociosService';
import { productosService } from '../../api/productosService';
import { useToast } from '../../context/ToastContext';
import { formatCurrency, formatDate } from '../../utils/formatters';
import Table from '../../components/common/Table';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import ErrorMessage from '../../components/common/ErrorMessage';
import ConfirmDialog from '../../components/common/ConfirmDialog';

export default function MembresiasPage() {
  const { addToast } = useToast();
  const [membresias, setMembresias] = useState([]);
  const [socios, setSocios] = useState([]);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- ESTADOS DE MODALES ---
  const [confirmDelete, setConfirmDelete] = useState({
    isOpen: false,
    membresia: null,
    loading: false,
  });

  const [detailModal, setDetailModal] = useState({
    isOpen: false,
    membresia: null,
    items: [],
    loading: false,
  });

  const [confirmCancel, setConfirmCancel] = useState({
    isOpen: false,
    membresia: null,
    loading: false,
  });

  // --- FUNCIONES ---
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [memData, socData, prodData] = await Promise.all([
        membresiasService.getAll(),
        sociosService.getAll(),
        productosService.getAll(),
      ]);
      setMembresias(memData);
      setSocios(socData);
      setProductos(prodData);
    } catch {
      setError('Error al consultar historial de membresías.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenDetail = async (membresia) => {
    try {
      setDetailModal({ isOpen: true, membresia, items: [], loading: true });
      const mpItems = await membresiasService.getProductosByMembresiaId(membresia.id);
      setDetailModal({ isOpen: true, membresia, items: mpItems, loading: false });
    } catch {
      addToast('Error al cargar detalle de productos de la membresía.', 'error');
      setDetailModal((prev) => ({ ...prev, loading: false }));
    }
  };

  const handleConfirmCancel = async () => {
    const mem = confirmCancel.membresia;
    if (!mem) return;

    try {
      setConfirmCancel((prev) => ({ ...prev, loading: true }));
      await membresiasService.cancel(mem.id);
      addToast(`Membresía #${mem.id} cancelada correctamente.`, 'warning');
      setConfirmCancel({ isOpen: false, membresia: null, loading: false });
      loadData();
    } catch {
      addToast('Error al cancelar la membresía.', 'error');
      setConfirmCancel((prev) => ({ ...prev, loading: false }));
    }
  };

    const handleConfirmDelete = async () => {
    const mem = confirmDelete.membresia;
    if (!mem) return;

    try {
      setConfirmDelete((prev) => ({ ...prev, loading: true }));
      await membresiasService.delete(mem.id);
      addToast(`Membresía #${mem.id} eliminada permanentemente.`, 'success');
      setConfirmDelete({ isOpen: false, membresia: null, loading: false });
      loadData(); 
    } catch (error) {
      console.error("🚨 ERROR AL BORRAR:", error.response?.data || error);
      const errorMsg = error.response?.data?.mensaje || error.response?.data?.message || 'Error al eliminar la membresía.';
      addToast(errorMsg, 'error');
      setConfirmDelete((prev) => ({ ...prev, loading: false }));
    }
  };

  const sociosMap = Object.fromEntries(socios.map((s) => [s.id, s]));
  const productosMap = Object.fromEntries(productos.map((p) => [p.id, p]));

  const columns = [
    {
      header: 'ID',
      accessor: 'id',
      cellClass: 'font-mono text-slate-500 w-16',
      render: (m) => <span className="font-mono text-slate-400">#{m.id}</span>,
    },
    {
      header: 'Socio Titular',
      accessor: 'socio_id',
      render: (m) => {
        const socioId = m.socio?.id ?? m.socioId ?? m.socio_id;
        const s = m.socio ?? (socioId ? sociosMap[socioId] : null);
        return (
          <div>
            <span className="font-semibold text-white block">
              {s ? s.nombre : (socioId ? `Socio #${socioId}` : 'Socio no asignado')}
            </span>
            <span className="text-[11px] text-slate-400">
              {s ? `Doc: ${s.documento}` : ''}
              {s && !s.activo && <span className="text-red-400 ml-1">(Inactivo R2)</span>}
            </span>
          </div>
        );
      },
    },
    {
      header: 'Periodo Vigencia',
      accessor: 'fecha_inicio',
      render: (m) => {
        const fInicio = m.fechaInicio ?? m.fecha_inicio;
        const fFin = m.fechaFin ?? m.fecha_fin;
        return (
          <div className="text-xs">
            <span className="text-slate-300 block">
              {formatDate(fInicio)} al {formatDate(fFin)}
            </span>
            <span className="text-[10px] text-slate-500 font-mono">1 Mes Calendario</span>
          </div>
        );
      },
    },
    {
      header: 'Monto Total',
      accessor: 'monto_total',
      render: (m) => {
        const monto = m.montoTotal ?? m.monto_total ?? 0;
        return (
          <span className="font-mono font-bold text-emerald-400">
            {formatCurrency(monto)}
          </span>
        );
      },
    },
    {
      header: 'Tipo',
      accessor: 'es_primera',
      render: (m) => {
        const esPrimera = m.esPrimera ?? m.es_primera;
        return esPrimera ? (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Gift size={11} />
            1ra Vez (R5)
          </span>
        ) : (
          <span className="text-[10px] text-slate-500 uppercase font-medium">Renovación</span>
        );
      },
    },
    {
      header: 'Estado',
      accessor: 'estado',
      render: (m) => {
        const estadoNorm = (m.estado || '').toLowerCase();
        const isActiva = estadoNorm === 'activa';
        const isCancelada = estadoNorm === 'cancelada';
        const isVencida = estadoNorm === 'vencida';

        isActiva ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
isVencida ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' :
isCancelada ? 'bg-slate-800 text-slate-400 border border-slate-700' :
'bg-amber-500/10 text-amber-400 border border-amber-500/20'

        return (
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
              isActiva
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : isCancelada
                ? 'bg-slate-800 text-slate-400 border border-slate-700'
                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
            }`}
          >
            {m.estado}
          </span>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Historial de Membresías</h1>
            <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-medium">
              RF15–RF16
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Consulta de suscripciones mensuales, detalle de servicios y cancelación lógica.
          </p>
        </div>

        <Link to="/membresias/nueva">
          <Button icon={Plus}>
            Contratar Membresía (RF14)
          </Button>
        </Link>
      </div>

      {loading ? (
        <Loader message="Cargando historial de membresías..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={loadData} />
      ) : (
        <Table
          columns={columns}
          data={membresias}
          searchPlaceholder="Buscar por ID, socio..."
          searchFields={['id']}
          actions={(m) => (
            <div className="flex items-center justify-end gap-1.5">
              <button
                onClick={() => handleOpenDetail(m)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                title="Ver servicios contratados"
              >
                <Eye size={14} />
              </button>
              {m.estado === 'activa' && (
                <button
                  onClick={() => setConfirmCancel({ isOpen: true, membresia: m, loading: false })}
                  className="p-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 transition-colors cursor-pointer"
                  title="Cancelar membresía (RF16)"
                >
                  <Ban size={14} />
                </button>
              )}
               <button
                onClick={() => setConfirmDelete({ isOpen: true, membresia: m, loading: false })}
                className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 transition-colors cursor-pointer"
                title="Eliminar membresía (RF21)"
              >
                <Trash2 size={14} />
              </button>
            </div>
          )}
        />
      )}

      {/* Modal Detalle de Productos en Membresía */}
      <Modal
        isOpen={detailModal.isOpen}
        onClose={() => setDetailModal({ isOpen: false, membresia: null, items: [], loading: false })}
        title={`Detalle de Membresía #${detailModal.membresia?.id}`}
        subtitle="Servicios individuales incluidos en esta suscripción mensual"
      >
        <div className="space-y-4">
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs flex justify-between items-center">
            <div>
              <span className="text-slate-400 block">Socio:</span>
              <strong className="text-white">
                {(() => {
                  const socioId = detailModal.membresia?.socio?.id ?? detailModal.membresia?.socio_id;
                  const socio = sociosMap[socioId];
                  return socio?.nombre || `ID ${socioId ?? 'desconocido'}`;
                })()}
              </strong>
            </div>
            <div className="text-right">
              <span className="text-slate-400 block">Total Pagado:</span>
              <strong className="text-emerald-400 font-mono text-sm">
                {formatCurrency(
                  detailModal.membresia?.montoTotal ?? detailModal.membresia?.monto_total ?? 0
                )}
              </strong>
            </div>
          </div>

          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Productos / Servicios Contratados:
          </h4>

          {detailModal.loading ? (
            <Loader message="Cargando productos..." />
          ) : detailModal.items.length === 0 ? (
            <p className="text-xs text-slate-500 italic">No se registraron productos desglosados.</p>
          ) : (
            <div className="divide-y divide-slate-800 border border-slate-800 rounded-2xl overflow-hidden bg-slate-950">
              {detailModal.items.map((item) => {
                const prodId = item.producto?.id ?? item.producto_id;
                const prod = productosMap[prodId];
                const precio = item.precioUnitario ?? item.precio_unitario ?? 0;

                return (
                  <div key={item.id} className="p-3 flex justify-between items-center text-xs">
                    <div>
                      <span className="font-semibold text-slate-200 block">
                        {prod ? prod.nombre : `Producto #${prodId ?? 'desconocido'}`}
                      </span>
                      <span className="text-[10px] text-slate-500">{prod?.sede}</span>
                    </div>
                    <span className="font-mono text-slate-300">
                      {formatCurrency(precio)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Modal>

      {/* Diálogo Cancelación Lógica RF16 */}
      <ConfirmDialog
        isOpen={confirmCancel.isOpen}
        onClose={() => setConfirmCancel({ isOpen: false, membresia: null, loading: false })}
        onConfirm={handleConfirmCancel}
        title="¿Cancelar Membresía?"
        message={`¿Desea cancelar la Membresía #${confirmCancel.membresia?.id}? El estado pasará a "cancelada" y el socio no podrá acceder a las instalaciones bajo esta suscripción.`}
        confirmText="Confirmar Cancelación"
        loading={confirmCancel.loading}
      />

      
      <ConfirmDialog
        isOpen={confirmDelete.isOpen}
        onClose={() => setConfirmDelete({ isOpen: false, membresia: null, loading: false })}
        onConfirm={handleConfirmDelete}
        title="¿Eliminar Membresía?"
        message={`¿Está seguro de eliminar permanentemente la Membresía #${confirmDelete.membresia?.id}? Esta acción borrará el registro de la base de datos y no se podrá deshacer.`}
        confirmText="Sí, eliminar"
        loading={confirmDelete.loading}
      />
    </div>
  );
}