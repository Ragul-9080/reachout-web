const supabase = require('../config/supabase');
const bcrypt = require('bcryptjs');

// Setup script to create initial admin user
const setupAdminUser = async () => {
  try {
    console.log('🚀 Setting up initial admin user...');

    // Check if admin already exists
    const { data: existingAdmin, error: checkError } = await supabase
      .from('admin_users')
      .select('id')
      .limit(1);

    if (existingAdmin && existingAdmin.length > 0) {
      console.log('✅ Admin user already exists');
      return;
    }

    // Create admin user
    const email = 'admin@reachoutacademy.com';
    const password = 'admin123'; // Change this in production!
    
    console.log(`📧 Creating admin user with email: ${email}`);
    console.log(`🔑 Default password: ${password}`);
    console.log('⚠️  IMPORTANT: Change this password after first login!');

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Insert admin user
    const { data: admin, error } = await supabase
      .from('admin_users')
      .insert([{
        email: email.toLowerCase(),
        password_hash: passwordHash
      }])
      .select('id, email, created_at')
      .single();

    if (error) {
      console.error('❌ Error creating admin user:', error);
      return;
    }

    console.log('✅ Admin user created successfully!');
    console.log('📋 Admin details:', admin);
    console.log('\n🔐 Login credentials:');
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    console.log('\n⚠️  Remember to change the password after first login!');

  } catch (error) {
    console.error('❌ Setup failed:', error);
  }
};

// Run setup if this file is executed directly
if (require.main === module) {
  setupAdminUser()
    .then(() => {
      console.log('🎉 Setup completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Setup failed:', error);
      process.exit(1);
    });
}

module.exports = setupAdminUser; 