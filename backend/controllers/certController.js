const supabase = require('../config/supabase');

// Verify certificate by number
const verifyCertificate = async (req, res) => {
  try {
    const { number } = req.params;

    if (!number) {
      return res.status(400).json({
        error: true,
        message: 'Certificate number is required'
      });
    }

    const { data: certificate, error } = await supabase
      .from('certificates')
      .select('*')
      .eq('cert_number', number)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          error: true,
          message: 'Certificate not found or invalid'
        });
      }
      console.error('Supabase error:', error);
      return res.status(500).json({
        error: true,
        message: 'Failed to verify certificate'
      });
    }

    // Check if certificate is valid
    if (certificate.status !== 'Valid') {
      return res.status(200).json({
        error: false,
        data: certificate,
        message: 'Certificate found but status is not valid',
        valid: false
      });
    }

    res.status(200).json({
      error: false,
      data: certificate,
      message: 'Certificate verified successfully',
      valid: true
    });
  } catch (error) {
    console.error('Controller error:', error);
    res.status(500).json({
      error: true,
      message: 'Internal server error'
    });
  }
};

// Get all certificates (admin only)
const getAllCertificates = async (req, res) => {
  try {
    const { data: certificates, error } = await supabase
      .from('certificates')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({
        error: true,
        message: 'Failed to fetch certificates'
      });
    }

    res.status(200).json({
      error: false,
      data: certificates,
      count: certificates.length
    });
  } catch (error) {
    console.error('Controller error:', error);
    res.status(500).json({
      error: true,
      message: 'Internal server error'
    });
  }
};

// Create new certificate
const createCertificate = async (req, res) => {
  try {
    const { student_name, course_name, issue_date, cert_number, status = 'Valid' } = req.body;

    // Validation
    if (!student_name || !course_name || !issue_date || !cert_number) {
      return res.status(400).json({
        error: true,
        message: 'Student name, course name, issue date, and certificate number are required'
      });
    }

    // Check if certificate number already exists
    const { data: existingCert, error: checkError } = await supabase
      .from('certificates')
      .select('id')
      .eq('cert_number', cert_number)
      .single();

    if (existingCert) {
      return res.status(400).json({
        error: true,
        message: 'Certificate number already exists'
      });
    }

    // Validate date format
    const parsedDate = new Date(issue_date);
    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({
        error: true,
        message: 'Invalid issue date format'
      });
    }

    const { data: certificate, error } = await supabase
      .from('certificates')
      .insert([{
        student_name,
        course_name,
        issue_date: parsedDate.toISOString().split('T')[0],
        cert_number,
        status
      }])
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({
        error: true,
        message: 'Failed to create certificate'
      });
    }

    res.status(201).json({
      error: false,
      message: 'Certificate created successfully',
      data: certificate
    });
  } catch (error) {
    console.error('Controller error:', error);
    res.status(500).json({
      error: true,
      message: 'Internal server error'
    });
  }
};

// Delete certificate
const deleteCertificate = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if certificate exists
    const { data: existingCert, error: checkError } = await supabase
      .from('certificates')
      .select('id')
      .eq('id', id)
      .single();

    if (checkError || !existingCert) {
      return res.status(404).json({
        error: true,
        message: 'Certificate not found'
      });
    }

    // Delete certificate
    const { error } = await supabase
      .from('certificates')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({
        error: true,
        message: 'Failed to delete certificate'
      });
    }

    res.status(200).json({
      error: false,
      message: 'Certificate deleted successfully'
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
  verifyCertificate,
  getAllCertificates,
  createCertificate,
  deleteCertificate
}; 