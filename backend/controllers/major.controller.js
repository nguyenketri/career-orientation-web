const { createMajor, getAllMajors } = require("../services/major.service");

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
