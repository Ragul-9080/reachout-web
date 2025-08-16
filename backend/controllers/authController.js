const supabase = require('../config/supabase');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Admin login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        error: true,
        message: 'Email and password are required'
      });
    }

    // Find admin user
    const { data: admin, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('email', email.toLowerCase())
      .single();

    if (error || !admin) {
      return res.status(401).json({
        error: true,
        message: 'Invalid credentials'
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, admin.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({
        error: true,
        message: 'Invalid credentials'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: admin.id, 
        email: admin.email,
        role: 'admin'
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Remove password from response
    const { password_hash, ...adminData } = admin;

    res.status(200).json({
      error: false,
      message: 'Login successful',
      data: {
        user: adminData,
        token
      }
    });
  } catch (error) {
    console.error('Controller error:', error);
    res.status(500).json({
      error: true,
      message: 'Internal server error'
    });
  }
};

// Logout (client-side token removal)
const logout = async (req, res) => {
  try {
    res.status(200).json({
      error: false,
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Controller error:', error);
    res.status(500).json({
      error: true,
      message: 'Internal server error'
    });
  }
};

// Get current user info
const getCurrentUser = async (req, res) => {
  try {
    // This endpoint requires authentication middleware
    // req.user is set by the auth middleware
    const { id, email, role } = req.user;

    const { data: admin, error } = await supabase
      .from('admin_users')
      .select('id, email, created_at, updated_at')
      .eq('id', id)
      .single();

    if (error || !admin) {
      return res.status(404).json({
        error: true,
        message: 'User not found'
      });
    }

    res.status(200).json({
      error: false,
      data: admin
    });
  } catch (error) {
    console.error('Controller error:', error);
    res.status(500).json({
      error: true,
      message: 'Internal server error'
    });
  }
};




// Create admin user (for initial setup)
const createAdminUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        error: true,
        message: 'Email and password are required'
      });
    }

    // Check if admin already exists
    const { data: existingAdmin, error: checkError } = await supabase
      .from('admin_users')
      .select('id')
      .eq('email', email.toLowerCase())
      .single();

    if (existingAdmin) {
      return res.status(400).json({
        error: true,
        message: 'Admin user already exists'
      });
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create admin user
    const { data: admin, error } = await supabase
      .from('admin_users')
      .insert([{
        email: email.toLowerCase(),
        password_hash: passwordHash
      }])
      .select('id, email, created_at')
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({
        error: true,
        message: 'Failed to create admin user'
      });
    }

    res.status(201).json({
      error: false,
      message: 'Admin user created successfully',
      data: admin
    });
  } catch (error) {
    console.error('Controller error:', error);
    res.status(500).json({
      error: true,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  login,
  logout,
  getCurrentUser,
  createAdminUser
}; 