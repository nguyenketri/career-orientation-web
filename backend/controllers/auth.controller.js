const { registerUser } = require("../services/auth.service");
exports.register = async (req, res) => {
  try {
    const user = await registerUser(req.body);

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
