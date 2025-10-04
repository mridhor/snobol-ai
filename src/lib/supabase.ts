import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SNOBOL_SUPABASE_URL!
const supabaseKey = process.env.SNOBOL_NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)
