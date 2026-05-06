const { createMajor } = require("../services/major.service");

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
