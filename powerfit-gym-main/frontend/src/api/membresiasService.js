import api from './axiosInstance';

export const membresiasService = {
  getAll: async () => {
    const res = await api.get('/membresias');
    return res.data;
  },

  getBySocioId: async (socioId) => {
    const res = await api.get('/membresias', {
      params: { socio_id: Number(socioId) },
    });
    return res.data;
  },

  getById: async (id) => {
    const res = await api.get(`/membresias/${id}`);
    return res.data;
  },

  getProductosByMembresiaId: async (membresiaId) => {
    const res = await api.get('/membresia_producto', {
      params: { membresia_id: Number(membresiaId) },
    });
    return res.data;
  },

  // RF14: Contratar membresía (macro flujo con registro de productos)
  create: async ({ socioId, fechaInicio, fechaFin, montoTotal, esPrimera, productos }) => {
    // 1. Guardar la membresía principal
    const membresiaPayload = {
      socio_id: Number(socioId),
      fecha_inicio: fechaInicio,
      fecha_fin: fechaFin,
      monto_total: Number(montoTotal),
      estado: 'activa',
      es_primera: Boolean(esPrimera),
    };

    const resMembresia = await api.post('/membresias', membresiaPayload);
    const nuevaMembresia = resMembresia.data;

    // 🔍 LOG CLAVE: ver qué devuelve el backend
    console.log('🔍 MEMBRESÍA CREADA:', JSON.stringify(nuevaMembresia, null, 2));

    // 2. Buscar el ID en cualquiera de sus posibles nombres/ubicaciones
    const idMembresia =
      nuevaMembresia?.id ??
      nuevaMembresia?.idMembresia ??
      nuevaMembresia?.membresiaId ??
      nuevaMembresia?.membresia?.id;

    if (!idMembresia) {
      console.error('❌ No se encontró ID en la respuesta:', nuevaMembresia);
      throw new Error(
        'El backend no devolvió el ID de la membresía. Revisa el log 🔍 MEMBRESÍA CREADA.'
      );
    }

    console.log('✅ ID de membresía a usar:', idMembresia);

    // 3. Registrar los productos asociados
    const promesasProductos = productos.map((prod) => {
      const payloadProducto = {
        membresia_id: Number(idMembresia),
        producto_id: Number(prod.id),
        precio_unitario: Number(prod.precio_base ?? prod.precioBase ?? 0),
        cantidad_disponible: 1,
      };
      console.log('📦 PAYLOAD PRODUCTO:', JSON.stringify(payloadProducto, null, 2));
      return api.post('/membresia_producto', payloadProducto);
    });

    await Promise.all(promesasProductos);

    return nuevaMembresia;
  },

  cancel: async (id) => {
    const res = await api.patch(`/membresias/${id}`, { estado: 'cancelada' });
    return res.data;
  },
    delete: async (id) => {
    const res = await api.delete(`/membresias/${id}`);
    return res.data;
  },
};