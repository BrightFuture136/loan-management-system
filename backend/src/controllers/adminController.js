const db = require("../models");

const changeUserRole = async (req, res) => {
  const { user_id, role } = req.body;
  try {
    const user = await db.User.findByPk(user_id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (!["MANAGER", "CASHER", "BORROWER"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }
    await user.update({ role });
    res.json({ message: `User role changed to ${role}` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  changeUserRole,
};
