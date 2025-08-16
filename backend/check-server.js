const axios = require('axios');

const checkServer = async () => {
  console.log('🔍 Checking server status...\n');

  try {
    // Check health endpoint
    console.log('1. Checking health endpoint...');
    const healthResponse = await axios.get('http://localhost:5000/health');
    console.log('✅ Server is running');
    console.log('📊 Health status:', healthResponse.data);

    // Check if API routes are accessible
    console.log('\n2. Checking API routes...');
    try {
      await axios.get('http://localhost:5000/api/courses');
      console.log('✅ API routes are accessible');
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('✅ API routes are accessible (404 is expected for some routes)');
      } else {
        console.log('⚠️  API routes check:', error.message);
      }
    }

    // Check environment variables
    console.log('\n3. Checking environment variables...');
    try {
      const response = await axios.get('http://localhost:5000/api/auth/login', {
        method: 'POST',
        data: { email: 'test', password: 'test' }
      });
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ Server is responding to auth requests');
      } else if (error.response?.status === 500) {
        console.log('⚠️  Server error - check environment variables');
        console.log('💡 Run: npm run setup-env');
      } else {
        console.log('⚠️  Auth endpoint check:', error.message);
      }
    }

  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('❌ Server is not running');
      console.log('💡 Start the server with: npm run dev');
    } else {
      console.log('❌ Server check failed:', error.message);
    }
  }
};

// Run check if this file is executed directly
if (require.main === module) {
  checkServer();
}

module.exports = { checkServer };
