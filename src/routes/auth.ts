import { NextFunction, Request, Response, Router } from "express";
import passport from "passport";

const router = Router();

// login route that uses passport.js with our local strategy

router.post("/login", (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate("local", (err: any, user: Express.User | false) => {
    if (err) return next(err);
    if (!user)
      return res.status(401).json({ message: "invalid username or password" });
    req.logIn(user, (err) => {
      if (err) return next(err);
      res.json({
        message: "Logged in succesfully",
        user: { id: user.id, username: user.username, role: user.role },
      });
    });
  })(req, res, next);
});

export default router;
