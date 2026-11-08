import React, { useState, useEffect } from 'react';
import { obtenerMensajeError } from '../../utils/obtenerMensajeError';
import { UserPlus, Edit2, UserX, UserCheck, History } from 'lucide-react';
import { sociosService } from '../../api/sociosService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { formatDate } from '../../utils/formatters';
import Table from '../../components/common/Table';
import Modal from '../../components/common/Modal';
import FormField from '../../components/common/FormField';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import ErrorMessage from '../../components/common/ErrorMessage';
import ConfirmDialog from '../../components/common/ConfirmDialog';

export default function SociosPage({ openCreateModal = false }) {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [socios, setSocios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('activos'); 

  const [isModalOpen, setIsModalOpen] = useState(openCreateModal);
  const [editingSocio, setEditingSocio] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    documento: '',
    telefono: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    socio: null,
    loading: false,
  });

  const loadSocios = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await sociosService.getAll();
      setSocios(data);
    } catch (err) {
      setError(obtenerMensajeError(err));
      addToast(obtenerMensajeError(err), 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSocios();
  }, []);

  useEffect(() => {
    if (openCreateModal) {
      handleOpenCreate();
    }
  }, [openCreateModal]);

  const handleOpenCreate = () => {
    setEditingSocio(null);
    setFormData({ nombre: '', documento: '', telefono: '' });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEdit = (socio) => {
    setEditingSocio(socio);
    setFormData({
      nombre: socio.nombre,
      documento: socio.documento,
      telefono: socio.telefono,
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.nombre.trim()) errors.nombre = 'El nombre completo es obligatorio';
    if (!formData.documento.trim()) {
      errors.documento = 'El documento es obligatorio';
    } else if (!/^[0-9]{8,12}$/.test(formData.documento.trim())) {
      errors.documento = 'Debe ingresar un documento válido (8 a 12 dígitos)';
    }
    if (!formData.telefono.trim()) {
      errors.telefono = 'El teléfono es obligatorio';
    } else if (!/^[0-9]{9}$/.test(formData.telefono.trim())) {
      errors.telefono = 'El teléfono debe tener 9 dígitos numéricos';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setSaving(true);
      if (editingSocio) {
        await sociosService.update(editingSocio.id, {
          nombre: formData.nombre.trim(),
          documento: formData.documento.trim(),
          telefono: formData.telefono.trim(),
        });
        addToast(`Socio "${formData.nombre}" actualizado correctamente.`, 'success');
      } else {
        await sociosService.create({
          nombre: formData.nombre.trim(),
          documento: formData.documento.trim(),
          telefono: formData.telefono.trim(),
          registrado_por: user?.nombre || 'Recepción',
        });
        addToast(`Socio "${formData.nombre}" registrado exitosamente.`, 'success');
      }
      setIsModalOpen(false);
      loadSocios();
    } catch (err) {
      addToast(obtenerMensajeError(err), 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDeactivate = async () => {
    const socio = confirmDialog.socio;
    if (!socio) return;

    try {
      setConfirmDialog((prev) => ({ ...prev, loading: true }));
      await sociosService.deactivate(socio.id);
      addToast(`Socio "${socio.nombre}" desactivado. Su historial se preserva en la pestaña de inactivos (Regla R2).`, 'warning', 4500);
      setConfirmDialog({ isOpen: false, socio: null, loading: false });
      loadSocios();
    } catch (err) {
      addToast(obtenerMensajeError(err), 'error');
      setConfirmDialog((prev) => ({ ...prev, loading: false }));
    }
  };

  const handleReactivate = async (socio) => {
    try {
      await sociosService.reactivate(socio.id);
      addToast(`Socio "${socio.nombre}" reactivado exitosamente.`, 'success');
      loadSocios();
    } catch (err) {
      addToast(obtenerMensajeError(err), 'error');
    }
  };

  const sociosActivos = socios.filter((s) => s.activo);
  const sociosInactivos = socios.filter((s) => !s.activo);
  const displayedSocios = activeTab === 'activos' ? sociosActivos : sociosInactivos;

  const columns = [
    {
      header: 'Nombre Completo',
      accessor: 'nombre',
      render: (s) => (
        <div>
          <span className="font-semibold text-slate-800 dark:text-white block">{s.nombre}</span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">Doc: {s.documento}</span>
        </div>
      ),
    },
    {
      header: 'Teléfono',
      accessor: 'telefono',
      render: (s) => <span className="font-mono text-slate-600 dark:text-slate-300">{s.telefono}</span>,
    },
    {
      header: 'Fecha Registro',
      accessor: 'fecha_registro',
      render: (s) => <span className="text-slate-600 dark:text-slate-300">{formatDate(s.fecha_registro)}</span>,
    },
    {
      header: 'Registrado Por',
      accessor: 'registrado_por',
      render: (s) => <span className="text-slate-500 dark:text-slate-400">{s.registrado_por || '-'}</span>,
    },
    {
      header: 'Estado',
      accessor: 'activo',
      render: (s) => (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
            s.activo
              ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20'
              : 'bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-500/20'
          }`}
        >
          {s.activo ? 'Activo' : 'Inactivo (R2)'}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Gestión de Socios</h1>
            <span className="text-xs bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 px-2 py-0.5 rounded-full font-medium">
              RF01–RF04
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Registro, consulta y administración de clientes atendidos en recepción.
          </p>
        </div>

        <Button icon={UserPlus} onClick={handleOpenCreate}>
          Registrar Socio (RF01)
        </Button>
      </div>

      {/* Regla R2 - Alerta Informativa con MODO CLARO */}
      <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 flex items-start gap-3 shadow-sm dark:shadow-none transition-colors duration-300">
        <div className="p-1 rounded-lg bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5">
          <History size={16} />
        </div>
        <div>
          <strong className="text-emerald-600 dark:text-emerald-400">Regla R2 aplicada:</strong> Al desactivar un socio no se eliminan sus asistencias ni membresías. El listado general filtra los activos, y la pestaña "Inactivos" permite consultar su historial completo en cualquier momento.
        </div>
      </div>

      {/* Pestañas Activos vs Inactivos */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 transition-colors duration-300">
        <button
          onClick={() => setActiveTab('activos')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'activos'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200 dark:shadow-emerald-950/40'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-900'
          }`}
        >
          Socios Activos ({sociosActivos.length})
        </button>
        <button
          onClick={() => setActiveTab('inactivos')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'inactivos'
              ? 'bg-amber-600 text-white shadow-md shadow-amber-200 dark:shadow-amber-950/40'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-900'
          }`}
        >
          Historial Inactivos ({sociosInactivos.length})
        </button>
      </div>

      {/* Tabla */}
      {loading ? (
        <Loader message="Cargando socios desde la API..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={loadSocios} />
      ) : (
        <Table
          columns={columns}
          data={displayedSocios}
          searchPlaceholder="Buscar por nombre, DNI o teléfono..."
          searchFields={['nombre', 'documento', 'telefono']}
          actions={(socio) => (
            <div className="flex items-center justify-end gap-1.5">
              <button
                onClick={() => handleOpenEdit(socio)}
                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors cursor-pointer"
                title="Editar socio (RF03)"
              >
                <Edit2 size={14} />
              </button>
              {socio.activo ? (
                <button
                  onClick={() => setConfirmDialog({ isOpen: true, socio, loading: false })}
                  className="p-1.5 rounded-lg bg-red-100 hover:bg-red-200 dark:bg-red-500/10 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20 transition-colors cursor-pointer"
                  title="Desactivar socio (RF04 - Borrado lógico R2)"
                >
                  <UserX size={14} />
                </button>
              ) : (
                <button
                  onClick={() => handleReactivate(socio)}
                  className="p-1.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 transition-colors cursor-pointer"
                  title="Reactivar socio"
                >
                  <UserCheck size={14} />
                </button>
              )}
            </div>
          )}
        />
      )}

      {/* Modal Registrar / Editar Socio */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSocio ? 'Editar Socio (RF03)' : 'Registrar Nuevo Socio (RF01)'}
        subtitle="Complete los datos personales para la atención en recepción"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField
            label="Nombre Completo"
            name="nombre"
            placeholder="Ej: Juan Carlos Pérez"
            value={formData.nombre}
            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            error={formErrors.nombre}
            required
          />

          <FormField
            label="Documento de Identidad (DNI/Cédula)"
            name="documento"
            placeholder="Ej: 72345678"
            value={formData.documento}
            onChange={(e) => setFormData({ ...formData, documento: e.target.value })}
            error={formErrors.documento}
            required
          />

          <FormField
            label="Teléfono Celular"
            name="telefono"
            placeholder="Ej: 987654321"
            value={formData.telefono}
            onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
            error={formErrors.telefono}
            required
          />

          <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-200 dark:border-slate-800">
            <Button variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" size="sm" loading={saving}>
              {editingSocio ? 'Actualizar Socio' : 'Guardar Socio'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Diálogo de Confirmación de Desactivación Lógica (R2) */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ isOpen: false, socio: null, loading: false })}
        onConfirm={handleConfirmDeactivate}
        title="¿Desactivar Socio?"
        message={`¿Está seguro de desactivar a "${confirmDialog.socio?.nombre}"? Según la Regla de Negocio R2, el socio se marcará como inactivo pero todas sus asistencias y membresías históricas permanecerán intactas.`}
        confirmText="Desactivar (Borrado Lógico)"
        variant="danger"
        loading={confirmDialog.loading}
      />
    </div>
  );
}



