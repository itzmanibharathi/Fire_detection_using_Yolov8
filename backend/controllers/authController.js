const User = require("../models/User");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || "default_secret", {
    expiresIn: "30d",
  });
};

const registerUser = async (req, res) => {
  try {
    const { email, password, fullName, phone, organization } = req.body;

    if (!email || !password || !fullName || !phone || !organization) {
      return res.status(400).json({ error: "Please provide all required fields" });
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ error: "User already exists" });
    }

    // Generate a unique 12-character alphanumeric access code
    const uniqueAccessCode = crypto.randomBytes(6).toString("hex").toUpperCase();

    const user = await User.create({
      email,
      password,
      fullName,
      phone,
      organization,
      uniqueAccessCode,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        organization: user.organization,
        uniqueAccessCode: user.uniqueAccessCode,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ error: "Invalid user data" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error during registration" });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        organization: user.organization,
        uniqueAccessCode: user.uniqueAccessCode,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ error: "Invalid email or password" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error during login" });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      res.json({
        _id: user._id,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        organization: user.organization,
        uniqueAccessCode: user.uniqueAccessCode,
      });
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ error: "Server error fetching profile" });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.fullName = req.body.fullName || user.fullName;
      user.phone = req.body.phone || user.phone;
      user.organization = req.body.organization || user.organization;

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        email: updatedUser.email,
        fullName: updatedUser.fullName,
        phone: updatedUser.phone,
        organization: updatedUser.organization,
        uniqueAccessCode: updatedUser.uniqueAccessCode,
      });
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ error: "Server error updating profile" });
  }
};

const updateUserPassword = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const { currentPassword, newPassword } = req.body;

    if (user && (await user.matchPassword(currentPassword))) {
      user.password = newPassword;
      await user.save();
      res.json({ message: "Password updated successfully" });
    } else {
      res.status(401).json({ error: "Incorrect current password" });
    }
  } catch (error) {
    res.status(500).json({ error: "Server error updating password" });
  }
};

module.exports = { registerUser, loginUser, getUserProfile, updateUserProfile, updateUserPassword };
