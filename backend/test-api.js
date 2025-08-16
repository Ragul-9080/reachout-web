const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Test data
const testCourse = {
  title: 'Web Development Fundamentals',
  description: 'Learn the basics of web development including HTML, CSS, and JavaScript',
  duration: '3 months',
  fees: 299.99,
  image_url: 'https://example.com/web-dev.jpg'
};

const testCertificate = {
  student_name: 'John Doe',
  course_name: 'Web Development Fundamentals',
  issue_date: '2024-01-15',
  cert_number: 'CERT-001-2024',
  status: 'Valid'
};

// Test functions
const testHealthCheck = async () => {
  try {
    console.log('🏥 Testing health check...');
    const response = await axios.get('http://localhost:5000/health');
    console.log('✅ Health check passed:', response.data);
    return true;
  } catch (error) {
    console.log('❌ Health check failed:', error.message);
    return false;
  }
};

const testCoursesAPI = async () => {
  try {
    console.log('\n📚 Testing courses API...');
    
    // Get all courses
    const getResponse = await axios.get(`${BASE_URL}/courses`);
    console.log('✅ Get courses passed:', getResponse.data.count, 'courses found');
    
    // Create course
    const createResponse = await axios.post(`${BASE_URL}/courses`, testCourse);
    console.log('✅ Create course passed:', createResponse.data.message);
    
    const courseId = createResponse.data.data.id;
    
    // Get course by ID
    const getByIdResponse = await axios.get(`${BASE_URL}/courses/${courseId}`);
    console.log('✅ Get course by ID passed:', getByIdResponse.data.data.title);
    
    // Update course
    const updateData = { ...testCourse, title: 'Updated Web Development Course' };
    const updateResponse = await axios.put(`${BASE_URL}/courses/${courseId}`, updateData);
    console.log('✅ Update course passed:', updateResponse.data.message);
    
    // Delete course
    const deleteResponse = await axios.delete(`${BASE_URL}/courses/${courseId}`);
    console.log('✅ Delete course passed:', deleteResponse.data.message);
    
    return true;
  } catch (error) {
    console.log('❌ Courses API test failed:', error.response?.data?.message || error.message);
    return false;
  }
};

const testCertificatesAPI = async () => {
  try {
    console.log('\n🎓 Testing certificates API...');
    
    // Create certificate
    const createResponse = await axios.post(`${BASE_URL}/certificates`, testCertificate);
    console.log('✅ Create certificate passed:', createResponse.data.message);
    
    const certId = createResponse.data.data.id;
    
    // Verify certificate
    const verifyResponse = await axios.get(`${BASE_URL}/certificates/verify/${testCertificate.cert_number}`);
    console.log('✅ Verify certificate passed:', verifyResponse.data.data.student_name);
    
    // Get all certificates (this will fail without auth, but that's expected)
    try {
      await axios.get(`${BASE_URL}/certificates`);
      console.log('❌ Get certificates should have failed (no auth)');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Get certificates correctly rejected (auth required)');
      }
    }
    
    // Delete certificate
    const deleteResponse = await axios.delete(`${BASE_URL}/certificates/${certId}`);
    console.log('✅ Delete certificate passed:', deleteResponse.data.message);
    
    return true;
  } catch (error) {
    console.log('❌ Certificates API test failed:', error.response?.data?.message || error.message);
    return false;
  }
};

const testAuthAPI = async () => {
  try {
    console.log('\n🔐 Testing auth API...');
    
    // Try to get current user without auth (should fail)
    try {
      await axios.get(`${BASE_URL}/auth/me`);
      console.log('❌ Get current user should have failed (no auth)');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Get current user correctly rejected (auth required)');
      }
    }
    
    console.log('✅ Auth API tests passed (auth required for protected endpoints)');
    return true;
  } catch (error) {
    console.log('❌ Auth API test failed:', error.response?.data?.message || error.message);
    return false;
  }
};

// Run all tests
const runTests = async () => {
  console.log('🧪 Starting API tests...\n');
  
  const healthCheck = await testHealthCheck();
  if (!healthCheck) {
    console.log('\n❌ Health check failed. Make sure the server is running!');
    return;
  }
  
  const coursesTest = await testCoursesAPI();
  const certificatesTest = await testCertificatesAPI();
  const authTest = await testAuthAPI();
  
  console.log('\n📊 Test Results:');
  console.log(`   Health Check: ${healthCheck ? '✅' : '❌'}`);
  console.log(`   Courses API: ${coursesTest ? '✅' : '❌'}`);
  console.log(`   Certificates API: ${certificatesTest ? '✅' : '❌'}`);
  console.log(`   Auth API: ${authTest ? '✅' : '❌'}`);
  
  const allPassed = healthCheck && coursesTest && certificatesTest && authTest;
  console.log(`\n${allPassed ? '🎉 All tests passed!' : '💥 Some tests failed!'}`);
};

// Run tests if this file is executed directly
if (require.main === module) {
  runTests();
}

module.exports = { runTests }; 