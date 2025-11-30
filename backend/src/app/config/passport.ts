/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */
import bcrypt from "bcryptjs";
import passport from "passport";
import {
  Strategy as GoogleStrategy,
  type Profile,
  type VerifyCallback,
} from "passport-google-oauth20";
import { Strategy as LocalStrategy } from "passport-local";
import { IProvider, Role, type IUser } from "../modules/user/user.interface.js";
import User from "../modules/user/user.model.js";
import envVars from "./env.js";

passport.use(
  new LocalStrategy(
    { usernameField: "email", passwordField: "password" },
    async (email: string, password: string, done: VerifyCallback) => {
      try {
        const user = await User.findOne({ email }).select("+password");
        if (!user) {
          return done(null, false, { message: "Wrong credentials" });
        }
        const isMatched = bcrypt.compare(password, user.password as string);
        if (!isMatched) {
          return done(null, false, { message: "Wrong credentials" });
        }

        return done(null, user);
      } catch (error) {
        console.log("Custom strategy error", error);
        return done(error);
      }
    }
  )
);

passport.use(
  new GoogleStrategy(
    {
      clientID: envVars.GOOGLE_CLIENT_ID,
      clientSecret: envVars.GOOGLE_CLIENT_SECRET,
      callbackURL: envVars.GOOGLE_CALLBACK_URL,
    },
    async (
      accessToken: string,
      refreshToken: string,
      profile: Profile,
      done: VerifyCallback
    ) => {
      try {
        const email = profile.emails?.[0]?.value;
        if (!email) {
          return done(null, false, { message: "No email found" });
        }

        let user = await User.findOne({ email });

        if (!user) {
          const picture = profile.photos?.[0]?.value;

          const userData: Partial<IUser> = {
            email,
            name: profile.displayName,
            role: Role.USER,
            isVerified: true,
            auths: [{ provider: IProvider.GOOGLE, providerId: profile.id }],
          };

          if (picture) {
            userData.picture = picture;
          }

          user = await User.create(userData);
        }

        return done(null, user, { message: "Registration successful" });
      } catch (error) {
        console.log("Google strategy error", error);
        return done(error);
      }
    }
  )
);

passport.serializeUser((user: any, done: (err: any, id?: unknown) => void) => {
  done(null, user._id);
});

passport.deserializeUser(async (id: string, done: any) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});
