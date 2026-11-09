import api from './axiosInstance';

const normalizar = (pase) => ({
  ...pase,
  socio_id: pase.socio?.id ?? pase.socio_id ?? pase.socioId,
  nombre_inv: pase.nombreInv ?? pase.nombre_inv,
  fecha_uso: pase.fechaUso ?? pase.fecha_uso,
});

export const pasesService = {
  getAll: async () => (await api.get('/pases_invitado')).data.map(normalizar),

  getBySocioId: async (socioId) => {
    const res = await api.get('/pases_invitado', { params: { socio_id: Number(socioId) } });
    return res.data.map(normalizar);
  },

  getDisponibles: async (socioId, fecha) => (await api.get('/pases_invitado/disponibles', {
    params: { socio_id: Number(socioId), fecha },
  })).data,

  actualizar: async (id, datos) => normalizar((await api.patch(`/pases_invitado/${id}`, datos)).data),

  anular: async (id) => (await api.delete(`/pases_invitado/${id}`)).data,

  create: async ({ socioId, nombreInv, fechaUso }) => {
    const payload = {
      socio_id: Number(socioId),
      nombre_inv: nombreInv.trim(),
      fecha_uso: fechaUso || new Date().toISOString().split('T')[0],
      activo: true,
    };
    return (await api.post('/pases_invitado', payload)).data;
  },
};
