import React, { useEffect, useState } from 'react';
import { obtenerMensajeError } from '../../utils/obtenerMensajeError';
import { usuariosService } from '../../api/usuariosService';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { ROLES } from '../../constants/roles';
import { Ban, Pencil, UserCheck } from 'lucide-react';

export default function UsuariosPage() {
  const { addToast } = useToast();
  const { user } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [error, setError] = useState('');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [editando, setEditando] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [formulario, setFormulario] = useState({ nombre: '', email: '', rol: ROLES.STAFF, password: '' });

  const cargarUsuarios = async () => {
    try {
      setUsuarios(await usuariosService.listar());
      setError('');
    } catch (errorPeticion) {
      setError(obtenerMensajeError(errorPeticion));
      addToast(obtenerMensajeError(errorPeticion), 'error');
    }
  };

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const abrirFormulario = (usuario = null) => {
    setEditando(usuario);
    setFormulario({
      nombre: usuario?.nombre || '',
      email: usuario?.email || '',
      rol: usuario?.rol || ROLES.STAFF,
      password: '',
    });
    setModalAbierto(true);
  };

  const guardarUsuario = async (event) => {
    event.preventDefault();
    const datos = {
      nombre: formulario.nombre.trim(),
      email: formulario.email.trim(),
      rol: formulario.rol.toLowerCase(),
    };
    if (!editando || formulario.password.trim()) datos.password = formulario.password;

    try {
      setGuardando(true);
      if (editando) await usuariosService.actualizar(editando.id, datos);
      else await usuariosService.crear(datos);
      addToast(editando ? 'Usuario actualizado.' : 'Usuario creado.', 'success');
      setModalAbierto(false);
      await cargarUsuarios();
    } catch (errorPeticion) {
      addToast(obtenerMensajeError(errorPeticion), 'error');
    } finally {
      setGuardando(false);
    }
  };

  const desactivar = async (usuario) => {
    if (!window.confirm(`¿Desactivar al usuario ${usuario.nombre}?`)) return;
    try {
      await usuariosService.desactivar(usuario.id);
      addToast('Usuario desactivado.', 'success');
      await cargarUsuarios();
    } catch (errorPeticion) {
      addToast(obtenerMensajeError(errorPeticion), 'error');
    }
  };

  const reactivar = async (usuario) => {
    try {
      await usuariosService.actualizar(usuario.id, { activo: true });
      addToast('Usuario reactivado.', 'success');
      await cargarUsuarios();
    } catch (errorPeticion) {
      addToast(obtenerMensajeError(errorPeticion), 'error');
    }
  };

  return (
    <main className="space-y-5">
      <header className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Gestión de usuarios</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">Cuentas del personal y sus permisos.</p>
        </div>
        <button onClick={() => abrirFormulario()} className="rounded-lg bg-emerald-600 px-4 py-2 text-sm text-white">Crear usuario</button>
      </header>

      {error && <p role="alert" className="text-sm text-red-700 dark:text-red-400">{error}</p>}

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <table className="w-full text-left text-sm">
          <thead><tr><th className="p-3">Nombre</th><th className="p-3">Email</th><th className="p-3">Rol</th><th className="p-3">Estado</th><th className="p-3 text-right">Acciones</th></tr></thead>
          <tbody>
            {usuarios.map((usuario) => {
              const esActual = user?.email?.toLowerCase() === usuario.email?.toLowerCase();
              return (
                <tr key={usuario.id} className="border-t border-slate-200 dark:border-slate-800">
                  <td className="p-3">{usuario.nombre}</td>
                  <td className="p-3">{usuario.email}</td>
                  <td className="p-3">{usuario.rol}</td>
                  <td className="p-3">{usuario.activo ? 'Activo' : 'Inactivo'}</td>
                  <td className="p-3">
                    <div className="flex items-center justify-end gap-1.5">
                      <button onClick={() => abrirFormulario(usuario)} className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors cursor-pointer" title="Editar" aria-label="Editar"><Pencil size={14} /></button>
                      {usuario.activo
                        ? !esActual && <button onClick={() => desactivar(usuario)} className="p-1.5 rounded-lg bg-red-100 hover:bg-red-200 dark:bg-red-500/10 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20 transition-colors cursor-pointer" title="Desactivar" aria-label="Desactivar"><Ban size={14} /></button>
                        : <button onClick={() => reactivar(usuario)} className="p-1.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 transition-colors cursor-pointer" title="Reactivar" aria-label="Reactivar"><UserCheck size={14} /></button>}
                    </div>
                  </td>
                </tr>
              );
            })}
            {usuarios.length === 0 && <tr><td colSpan="5" className="p-5 text-center text-slate-500">No hay usuarios registrados.</td></tr>}
          </tbody>
        </table>
      </div>

      {modalAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <form onSubmit={guardarUsuario} className="w-full max-w-md space-y-4 rounded-xl bg-white p-5 dark:bg-slate-900">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{editando ? 'Editar usuario' : 'Crear usuario'}</h2>
            <label className="block text-sm text-slate-700 dark:text-slate-300">Nombre
              <input required value={formulario.nombre} onChange={(event) => setFormulario({ ...formulario, nombre: event.target.value })} className="mt-1 block w-full rounded border p-2 dark:bg-slate-950" />
            </label>
            <label className="block text-sm text-slate-700 dark:text-slate-300">Email
              <input required type="email" value={formulario.email} onChange={(event) => setFormulario({ ...formulario, email: event.target.value })} className="mt-1 block w-full rounded border p-2 dark:bg-slate-950" />
            </label>
            <label className="block text-sm text-slate-700 dark:text-slate-300">Rol
              <select value={formulario.rol} onChange={(event) => setFormulario({ ...formulario, rol: event.target.value })} className="mt-1 block w-full rounded border p-2 dark:bg-slate-950">
                <option value={ROLES.ADMIN}>admin</option>
                <option value={ROLES.STAFF}>staff</option>
              </select>
            </label>
            <label className="block text-sm text-slate-700 dark:text-slate-300">Contraseña{editando ? ' (opcional)' : ''}
              <input required={!editando} type="password" value={formulario.password} onChange={(event) => setFormulario({ ...formulario, password: event.target.value })} placeholder={editando ? 'Dejar vacío para mantenerla' : ''} className="mt-1 block w-full rounded border p-2 dark:bg-slate-950" />
            </label>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setModalAbierto(false)} className="rounded-lg border px-3 py-2 text-sm">Cancelar</button>
              <button type="submit" disabled={guardando} className="rounded-lg bg-emerald-600 px-3 py-2 text-sm text-white">{guardando ? 'Guardando…' : 'Guardar'}</button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}
