import { NextFunction, Request, Response, Router } from "express";
import passport from "passport";
import bcrypt from "bcrypt";
import pool from "../db/db.js";

const router = Router();

// login route that uses passport.js with our local strategy
router.post(
  "/login",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { username, password } = req.body;

      // Fetch user from database
      const result = await pool.query(
        "SELECT * FROM users WHERE username = $1",
        [username]
      );
      const user = result.rows[0];

      // Compare passwords
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res
          .status(401)
          .json({ message: "Invalid username or password" });
      }

      // If passwords match -> login
      req.login(user, (err) => {
        if (err) return next(err);
        res.json({
          message: "Logged in successfully",
          user: { id: user.id, username: user.username, role: user.role },
        });
      });
    } catch (error) {
      next(error);
    }
  }
);

// Github login route

// router.get(
//   "/auth/github",
//   passport.authenticate("github", { scope: ["user:email"] })
// );

//github test route
router.get("/auth/github", (req, res, next) => {
  const githubAuthURL = `https://github.com/login/oauth/authorize?client_id=${
    process.env.GITHUB_CLIENT_ID
  }&redirect_uri=${encodeURIComponent(
    "http://localhost:3000/api/auth/github/callback"
  )}&scope=user:email`;

  console.log("GitHub Auth URL:", githubAuthURL);

  passport.authenticate("github", { scope: ["user:email"] })(req, res, next);
});

router.get(
  "/auth/github/callback",
  passport.authenticate("github", { failureRedirect: "/login" }),
  (req, res) => {
    res.json({
      message: "Github Auth successful",
    });
  }
);

export default router;
