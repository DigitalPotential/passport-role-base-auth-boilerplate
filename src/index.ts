import express from "express";
import session from "express-session";
import passport from "passport";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import "./authStrategies/local-strategy.js";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.js";
import authorizedRoutes from "./routes/authorizedRoutes.js";
import registerUser from "./routes/registerUser.js";

dotenv.config();

const app = express();

app.use(helmet());
app.use(express.json());
app.use(cookieParser());

const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) throw new Error("SESSION_SECRET must be set");

app.use(
  session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production", // Set to true if using HTTPS
      httpOnly: true,
      maxAge: 60 * 60 * 1000, // 1 hour
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

// Import routes
app.use("/api", authRoutes);
app.use("/api", authorizedRoutes);
app.use("/api", registerUser);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
