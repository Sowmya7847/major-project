const express = require('express');
const router = express.Router();
const {
    registerUser,
    loginUser,
    getMe,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);

// Google Auth
const passport = require('passport');
const generateToken = require('../utils/generateToken');

router.get('/google', async (req, res, next) => {
    if (!process.env.GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID === 'PLACEHOLDER_CLIENT_ID') {
        const User = require('../models/User');
        const generateToken = require('../utils/generateToken');
        let user = await User.findOne({ email: 'google_user@demo.com' });
        if (!user) {
            user = await User.create({ name: 'Google Demo User', email: 'google_user@demo.com', password: 'oauth_dummy_password', role: 'user', department: 'Cloud Ops', securityScore: 100 });
        }
        const token = generateToken(user._id);
        return res.redirect(`http://localhost:5173/login?token=${token}`);
    }
    passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
});

router.get('/google/callback',
    passport.authenticate('google', { failureRedirect: '/login', session: false }),
    (req, res) => {
        const generateToken = require('../utils/generateToken');
        const token = generateToken(req.user._id);
        res.redirect(`http://localhost:5173/login?token=${token}`);
    }
);

// Microsoft Auth
router.get('/microsoft', async (req, res, next) => {
    if (!process.env.MICROSOFT_CLIENT_ID || process.env.MICROSOFT_CLIENT_ID === 'PLACEHOLDER_CLIENT_ID') {
        const User = require('../models/User');
        const generateToken = require('../utils/generateToken');
        let user = await User.findOne({ email: 'microsoft_user@demo.com' });
        if (!user) {
            user = await User.create({ name: 'Microsoft Demo User', email: 'microsoft_user@demo.com', password: 'oauth_dummy_password', role: 'user', department: 'Enterprise Security', securityScore: 99 });
        }
        const token = generateToken(user._id);
        return res.redirect(`http://localhost:5173/login?token=${token}`);
    }
    passport.authenticate('microsoft')(req, res, next);
});

router.get('/microsoft/callback',
    passport.authenticate('microsoft', { failureRedirect: '/login', session: false }),
    (req, res) => {
        const generateToken = require('../utils/generateToken');
        const token = generateToken(req.user._id);
        res.redirect(`http://localhost:5173/login?token=${token}`);
    }
);

module.exports = router;
