import api from './axiosInstance';

export const productosService = {
  // RF11: Listar productos
  getAll: async () => {
    const res = await api.get('/productos');
    // 🔥 Normalizamos los datos para que la tabla de React los encuentre
    return res.data.map(p => ({
      ...p,
      categoria_id: p.categoriaId || p.categoria_id || p.categoria?.id,
      precio_base: p.precioBase ?? p.precio_base ?? 0,
      activo: p.activo ?? true
    }));
  },

  getById: async (id) => {
    const res = await api.get(`/productos/${id}`);
    const p = res.data;
    return {
      ...p,
      categoria_id: p.categoriaId || p.categoria_id || p.categoria?.id,
      precio_base: p.precioBase ?? p.precio_base ?? 0,
      activo: p.activo ?? true
    };
  },

  // RF10: Registrar producto
   create: async (productoData) => {
    const payload = {
      nombre: productoData.nombre,
      categoria_id: Number(productoData.categoria_id),
      precio_base: Number(productoData.precio_base) || 0,
      sede: productoData.sede,
      activo: true,
    };
    const res = await api.post('/productos', payload);
    return res.data;
  },

  update: async (id, productoData) => {
    const payload = {
      nombre: productoData.nombre,
      categoria_id: Number(productoData.categoria_id),
      precio_base: Number(productoData.precio_base) || 0,
      sede: productoData.sede,
    };
    const res = await api.patch(`/productos/${id}`, payload);
    return res.data;
  },

  // RF13: Desactivar producto (Borrado Lógico)
  deactivate: async (id) => {
    const res = await api.patch(`/productos/${id}`, { activo: false });
    return res.data;
  },

  reactivate: async (id) => {
    const res = await api.patch(`/productos/${id}`, { activo: true });
    return res.data;
  },
};