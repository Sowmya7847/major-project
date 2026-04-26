const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const MicrosoftStrategy = require('passport-microsoft').Strategy;
const User = require('../models/User');

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});

// Google Strategy
if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    console.warn("⚠️  Google OAuth credentials missing. Google Login will not work.");
}

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID || "PLACEHOLDER_CLIENT_ID",
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || "PLACEHOLDER_CLIENT_SECRET",
    callbackURL: "/api/auth/google/callback"
},
    async (accessToken, refreshToken, profile, done) => {
        try {
            // Check if user exists
            let user = await User.findOne({ email: profile.emails[0].value });

            if (user) {
                return done(null, user);
            }

            // Create new user
            user = await User.create({
                name: profile.displayName,
                email: profile.emails[0].value,
                password: Date.now() + 'google_login', // Dummy password
                role: 'user',
                provider: 'google'
            });

            done(null, user);
        } catch (err) {
            done(err, null);
        }
    }));

// Microsoft Strategy
if (!process.env.MICROSOFT_CLIENT_ID || !process.env.MICROSOFT_CLIENT_SECRET) {
    console.warn("⚠️  Microsoft OAuth credentials missing. Microsoft Login will not work.");
}

passport.use(new MicrosoftStrategy({
    clientID: process.env.MICROSOFT_CLIENT_ID || "PLACEHOLDER_CLIENT_ID",
    clientSecret: process.env.MICROSOFT_CLIENT_SECRET || "PLACEHOLDER_CLIENT_SECRET",
    callbackURL: "/api/auth/microsoft/callback",
    scope: ['user.read']
},
    async (accessToken, refreshToken, profile, done) => {
        try {
            let user = await User.findOne({ email: profile.emails[0].value });

            if (user) {
                return done(null, user);
            }

            user = await User.create({
                name: profile.displayName,
                email: profile.emails[0].value,
                password: Date.now() + 'microsoft_login',
                role: 'user',
                provider: 'microsoft'
            });

            done(null, user);
        } catch (err) {
            done(err, null);
        }
    }));

module.exports = passport;
