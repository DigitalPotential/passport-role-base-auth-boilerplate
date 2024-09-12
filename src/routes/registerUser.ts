import { Router } from "express";
import pool from "../db/db.js";
import bcrypt from "bcrypt";

const router = Router();

// registers user with username password and role for authorization
router.post("/register", async (req, res) => {
  const { username, password, role } = req.body;
  try {
    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const query =
      "INSERT INTO users (username, password, role) VALUES ($1, $2, $3) RETURNING id, username, role";
    const values = [username, hashedPassword, role];
    const result = await pool.query(query, values);

    res.status(201).json({
      message: "User registered successfully",
      user: result.rows[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }

  res.send("Register user");
});

export default router;
