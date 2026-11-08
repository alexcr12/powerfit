// Obtiene el mensaje que envía el backend o uno genérico.
export function obtenerMensajeError(error) {
  return error?.response?.data?.mensaje || 'No se pudo completar la operación';
}
