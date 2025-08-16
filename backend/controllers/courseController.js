const supabase = require('../config/supabase');

// Get all courses
const getAllCourses = async (req, res) => {
  try {
    const { data: courses, error } = await supabase
      .from('courses')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({
        error: true,
        message: 'Failed to fetch courses'
      });
    }

    res.status(200).json({
      error: false,
      data: courses,
      count: courses.length
    });
  } catch (error) {
    console.error('Controller error:', error);
    res.status(500).json({
      error: true,
      message: 'Internal server error'
    });
  }
};

// Get course by ID
const getCourseById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: course, error } = await supabase
      .from('courses')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          error: true,
          message: 'Course not found'
        });
      }
      console.error('Supabase error:', error);
      return res.status(500).json({
        error: true,
        message: 'Failed to fetch course'
      });
    }

    res.status(200).json({
      error: false,
      data: course
    });
  } catch (error) {
    console.error('Controller error:', error);
    res.status(500).json({
      error: true,
      message: 'Internal server error'
    });
  }
};

// Create new course
const createCourse = async (req, res) => {
  try {
    const { title, description, duration, fees, image_url } = req.body;

    // Validation
    if (!title || !description || !duration || !fees) {
      return res.status(400).json({
        error: true,
        message: 'Title, description, duration, and fees are required'
      });
    }

    const { data: course, error } = await supabase
      .from('courses')
      .insert([{
        title,
        description,
        duration,
        fees: parseFloat(fees),
        image_url: image_url || null
      }])
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({
        error: true,
        message: 'Failed to create course'
      });
    }

    res.status(201).json({
      error: false,
      message: 'Course created successfully',
      data: course
    });
  } catch (error) {
    console.error('Controller error:', error);
    res.status(500).json({
      error: true,
      message: 'Internal server error'
    });
  }
};

// Update course
const updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, duration, fees, image_url } = req.body;

    // Check if course exists
    const { data: existingCourse, error: checkError } = await supabase
      .from('courses')
      .select('id')
      .eq('id', id)
      .single();

    if (checkError || !existingCourse) {
      return res.status(404).json({
        error: true,
        message: 'Course not found'
      });
    }

    // Update course
    const { data: course, error } = await supabase
      .from('courses')
      .update({
        title,
        description,
        duration,
        fees: fees ? parseFloat(fees) : undefined,
        image_url,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({
        error: true,
        message: 'Failed to update course'
      });
    }

    res.status(200).json({
      error: false,
      message: 'Course updated successfully',
      data: course
    });
  } catch (error) {
    console.error('Controller error:', error);
    res.status(500).json({
      error: true,
      message: 'Internal server error'
    });
  }
};

// Delete course
const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if course exists
    const { data: existingCourse, error: checkError } = await supabase
      .from('courses')
      .select('id')
      .eq('id', id)
      .single();

    if (checkError || !existingCourse) {
      return res.status(404).json({
        error: true,
        message: 'Course not found'
      });
    }

    // Delete course
    const { error } = await supabase
      .from('courses')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({
        error: true,
        message: 'Failed to delete course'
      });
    }

    res.status(200).json({
      error: false,
      message: 'Course deleted successfully'
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
  getAllCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse
}; 