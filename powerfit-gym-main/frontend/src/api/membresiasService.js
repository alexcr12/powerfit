import api from './axiosInstance';

const normalizar = (membresia) => ({
  ...membresia,
  socio_id: membresia.socio?.id ?? membresia.socio_id ?? membresia.socioId,
  categoria_id: membresia.categoria_id?.id ?? membresia.categoria?.id ?? membresia.categoria_id ?? membresia.categoriaId,
  fecha_inicio: membresia.fechaInicio ?? membresia.fecha_inicio,
  fecha_fin: membresia.fechaFin ?? membresia.fecha_fin,
  monto_total: membresia.montoTotal ?? membresia.monto_total,
});

export const membresiasService = {
  getAll: async () => (await api.get('/membresias')).data.map(normalizar),

  getBySocioId: async (socioId) => (await api.get('/membresias', {
    params: { socio_id: Number(socioId) },
  })).data.map(normalizar),

  getById: async (id) => normalizar((await api.get(`/membresias/${id}`)).data),

  create: async ({ socioId, categoriaId, fechaInicio }) => {
    const payload = {
      socio_id: Number(socioId),
      categoria_id: Number(categoriaId),
    };
    if (fechaInicio) payload.fecha_inicio = fechaInicio;
    return normalizar((await api.post('/membresias', payload)).data);
  },

  actualizar: async (id, datos) => normalizar((await api.patch(`/membresias/${id}`, datos)).data),

  delete: async (id) => (await api.delete(`/membresias/${id}`)).data,
};
