const { registerUser } = require("../services/auth.service");

const register = async (req, res) => {
  try {
    // GET INPUT  DATA USER by REQ.BODY
    const user = await registerUser(req.body);
    // RESPONSE DATA
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { register };
