import api from './axiosInstance';

export const usuariosService = {
  
  listar: async () => (await api.get('/usuarios')).data,

  crear: async (datos) => (await api.post('/usuarios', datos)).data,

  actualizar: async (id, datos) => (await api.patch(`/usuarios/${id}`, datos)).data,

  desactivar: async (id) => (await api.delete(`/usuarios/${id}`)).data,
};
