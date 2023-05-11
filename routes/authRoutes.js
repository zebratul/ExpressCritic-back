const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { RevyUser } = require('../models');
const AuthHelper = require('../utils/authHelper');
const GoogleAuth = require('../utils/googleAuth');
const GitHubAuth = require('../utils/GitHubAuth');
require('dotenv').config();

const googleAuth = new GoogleAuth(process.env.GOOGLE_CLIENT_ID);

router.post('/auth/logout', (req, res) => {
    res.clearCookie('jwt');
    res.status(200).json({ message: 'Logged out successfully' });
});

router.get('/auth/check', async (req, res) => {
    try {
        const token = req.signedCookies.jwt;
        if (!token) {
            return res.status(401).json({ error: 'Not authenticated' });
        }

        const payload = jwt.verify(token, process.env.JWT_SECRET);
        const user = await RevyUser.findByPk(payload.id, {
            attributes: ['id', 'username', 'email', 'picture'],
        });

        if (!user) {
            return res.status(401).json({ error: 'Not authenticated' });
        }

        res.status(200).json({ user });
       } catch (error) {
          console.error('Error checking authentication status:', error);
          res.status(500).json({ error: 'Error checking authentication status' });
       }
});

router.post('/auth/google', async (req, res) => {
    try {
        const { tokenId } = req.body;
        const { user } = await googleAuth.authenticate(tokenId);
        const token = AuthHelper.generateToken(user);
        console.log('token generated:', token);

        res.cookie('jwt', token, {
            httpOnly: true,
            secure: true,
            signed: true,
            maxAge: 24 * 60 * 60 * 1000,
            sameSite: None,
        });

        res.status(200).json({ user });
      } catch (error) {
          console.error('Google Sign-In error:', error);
          res.status(500).json({ error: 'Google Sign-In failed' });
      }
  });

router.post('/auth/github', async (req, res) => {
    try {
        const { code } = req.body;
        console.log("received github auth request");
        const { user: githubUser } = await GitHubAuth.authenticate(code);
        const user = await AuthHelper.findOrCreateUser(githubUser);

        const token = AuthHelper.generateToken(user);
        console.log('token generated:', token);

        res.cookie('jwt', token, {
            httpOnly: true,
            secure: true,
            signed: true,
            maxAge: 24 * 60 * 60 * 1000,
            sameSite: None,
        });

        res.status(200).json({ user });

      } catch (error) {
          console.error('GitHub Sign-In error:', error);
          res.status(500).json({ error: 'GitHub Sign-In failed' });
      }
});

module.exports = router;
