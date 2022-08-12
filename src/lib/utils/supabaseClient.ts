import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.DEV ? import.meta.env.VITE_SUPABASE_URL : process.env.SUPABASE_URL
const supabaseAnonKey = import.meta.env.DEV ? import.meta.env.VITE_SUPABASE_ANON_KEY : process.env.SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)