
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase env vars')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkCategories() {
    const { data, error } = await supabase.from('floor_categories').select('*').order('id')
    if (error) {
        console.error(error)
        return
    }
    console.log(JSON.stringify(data, null, 2))
}

checkCategories()
