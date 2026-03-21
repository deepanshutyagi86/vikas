/* ═══════════════════════════════════════════════════════════════
   db.js  —  Muchhad · Supabase Database Layer
   ─────────────────────────────────────────────────────────────
   Replace the two config values below with your actual keys.
   Get them from: Supabase Dashboard → Project Settings → API
═══════════════════════════════════════════════════════════════ */

const SUPABASE_URL      = 'https://ducllpryjobrmmbltifk.supabase.co';   // e.g. https://abcxyz.supabase.co
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR1Y2xscHJ5am9icm1tYmx0aWZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQwOTIxNTEsImV4cCI6MjA4OTY2ODE1MX0.b8ARPrg4D9KH5-snMdnBUFHJl6tAEKp3zrjxXez7mIE';      // starts with "eyJ..."

/* ── Client (populated once the Supabase CDN script has loaded) ── */
const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/* ═══════════════════════════════════════════════════════════════
   SUPABASE SETUP SQL
   ─────────────────────────────────────────────────────────────
   Run this once in Supabase → SQL Editor:

   create table preorders (
     id           uuid default gen_random_uuid() primary key,
     created_at   timestamptz default now(),
     name         text not null,
     email        text not null,
     phone        text not null,
     address      text not null,
     cart_items   jsonb not null,
     total_amount numeric not null,
     status       text default 'pending'
   );

   alter table preorders enable row level security;

   create policy "Allow anon inserts"
     on preorders for insert with check (true);
═══════════════════════════════════════════════════════════════ */


/* ═══════════════════════════════════════════════════════════════
   savePreorder(payload)
   ─────────────────────────────────────────────────────────────
   Inserts one pre-order row into the `preorders` table.

   payload = {
     name         : string,
     email        : string,
     phone        : string,
     address      : string,
     cart_items   : Array<{ product_id, product_name, quantity,
                            unit_price, line_total }>,
     total_amount : number,
     status       : 'pending'   (default)
   }

   Returns  { success: true }  or  { success: false, error: string }
═══════════════════════════════════════════════════════════════ */
async function savePreorder(payload) {
  try {
    const { error } = await db.from('preorders').insert([payload]);
    if (error) throw error;
    return { success: true };
  } catch (err) {
    console.error('[Muchhad] Supabase insert failed:', err);
    return {
      success: false,
      error: err.message || 'Database error — please try again.'
    };
  }
}


/* ═══════════════════════════════════════════════════════════════
   EXPORT  (available globally, loaded before app.js)
═══════════════════════════════════════════════════════════════ */
window.MuchhhadDB = { savePreorder };
