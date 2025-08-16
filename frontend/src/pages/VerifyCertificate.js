import React, { useState } from 'react';
import axios from 'axios';

const VerifyCertificate = () => {
  const [certNumber, setCertNumber] = useState('');
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [verified, setVerified] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!certNumber.trim()) {
      setError('Please enter a certificate number');
      return;
    }

    setLoading(true);
    setError('');
    setCertificate(null);
    setVerified(false);

    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/certificates/verify/${certNumber.trim()}`
      );

      setCertificate(response.data.data);
      setVerified(response.data.valid);
    } catch (error) {
      if (error.response?.status === 404) {
        setError('Certificate not found. Please check the certificate number and try again.');
      } else {
        setError('An error occurred while verifying the certificate. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setCertNumber('');
    setCertificate(null);
    setError('');
    setVerified(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Verify Certificate
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Enter the certificate number to verify its authenticity and view certificate details.
          </p>
        </div>

        {/* Verification Form */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <form onSubmit={handleSubmit} className="max-w-md mx-auto">
            <div className="mb-6">
              <label htmlFor="certNumber" className="block text-sm font-medium text-gray-700 mb-2">
                Certificate Number
              </label>
              <input
                type="text"
                id="certNumber"
                value={certNumber}
                onChange={(e) => setCertNumber(e.target.value)}
                placeholder="Enter certificate number (e.g., CERT-001-2024)"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={loading}
              />
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Verifying...
                  </div>
                ) : (
                  'Verify Certificate'
                )}
              </button>
              
              {certificate && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 bg-gray-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
                >
                  Verify Another
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Certificate Result */}
        {certificate && (
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="text-center mb-6">
              {verified ? (
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 text-green-600 rounded-full mb-4">
                  <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              ) : (
                <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 text-yellow-600 rounded-full mb-4">
                  <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
              )}
              
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {verified ? 'Certificate Verified' : 'Certificate Found'}
              </h2>
              <p className={`text-lg ${verified ? 'text-green-600' : 'text-yellow-600'}`}>
                {verified 
                  ? 'This certificate is valid and authentic.'
                  : 'Certificate found but status is not valid.'
                }
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Student Name
                  </label>
                  <p className="text-lg font-semibold text-gray-900">
                    {certificate.student_name}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Course Name
                  </label>
                  <p className="text-lg font-semibold text-gray-900">
                    {certificate.course_name}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Issue Date
                  </label>
                  <p className="text-lg font-semibold text-gray-900">
                    {new Date(certificate.issue_date).toLocaleDateString()}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Certificate Number
                  </label>
                  <p className="text-lg font-semibold text-gray-900">
                    {certificate.cert_number}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Status
                  </label>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    certificate.status === 'Valid' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {certificate.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-8 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 text-center">
                <strong>Note:</strong> This verification system is provided by Reachout Academy. 
                For any questions about this certificate, please contact us directly.
              </p>
            </div>
          </div>
        )}

        {/* Information Section */}
        <div className="bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            How to Verify Your Certificate
          </h3>
          <ul className="space-y-2 text-blue-800">
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              Locate your certificate number on your certificate document
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              Enter the certificate number exactly as it appears
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              Click "Verify Certificate" to check authenticity
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              View the certificate details and verification status
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default VerifyCertificate; 