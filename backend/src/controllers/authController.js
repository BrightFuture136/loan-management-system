const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../models");
const { sendVerificationKey } = require("../config/emailService");

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000); // 6-digit OTP
};

const register = async (req, res) => {
  const { name, email, password, gender, date_of_birth } = req.body;
  try {
    const existingUser = await db.User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await db.User.create({
      name,
      email,
      gender: gender || "Unknown",
      date_of_birth: date_of_birth ? new Date(date_of_birth) : null,
      status: "INACTIVE",
      role: "BORROWER",
    });

    await db.UserCredential.create({
      pass_hash: hashedPassword,
      user_id: user.id,
    });

    // Generate and store OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await db.VerificationKey.create({
      key: otp,
      user_id: user.id,
      expires_at: expiresAt,
    });

    // Send OTP via email
    await sendVerificationKey(email, otp, (info) => {
      console.log("Email sent:", info.response);
    });

    res
      .status(201)
      .json({ message: "User registered. Please verify your email.", email });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await db.User.findOne({
      where: { email },
      include: [{ model: db.UserCredential }],
    });
    if (!user || !user.UserCredential) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (user.status !== "ACTIVE") {
      return res
        .status(403)
        .json({ message: "Please verify your email first" });
    }

    const isMatch = await bcrypt.compare(
      password,
      user.UserCredential.pass_hash
    );
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const verifyEmail = async (req, res) => {
  const { email, code } = req.body;
  try {
    const user = await db.User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const verificationKey = await db.VerificationKey.findOne({
      where: {
        user_id: user.id,
        key: parseInt(code),
      },
    });

    if (!verificationKey) {
      return res
        .status(400)
        .json({ message: "Invalid or expired verification code" });
    }

    if (new Date() > verificationKey.expires_at) {
      return res.status(400).json({ message: "Verification code has expired" });
    }

    // Mark user as ACTIVE
    await db.User.update({ status: "ACTIVE" }, { where: { id: user.id } });

    // Delete used verification key
    await db.VerificationKey.destroy({ where: { user_id: user.id } });

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    res.json({
      success: true,
      data: {
        access_token: token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          status: "ACTIVE",
        },
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { register, login, verifyEmail };
