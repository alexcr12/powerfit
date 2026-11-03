import React, { useState, useEffect } from 'react';
import { Tags, Plus, Edit2, CheckCircle2, XCircle } from 'lucide-react';
import { categoriasService } from '../../api/categoriasService';
import { productosService } from '../../api/productosService';
import { useToast } from '../../context/ToastContext';
import Table from '../../components/common/Table';
import Modal from '../../components/common/Modal';
import FormField from '../../components/common/FormField';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import ErrorMessage from '../../components/common/ErrorMessage';

export default function CategoriasPage() {
  const { addToast } = useToast();
  const [categorias, setCategorias] = useState([]);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategoria, setEditingCategoria] = useState(null);
  const [nombre, setNombre] = useState('');
  const [selectedProductIds, setSelectedProductIds] = useState([]);
  const [nombreError, setNombreError] = useState('');
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [catData, prodData] = await Promise.all([
        categoriasService.getAll(),
        productosService.getAll(),
      ]);
      setCategorias(catData);
      setProductos(prodData.filter(p => p.activo));
    } catch {
      setError('Error al conectar con la API.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenCreate = () => {
    setEditingCategoria(null);
    setNombre('');
    setSelectedProductIds([]);
    setNombreError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat) => {
    setEditingCategoria(cat);
    setNombre(cat.nombre);
    // Si la categoría ya trae beneficios, los marcamos
    setSelectedProductIds(cat.beneficiosBase ? cat.beneficiosBase.map(p => p.id) : []);
    setNombreError('');
    setIsModalOpen(true);
  };

  const handleToggleProduct = (prodId) => {
    setSelectedProductIds(prev =>
      prev.includes(prodId) ? prev.filter(id => id !== prodId) : [...prev, prodId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nombre.trim()) return setNombreError('El nombre es requerido');

    try {
      setSaving(true);
      
      const payload = { 
        nombre: nombre.trim(),
        beneficiosBase: selectedProductIds // 🔥 Enviamos los IDs
      };

      if (editingCategoria) {
        await categoriasService.update(editingCategoria.id, payload);
        addToast(`Categoría "${nombre}" actualizada.`, 'success');
      } else {
        await categoriasService.create(payload);
        addToast(`Categoría "${nombre}" registrada.`, 'success');
      }

      setIsModalOpen(false);
      loadData();
    } catch {
      addToast('Error al guardar categoría.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    {
      header: 'ID',
      accessor: 'id',
      cellClass: 'font-mono text-slate-500 w-16',
    },
    {
      header: 'Nombre de la Categoría',
      accessor: 'nombre',
      render: (cat) => <span className="font-semibold text-slate-900 dark:text-white">{cat.nombre}</span>,
    },
    {
      header: 'Amenidades Base',
      accessor: 'beneficiosBase',
      render: (cat) => {
        if (!cat.beneficiosBase || cat.beneficiosBase.length === 0) {
          return <span className="text-xs text-slate-400 italic">Ninguna</span>;
        }
        return (
          <div className="flex flex-wrap gap-1">
            {cat.beneficiosBase.map(p => (
              <span key={p.id} className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded text-[10px]">
                {p.nombre}
              </span>
            ))}
          </div>
        );
      }
    },
    {
      header: 'Estado',
      accessor: 'activo',
      render: (cat) => (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
            cat.activo
              ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20'
              : 'bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-500/20'
          }`}
        >
          {cat.activo ? 'Activa' : 'Inactiva'}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Categorías de Servicios</h1>
            <span className="text-xs bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 px-2 py-0.5 rounded-full font-medium">
              RF07–RF09
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Agrupación de servicios individuales y productos disponibles en suscripción mensual.
          </p>
        </div>

        <Button icon={Plus} onClick={handleOpenCreate}>
          Nueva Categoría (RF07)
        </Button>
      </div>

      {loading ? (
        <Loader message="Cargando catálogo de categorías..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={loadData} />
      ) : (
        <Table
          columns={columns}
          data={categorias}
          searchPlaceholder="Buscar categoría..."
          searchFields={['nombre']}
          actions={(cat) => (
            <div className="flex items-center justify-end gap-1.5">
              <button
                onClick={() => handleOpenEdit(cat)}
                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors cursor-pointer"
                title="Editar categoría (RF09)"
              >
                <Edit2 size={14} />
              </button>
            </div>
          )}
        />
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCategoria ? 'Editar Categoría (RF09)' : 'Nueva Categoría (RF07)'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField
            label="Nombre de Categoría"
            name="nombre"
            placeholder="Ej: Gold"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            error={nombreError}
            required
          />

          <div className="pt-2">
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">
              Amenidades / Productos Base
            </label>
            <div className="max-h-48 overflow-y-auto p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
              {productos.map(p => (
                <div key={p.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={`prod-${p.id}`}
                    checked={selectedProductIds.includes(p.id)}
                    onChange={() => handleToggleProduct(p.id)}
                    className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <label htmlFor={`prod-${p.id}`} className="text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                    {p.nombre}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-200 dark:border-slate-800">
            <Button variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" size="sm" loading={saving}>
              {editingCategoria ? 'Actualizar' : 'Guardar'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}