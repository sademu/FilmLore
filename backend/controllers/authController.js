import { sql } from "../config/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// User Registration
export const registerUser = async (req, res) => {
  try {
    const { fullName, username, email, password, dateOfBirth, profileImage } = req.body;

    // Validate required fields
    if (!username || !email || !password || !fullName) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields"
      });
    }

    // Check if user already exists
    const existingUser = await sql`
      SELECT * FROM appuser 
      WHERE (username = ${username} )
      
    `;

    if (existingUser.length > 0) {  
      return res.status(400).json({
        success: false,
        message: "Username  already exists"
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user
    const newUser = await sql`
      INSERT INTO systemuser (fullname, username, email, password, dateofbirth, profilepicture, role)
      VALUES (${fullName}, ${username}, ${email}, ${hashedPassword}, ${dateOfBirth || null}, ${profileImage || null}, 'user')
      RETURNING  username, email, fullname, role
    `;

     await sql`
     INSERT INTO appuser (username)
        VALUES (${username})
    `;
       

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: newUser[0]
    });

  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// User Login
export const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide username and password"
      });
    }

    // Find user
    const user = await sql`
      SELECT * FROM systemuser 
      WHERE username = ${username} AND role = 'user'
    `;

    if (user.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user[0].password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
      
        username: user[0].username,
        role: user[0].role 
      },
      process.env.TOKEN_SECRET || "your-secret-key",
      { expiresIn: "7d" }
    );

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user[0];

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: userWithoutPassword
    });

  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Admin Login
export const loginAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide username and password"
      });
    }

    // Find admin user
    const admin = await sql`
      SELECT * FROM users 
      WHERE username = ${username} AND role = 'admin'
    `;

    if (admin.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid admin credentials"
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, admin[0].password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid admin credentials"
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: admin[0].userid, 
        username: admin[0].username,
        role: admin[0].role 
      },
      process.env.TOKEN_SECRET || "your-secret-key",
      { expiresIn: "7d" }
    );

    // Remove password from response
    const { password: _, ...adminWithoutPassword } = admin[0];

    return res.status(200).json({
      success: true,
      message: "Admin login successful",
      token,
      user: adminWithoutPassword
    });

  } catch (error) {
    console.error("Admin login error:", error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get current user
export const getCurrentUser = async (req, res) => {
  try {
    const userId = req.user.userId; // From auth middleware

    const user = await sql`
      SELECT userid, username, email, fullname, role, profileimage, dateofbirth
      FROM users 
      WHERE userid = ${userId}
    `;

    if (user.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    return res.status(200).json({
      success: true,
      user: user[0]
    });

  } catch (error) {
    console.error("Get user error:", error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
