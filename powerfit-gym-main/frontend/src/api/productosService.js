import api from './axiosInstance';

const normalizar = (producto) => ({
  ...producto,
  categoria_id: producto.categoria_id?.id ?? producto.categoria?.id ?? producto.categoria_id ?? producto.categoriaId,
  requiere_asistencia: producto.requiere_asistencia ?? producto.requiereAsistencia ?? false,
  activo: producto.activo ?? true,
});

export const productosService = {
  getAll: async () => {
    const res = await api.get('/productos');
    return res.data.map(normalizar);
  },

  getById: async (id) => {
    const res = await api.get(`/productos/${id}`);
    return normalizar(res.data);
  },

  getClases: async () => {
    const res = await api.get('/productos', { params: { activo: true } });
    return res.data.map(normalizar).filter((producto) => producto.requiere_asistencia);
  },

  create: async (productoData) => {
    const payload = {
      nombre: productoData.nombre,
      categoria_id: Number(productoData.categoria_id),
      requiere_asistencia: Boolean(productoData.requiere_asistencia),
      activo: true,
    };
    return normalizar((await api.post('/productos', payload)).data);
  },

  update: async (id, productoData) => {
    const payload = {
      nombre: productoData.nombre,
      categoria_id: Number(productoData.categoria_id),
      requiere_asistencia: Boolean(productoData.requiere_asistencia),
    };
    return normalizar((await api.patch(`/productos/${id}`, payload)).data);
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
