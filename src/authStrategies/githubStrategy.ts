import passport from "passport";
import { Strategy as GithubStrategy } from "passport-github2";
import pool from "../db/db.js";

if (!process.env.GITHUB_CLIENT_ID || !process.env.GITHUB_CLIENT_SECRET) {
  throw new Error(
    "GitHub OAuth credentials are not set in the environment variables."
  );
}

passport.use(
  new GithubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: "http://localhost:3000/api/auth/github/callback",
    },
    async (
      accessToken: string,
      refreshToken: string,
      profile: any,
      done: any
    ) => {
      try {
        // First, check if the user already exists
        const existingUser = await pool.query(
          "SELECT * FROM users WHERE username = $1",
          [profile.username]
        );

        if (existingUser.rows.length > 0) {
          return done(null, existingUser.rows[0]);
        }

        // User doesn't exist, insert a new user
        const newUser = await pool.query(
          "INSERT INTO users (username, role, auth_type) VALUES ($1, $2, $3) RETURNING *",
          [profile.username, "user", "github"]
        );
        return done(null, newUser.rows[0]);
      } catch (error) {
        console.error("Error in GitHub strategy:", error);
        return done(error);
      }
    }
  )
);

// passport.use(
//   new GitHubStrategy(
//     {
//       clientID: process.env.GITHUB_CLIENT_ID,
//       clientSecret: process.env.GITHUB_CLIENT_SECRET,
//       callbackURL: "http://localhost:3000/api/auth/github/callback",
//     },
//     async (
//       accessToken: string,
//       refreshToken: string,
//       profile: any,
//       done: any
//     ) => {
//       try {
//         // Kollar om användaren redan finns i databasen
//         const existingUser = await pool.query(
//           "SELECT * FROM users WHERE username = $1",
//           [profile.username]
//         );

//         if (existingUser.rows.length > 0) {
//           // Användaren finns redan, returnera användaren
//           return done(null, existingUser.rows[0]);
//         } else {
//           // Användaren finns inte, skapa en ny användare
//           const newUser = await pool.query(
//             "INSERT INTO users (username, role, auth_type) VALUES ($1, $2, $3) RETURNING *",
//             [profile.username, "user", "github"]
//           );

//           return done(null, newUser.rows[0]);
//         }
//       } catch (error) {
//         console.error("Error in GitHub strategy:", error);
//         return done(error);
//       }
//     }
//   )
// );

// Serialization and deserialization for sessions
passport.serializeUser((user: any, done: any) => {
  done(null, user.id);
});

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

export default passport;
