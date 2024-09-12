import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import pool from "../db/db.js";
import bcrypt from "bcrypt";
import { Response, Request, NextFunction } from "express";

interface User {
  id: number;
  username: string;
  password: string;
  role: string;
}

declare global {
  namespace Express {
    interface User {
      id: number;
      username: string;
      role: string;
    }
  }
}
// Här definerar vi vår strategy för passport, I detta fall använder vi LocalStrategy.
// Vi kan använda oss av flera strategys samtidigt, som tex Oauth med google, facebook, discord osv.
passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const result = await pool.query(
        "SELECT * FROM users WHERE username = $1",
        [username]
      );
      const user = result.rows[0];

      if (!user) {
        return done(null, false, { message: "Incorrect username or password" });
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return done(null, false, { message: "Incorrect username or password" });
      }

      return done(null, {
        id: user.id,
        username: user.username,
        role: user.role,
      });
    } catch (error) {
      return done(error);
    }
  })
);

// serializeUser används för att spara vår user id i vår session då vi i detta fall
// kombinerar express-sessions med passport.js
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

//deserializeUser använder vi för att hämta vårt user object från vår sparade session.
passport.deserializeUser(async (id: number, done) => {
  try {
    const result = await pool.query(
      "SELECT id, username, role FROM users WHERE id = $1",
      [id]
    );
    const user = result.rows[0];
    console.log("deserilize user", user);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export function authorize(...allowed: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    console.log("user from authorize:", req.user);
    console.log("allowed:", allowed);
    const user = req.user as User | undefined;
    if (req.isAuthenticated() && user && allowed.includes(user.role)) {
      next();
    } else {
      res.status(403).json({ message: "unauthorized" });
    }
  };
}

export default passport;
