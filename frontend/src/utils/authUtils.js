// Authentication utility functions

export const clearAuthData = () => {
  localStorage.removeItem('adminToken');
  console.log('🧹 Cleared authentication data from localStorage');
};

export const getAuthData = () => {
  const token = localStorage.getItem('adminToken');
  console.log('🔍 Current auth data:', { 
    hasToken: !!token, 
    tokenLength: token ? token.length : 0 
  });
  return { token };
};

export const checkAuthStatus = () => {
  const token = localStorage.getItem('adminToken');
  if (!token) {
    console.log('❌ No authentication token found');
    return false;
  }
  
  try {
    // Basic token validation (check if it's a valid JWT format)
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.log('❌ Invalid token format');
      return false;
    }
    
    console.log('✅ Token format appears valid');
    return true;
  } catch (error) {
    console.log('❌ Token validation error:', error);
    return false;
  }
};

// Function to manually clear auth and reload
export const forceLogout = () => {
  clearAuthData();
  window.location.href = '/admin/login';
};
