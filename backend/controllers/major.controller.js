const {
  createMajor,
  getAllMajors,
  getMajorById,
  updateMajor,
} = require("../services/major.service");

// GET ALL MAJORS
exports.getAllMajors = async (req, res) => {
  try {
    const majors = await getAllMajors(req.query);

    return res.status(200).json({
      status: "success",
      message: "Get majors successfully",
      data: majors,
    });
  } catch (err) {
    return res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
};

// GET MAJOR BY ID
exports.getMajorById = async (req, res) => {
  try {
    const major = await getMajorById(req.params.id);

    return res.status(200).json({
      status: "success",
      message: "Get major successfully",
      data: major,
    });
  } catch (err) {
    return res.status(404).json({
      status: "error",
      message: err.message,
    });
  }
};

// CREATE MAJOR
exports.createMajor = async (req, res) => {
  try {
    const major = await createMajor(req.body);

    return res.status(201).json({
      status: "success",
      message: "Major created successfully",
      data: major,
    });
  } catch (err) {
    return res.status(400).json({
      status: "error",
      message: err.message,
    });
  }
};

// UPDATE MAJOR
exports.updateMajor = async (req, res) => {
  try {
    const major = await updateMajor(req.params.id, req.body);

    return res.status(200).json({
      status: "success",
      message: "Major updated successfully",
      data: major,
    });
  } catch (err) {
    return res.status(400).json({
      status: "error",
      message: err.message,
    });
  }
};
