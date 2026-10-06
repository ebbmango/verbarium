import { createClient } from "@supabase/supabase-js";

// Both values are public by design: the database's access rules decide what
// the client can reach with them. There is no `.env` and no CI variable.
export const supabaseUrl = "https://fxgwfhdpvppoyvpkxdbs.supabase.co";
export const supabasePublishableKey = "sb_publishable_aII57dGZJYNqRjFJ24AWgw_UySBIeQ0";

export const supabase = createClient(supabaseUrl, supabasePublishableKey);
