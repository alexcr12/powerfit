import api from './axiosInstance';

const normalizar = (asistencia) => ({
  ...asistencia,
  socio_id: asistencia.socio?.id ?? asistencia.socio_id ?? asistencia.socioId,
  producto_id: asistencia.producto_id?.id ?? asistencia.producto?.id ?? asistencia.producto_id ?? asistencia.productoId,
  producto_nombre: asistencia.producto_id?.nombre ?? asistencia.producto?.nombre ?? asistencia.producto_nombre,
  fecha_hora: asistencia.fechaHora ?? asistencia.fecha_hora,
});

export const asistenciasService = {
  getAll: async () => (await api.get('/asistencias')).data.map(normalizar),

  getBySocioId: async (socioId) => {
    const res = await api.get('/asistencias', {
      params: { socio_id: Number(socioId) },
    });
    return res.data.map(normalizar);
  },

  create: async ({ socioId, fechaHora, productoId }) => {
    const payload = {
      socio_id: Number(socioId),
      fecha_hora: fechaHora,
      producto_id: Number(productoId),
    };
    return normalizar((await api.post('/asistencias', payload)).data);
  },

  // RF20: Editar / corregir asistencia
  update: async (id, asistenciaData) => {
    const payload = {
      fecha_hora: asistenciaData.fecha_hora ?? asistenciaData.fechaHora,
      producto_id: asistenciaData.producto_id ?? asistenciaData.productoId,
    };
    return normalizar((await api.patch(`/asistencias/${id}`, payload)).data);
  },

  // RF21: Eliminar asistencia (eliminación física)
  delete: async (id) => {
    const res = await api.delete(`/asistencias/${id}`);
    return res.data;
  },
};
