const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const jwt = require("jsonwebtoken");
const User = require('../models/User');
const Books = require('../models/Books');
const isAuthenticated = require('../middleware/isAuthenticated');

// Get all users
router.get('/', (req, res, next) => {
  User.find()
    .then((allUsers) => {
      res.json(allUsers);
    })
    .catch((err) => {
      console.log(err);
      res.json(err);
      next(err);
    });
});

router.get('/detail/:userId', async (req, res, next) => {
  const userId = mongoose.Types.ObjectId(req.params.userId);

  try {
    const userDetails = await User.aggregate([
      { $match: { _id: userId } },
      {
        $lookup: {
          from: 'subscribers',
          localField: '_id',
          foreignField: 'userId',
          as: 'subscribers'
        }
      },
      {
        $lookup: {
          from: 'subscribers',
          localField: '_id',
          foreignField: 'subscriberId',
          as: 'following'
        }
      },
      {
        $lookup: {
          from: 'books',
          localField: '_id',
          foreignField: 'author',
          as: 'posts'
        }
      },
      {
        $addFields: {
          subscribers: { $setUnion: ['$subscribers', '$subscribers'] },
          following: { $setUnion: ['$following', '$following'] },
          posts: { $setUnion: ['$posts', '$posts'] }
        }
      }
    ]);

    if (!userDetails.length) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(userDetails[0]);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
    next(err);
  }
});

// Update user
router.post("/update", isAuthenticated, (req, res, next) => {
  User.findByIdAndUpdate(
    req.user._id,
    req.body,
    { new: true }
  )
    .then((updatedUser) => {
      return updatedUser.populate('posts');
    })
    .then((populatedUser) => {
      const { _id, email, name, posts, location, image } = populatedUser;
      const user = { _id, email, name, posts, location, image };
      const authToken = jwt.sign(user, process.env.SECRET, {
        algorithm: "HS256",
        expiresIn: "6h",
      });

      res.json({ user, authToken });
    })
    .catch((err) => {
      console.log(err);
      res.json(err);
      next(err);
    });
});

module.exports = router;
