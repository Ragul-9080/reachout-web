const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

const testAuth = async () => {
  console.log('🧪 Testing authentication system...\n');

  try {
    // Test 1: Check if server is running
    console.log('1. Checking server health...');
    try {
      const healthResponse = await axios.get('http://localhost:5000/health');
      console.log('✅ Server is running');
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        console.log('❌ Server is not running. Start with: npm run dev');
        return;
      }
    }

    // Test 2: Try to access /me without token (should fail)
    console.log('\n2. Testing /me endpoint without token...');
    try {
      await axios.get(`${BASE_URL}/auth/me`);
      console.log('❌ Should have failed - no token provided');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Correctly rejected (401 Unauthorized)');
      } else {
        console.log('❌ Unexpected error:', error.response?.status || error.message);
      }
    }

    // Test 3: Login with valid credentials
    console.log('\n3. Testing login...');
    try {
      const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
        email: 'admin@reachoutacademy.com',
        password: 'admin123'
      });
      
      if (loginResponse.data.error === false) {
        console.log('✅ Login successful');
        const token = loginResponse.data.data.token;
        
        // Test 4: Access /me with valid token
        console.log('\n4. Testing /me endpoint with valid token...');
        const meResponse = await axios.get(`${BASE_URL}/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (meResponse.data.error === false) {
          console.log('✅ /me endpoint working correctly');
          console.log('User data:', meResponse.data.data);
        } else {
          console.log('❌ /me endpoint failed');
        }
      } else {
        console.log('❌ Login failed:', loginResponse.data.message);
      }
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('❌ Login failed - Invalid credentials');
        console.log('💡 Run: npm run setup (to create admin user)');
      } else {
        console.log('❌ Login error:', error.response?.data?.message || error.message);
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

// Run test if this file is executed directly
if (require.main === module) {
  testAuth();
}

module.exports = { testAuth };
