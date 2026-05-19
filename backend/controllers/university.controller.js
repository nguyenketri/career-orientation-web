// controllers/university.controller.js
// Controller cho các API CRUD của trường đại học

const { getAllUniversities, getUniversityById, createUniversity, updateUniversity, deleteUniversity } = require('../services/university.service');

// GET /api/universities
exports.getAllUniversities = async (req, res) => {
  try {
    const universities = await getAllUniversities();
    return res.status(200).json({ status: 'success', data: universities });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: err.message });
  }
};

// GET /api/universities/:id
exports.getUniversityById = async (req, res) => {
  try {
    const university = await getUniversityById(req.params.id);
    return res.status(200).json({ status: 'success', data: university });
  } catch (err) {
    return res.status(404).json({ status: 'error', message: err.message });
  }
};

// POST /api/universities (admin)
exports.createUniversity = async (req, res) => {
  try {
    const university = await createUniversity(req.body);
    return res.status(201).json({ status: 'success', data: university });
  } catch (err) {
    return res.status(400).json({ status: 'error', message: err.message });
  }
};

// PUT /api/universities/:id (admin)
exports.updateUniversity = async (req, res) => {
  try {
    const university = await updateUniversity(req.params.id, req.body);
    return res.status(200).json({ status: 'success', data: university });
  } catch (err) {
    return res.status(400).json({ status: 'error', message: err.message });
  }
};

// DELETE /api/universities/:id (admin)
exports.deleteUniversity = async (req, res) => {
  try {
    await deleteUniversity(req.params.id);
    return res.status(200).json({ status: 'success', message: 'University deleted' });
  } catch (err) {
    return res.status(404).json({ status: 'error', message: err.message });
  }
};
