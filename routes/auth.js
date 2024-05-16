// authRoutes.js

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const isAuthenticated = require('../middleware/isAuthenticated');

const saltRounds = 10;

// Signup route
router.post('/signup', (req, res, next) => {
  const { email, password, username } = req.body;

  if (email === '' || password === '' || username === '') {
    res.status(400).json({ message: 'Provide email, password, and name' });
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (!emailRegex.test(email)) {
    res.status(400).json({ message: 'Provide a valid email address.' });
    return;
  }

  User.findOne({ email })
    .then((foundUser) => {
      if (foundUser) {
        res.status(400).json({ message: 'User already exists.' });
        return;
      }
      const salt = bcrypt.genSaltSync(saltRounds);
      const hashedPassword = bcrypt.hashSync(password, salt);
      User.create({ email, password: hashedPassword, username })
        .then((createdUser) => {
          const { email, name, _id, profilePicture } = createdUser;
          const payload = { _id, email, name, profilePicture };
          const authToken = jwt.sign(payload, process.env.SECRET, {
            algorithm: 'HS256',
            expiresIn: '6h',
          });
          res.status(200).json({ authToken });
        })
        .catch((err) => {
          console.log(err);
          res.status(500).json({ message: 'Internal Server Error' });
        });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ message: 'Internal Server Error' });
    });
});

// Login route
router.post('/login', (req, res, next) => {
  const { email, password } = req.body;
  if (email === '' || password === '') {
    res.status(400).json({ message: 'Provide email and password.' });
    return;
  }
  User.findOne({ email })
    .populate('subscribers following posts')
    .then((foundUser) => {
      if (!foundUser) {
        res.status(401).json({ message: 'User not found.' });
        return;
      }
      const passwordCorrect = bcrypt.compareSync(password, foundUser.password);
      if (passwordCorrect) {
        const { _id, email, username, profilePicture, bio, subscribers, following, posts } = foundUser;
        const payload = { _id, email, username, profilePicture, bio, subscribers, following, posts };
        const authToken = jwt.sign(payload, process.env.SECRET, {
          algorithm: 'HS256',
          expiresIn: '6h',
        });
        res.status(200).json({ authToken });
      } else {
        res.status(401).json({ message: 'Unable to authenticate the user' });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ message: 'Internal Server Error' });
    });
});

// Token verification route
router.get('/verify', isAuthenticated, (req, res, next) => {
  console.log('req.user', req.user);
  res.status(200).json(req.user);
});

// Token refresh route
router.post('/refresh-token', async (req, res) => {
  const refreshToken = req.body.refreshToken;
  if (!refreshToken) {
    return res.status(400).json({ message: 'Refresh token not provided' });
  }
  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const accessToken = jwt.sign({ userId: decoded.userId }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
    res.json({ accessToken });
  } catch (error) {
    console.error('Error refreshing token:', error);
    return res.status(401).json({ message: 'Invalid refresh token' });
  }
});

module.exports = router;
