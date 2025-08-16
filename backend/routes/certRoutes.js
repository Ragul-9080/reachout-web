const express = require('express');
const router = express.Router();
const certController = require('../controllers/certController');
const authMiddleware = require('../middleware/auth');

// Public routes (no authentication required)
router.get('/verify/:number', certController.verifyCertificate);

// Protected routes (admin only)
router.get('/', authMiddleware, certController.getAllCertificates);
router.post('/', authMiddleware, certController.createCertificate);
router.delete('/:id', authMiddleware, certController.deleteCertificate);

module.exports = router; 