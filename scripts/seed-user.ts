import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const adminEmail = process.env.ADMIN_EMAIL;
const adminPassword = process.env.ADMIN_PASSWORD;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment');
  process.exit(1);
}

if (!adminEmail || !adminPassword) {
  console.error('Missing ADMIN_EMAIL or ADMIN_PASSWORD in environment');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function seedUser() {
  console.log('Seeding admin user...');

  const { data: existingUsers, error: listError } = await supabase.auth.admin.listUsers();

  if (listError) {
    console.error('Error listing users:', listError.message);
    process.exit(1);
  }

  const existingUser = existingUsers?.users.find(u => u.email === adminEmail);

  if (existingUser) {
    console.log(`User ${adminEmail} already exists with ID: ${existingUser.id}`);

    const { error: updateError } = await supabase.auth.admin.updateUserById(
      existingUser.id,
      { password: adminPassword }
    );

    if (updateError) {
      console.error('Error updating password:', updateError.message);
      process.exit(1);
    }

    console.log('Password updated successfully');
  } else {
    const { data, error: createError } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
    });

    if (createError) {
      console.error('Error creating user:', createError.message);
      process.exit(1);
    }

    console.log(`User created successfully with ID: ${data.user?.id}`);
  }

  console.log('Seeding complete!');
}

seedUser().catch(error => {
  console.error('Unexpected error:', error);
  process.exit(1);
});
