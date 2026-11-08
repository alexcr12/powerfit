import api from './axiosInstance';

export const usuariosService = {
  // Lista los usuarios registrados.
  listar: async () => (await api.get('/usuarios')).data,

  // Crea un usuario.
  crear: async (datos) => (await api.post('/usuarios', datos)).data,

  // Actualiza los datos permitidos del usuario.
  actualizar: async (id, datos) => (await api.patch(`/usuarios/${id}`, datos)).data,

  // Desactiva al usuario con baja lógica.
  desactivar: async (id) => (await api.delete(`/usuarios/${id}`)).data,
};
