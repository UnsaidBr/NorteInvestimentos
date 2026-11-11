import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Lê variáveis de ambiente cliente expostas pelo Vite (prefixadas com VITE_)
const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

export const isSupabaseRealtimeConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.startsWith('http') &&
  supabaseAnonKey.length > 10
);

/**
 * Cliente Supabase para o navegador com suporte a Realtime WebSocket
 */
export const supabase: SupabaseClient | null = isSupabaseRealtimeConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    })
  : null;

export default supabase;
