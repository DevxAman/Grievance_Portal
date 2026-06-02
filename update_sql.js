import fs from 'fs';
let sql = fs.readFileSync('supabase/setup_new_database.sql', 'utf8');

// Omit the `id` column from the INSERT INTO users statement
sql = sql.replace(/INSERT INTO public\.users \(id, user_id, password, role, email, created_at\) VALUES/g,
    'INSERT INTO public.users (user_id, password, role, email, created_at) VALUES');

// Remove the hardcoded pseudo-UUIDs
// They look like: ('00000000-0000-0000-0000-000000000001', 
sql = sql.replace(/\('00000000-0000-0000-0000-[0-9]{12}', /g, '(');

// Update logic for crn mapping
sql = sql.replace(/crn = CONCAT\('221', LPAD\(SUBSTRING\(id::text FROM 1 FOR 4\), 4, '0'\)\)/g,
    "crn = CONCAT('221', LPAD(SUBSTRING(user_id FROM 2), 4, '0'))");

fs.writeFileSync('supabase/setup_new_database.sql', sql);
console.log('SQL updated successfully');
