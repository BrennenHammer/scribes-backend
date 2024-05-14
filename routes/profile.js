const express = require('express');
const router = express.Router();
const Books = require('../models/Books'); // Changed from 'Post' to 'Books'
const isAuthenticated = require('../middleware/isAuthenticated');

router.get('/books', isAuthenticated, (req, res) => {
  const userId = req.query.userId;

  if (userId) {
    Books.find({ author: userId }) // Changed from 'Post' to 'Books'
        .populate('author', 'name')
        .then(books => res.json(books))
        .catch(error => res.status(500).send(error));
  } else {
    res.status(400).json({ message: 'UserId is required.' });
  }
});


router.put('/like/:bookId', isAuthenticated, (req, res) => {
    const bookId = req.params.bookId;
    const userId = req.user._id;

    Books.findById(bookId) // Changed from 'Post' to 'Books'
        .then(book => {
            if (!book.likes.includes(userId)) {
                book.likes.push(userId);
                return book.save();
            } else {
                return res.status(400).json({ message: 'Already liked.' });
            }
        })
        .then(updatedBook => res.json(updatedBook))
        .catch(error => res.status(500).send(error));
});

module.exports = router;
