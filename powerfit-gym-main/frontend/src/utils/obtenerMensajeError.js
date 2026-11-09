
export function obtenerMensajeError(error) {
  return error?.response?.data?.mensaje || 'No se pudo completar la operación';
}
