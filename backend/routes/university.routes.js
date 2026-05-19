// routes/university.routes.js
const express = require('express');
const router = express.Router();

const { 
  getAllUniversities, 
  getUniversityById, 
  createUniversity, 
  updateUniversity, 
  deleteUniversity,
  getAllUniversityMajors
} = require('../controllers/university.controller');

// PUBLIC: list all universities
router.get('/', getAllUniversities);
// PUBLIC: list all university-major combinations
router.get('/majors/all', getAllUniversityMajors);
router.get('/:id', getUniversityById);

// PROTECTED (requires auth middleware) – for admin CRUD
const authMiddleware = require('../middlewares/auth.middleware');
router.post('/', authMiddleware, createUniversity);
router.put('/:id', authMiddleware, updateUniversity);
router.delete('/:id', authMiddleware, deleteUniversity);

module.exports = router;
