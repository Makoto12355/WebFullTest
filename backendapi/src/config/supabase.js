import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
const supabaseurl = process.env.SUPABASE_URL;
const supabasesecretkey = process.env.SUPABASE_SECRET;

if (!supabaseurl) {
    throw new Error("Not find URL in .env");
}

if (!supabasesecretkey) {
    throw new Error("Not find secret key .env");
}
export const supabase = createClient(supabaseurl, supabasesecretkey, {
    auth: {
        persistSession: false,
        autoRefreshToken: false
    }
});