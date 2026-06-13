import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const origin = requestUrl.origin;

  if (code) {
    // 1. Obtenemos las cookies usando la función de Next.js
    const cookieStore = await cookies();
    
    // 2. Le pasamos el cookieStore a nuestra función creadora del cliente
    const supabase = createClient(cookieStore);
    
    // Intercambiamos el código de la URL por una sesión real
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error) {
      // Si todo sale bien, te mandamos directo a tu alacena
      return NextResponse.redirect(`${origin}/dashboard/pantry`);
    }
  }

  // Si el código expiró o hubo un error, te regresamos al inicio
  return NextResponse.redirect(`${origin}/?error=auth_failed`);
}