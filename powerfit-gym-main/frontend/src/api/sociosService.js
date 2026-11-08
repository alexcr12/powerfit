import api from './axiosInstance';

export const sociosService = {
  // RF02: Listar socios
  getAll: async () => {
    const res = await api.get('/socios');
    return res.data.map(s => ({
      ...s,
      fecha_registro: s.fechaRegistro || s.fecha_registro,
      registrado_por: s.registrado_por?.id ?? s.registrado_por ?? s.registradoPor,
      activo: s.activo ?? false
    }));
  },

  getById: async (id) => {
    const res = await api.get(`/socios/${id}`);
    const s = res.data;
    return {
      ...s,
      fecha_registro: s.fechaRegistro || s.fecha_registro,
      registrado_por: s.registrado_por?.id ?? s.registrado_por ?? s.registradoPor,
      activo: s.activo ?? false
    };
  },

  // RF01: Registrar socio
  create: async (socioData) => {
    const payload = {
      nombre: socioData.nombre,
      documento: socioData.documento,
      telefono: socioData.telefono || null,
      fechaRegistro: socioData.fechaRegistro || socioData.fecha_registro || new Date().toISOString().split('T')[0],
      activo: true,
    };
    const res = await api.post('/socios', payload);
    return res.data;
  },

  // RF03: Editar socio
  update: async (id, socioData) => {
    const payload = {
      nombre: socioData.nombre,
      documento: socioData.documento,
      telefono: socioData.telefono,
      fechaRegistro: socioData.fechaRegistro || socioData.fecha_registro,
      activo: socioData.activo,
    };
    const res = await api.patch(`/socios/${id}`, payload);
    return res.data;
  },

  // RF04: Desactivar socio
  deactivate: async (id) => {
    const res = await api.patch(`/socios/${id}`, { activo: false });
    return res.data;
  },

  reactivate: async (id) => {
    const res = await api.patch(`/socios/${id}`, { activo: true });
    return res.data;
  },
};
