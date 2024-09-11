// This file contains the routes that require authorization to access.

import express from "express";
import { authorize } from "../authStrategies/local-strategy.js";

const router = express.Router();

// Only admins have access to this route
router.get("/admin-only", authorize("admin"), (req, res) => {
  res.json({ message: "Welcome Admin" });
});

// Admins and editors have access to this route
router.get("/content-managment", authorize("admin", "editor"), (req, res) => {
  res.json({ message: "Welcome to content managment" });
});
// All roles have access to this route
router.get(
  "/user-profile",
  authorize("admin", "editor", "user"),
  (req, res) => {
    res.json({ message: "Welcome to your profile" });
  }
);

export default router;
