'use client';

import { useState } from 'react';
import { Mail, Lock, Loader2, X } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

interface LoginModalProps {
  onClose: () => void;
}

export function LoginModal({ onClose }: LoginModalProps) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  const handleGoogleLogin = async () => {
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) setError(error.message);
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isRegistering) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
        });
        if (error) throw error;
        alert('Revisa tu correo para confirmar tu cuenta.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        window.location.href = '/dashboard/pantry';
      }
    } catch (err: any) {
      setError(err.message || 'Ocurrió un error en la autenticación.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#335C67]/60 backdrop-blur-sm transition-opacity"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative animate-in fade-in zoom-in duration-200">
        
        {/* Botón de Cerrar */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-400 hover:text-gray-700 hover:bg-gray-100 p-2 rounded-full transition-colors"
        >
          <X size={20} />
        </button>

        <div className="text-center mb-8 mt-2">
          <h2 className="text-3xl font-bold mb-2 text-[#335C67]" style={{ fontFamily: "'Playfair Display', serif" }}>
            {isRegistering ? 'Crea tu cuenta' : 'Bienvenido'}
          </h2>
          <p className="text-[#5a8a96] text-sm">
            {isRegistering ? 'Comienza a cocinar inteligentemente hoy.' : 'Ingresa a tu alacena digital.'}
          </p>
        </div>

        {/* Botón de Google */}
        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 px-6 py-3 border border-gray-300 rounded-2xl text-[#335C67] font-bold hover:bg-gray-50 transition-colors shadow-sm mb-6"
        >
          <svg viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
            <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
              <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"/>
              <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"/>
              <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"/>
              <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"/>
            </g>
          </svg>
          Continuar con Google
        </button>

        <div className="flex items-center gap-4 mb-6">
          <div className="h-px bg-gray-200 flex-1"></div>
          <span className="text-gray-400 text-xs font-medium">o con tu correo</span>
          <div className="h-px bg-gray-200 flex-1"></div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm text-center">
            {error}
          </div>
        )}

        {/* Formulario de Email */}
        <form onSubmit={handleEmailAuth} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#335C67] mb-1.5">Correo Electrónico</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail size={16} className="text-[#335C67]" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                /* Aquí añadimos text-black y placeholder:text-gray-500 */
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#E09F3E] focus:border-[#E09F3E] outline-none transition-all text-sm font-medium text-black placeholder:text-gray-500 placeholder:font-normal"
                placeholder="chef@ejemplo.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#335C67] mb-1.5">Contraseña</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock size={16} className="text-[#335C67]" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                /* Aquí añadimos text-black y placeholder:text-gray-500 */
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#E09F3E] focus:border-[#E09F3E] outline-none transition-all text-sm font-medium text-black placeholder:text-gray-500 placeholder:font-normal"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center py-3 px-4 rounded-xl text-white font-bold text-base transition-all shadow-md mt-2 hover:bg-[#7d2122]"
            style={{ backgroundColor: loading ? '#b86667' : '#9E2A2B' }}
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : (isRegistering ? 'Crear cuenta' : 'Iniciar Sesión')}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-[#5a8a96]">
          {isRegistering ? '¿Ya tienes una cuenta?' : '¿No tienes cuenta aún?'}{' '}
          <button
            onClick={() => setIsRegistering(!isRegistering)}
            className="font-bold text-[#335C67] hover:text-[#E09F3E] transition-colors"
          >
            {isRegistering ? 'Inicia sesión' : 'Regístrate gratis'}
          </button>
        </div>
      </div>
    </div>
  );
}