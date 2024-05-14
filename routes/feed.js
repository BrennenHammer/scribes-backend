const express = require('express');
const router = express.Router();
const Books = require('../models/Books');
const isAuthenticated = require('../middleware/isAuthenticated')

router.get('/', (req, res) => {
    Books.find()
        .populate('author')
        .then(books => {
            res.status(200).json(books);
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: 'Internal Server Error' });
        });
});

router.post('/', isAuthenticated, (req, res) => {
    const { description, file } = req.body;
    console.log('this is body', req.body)
    const userId = req.user._id;
    const mediaType = 'photo'; // assuming everything is a photo

    const newBook = new Books({
        author: userId,            
        mediaType: mediaType,     
        mediaUrl: file,       
        caption: description      
    });

    newBook.save()
        .then(book => {
            res.status(201).json(book);
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: 'Failed to create post' });
        });
});

router.post('/:bookId/like', isAuthenticated, async (req, res) => {
    try {
        const book = await Books.findById(req.params.bookId);
        
        const userId = req.user._id;
        const userIndex = book.likes.indexOf(userId);

        if (userIndex !== -1) {
            book.likes.splice(userIndex, 1);
        } else {
            book.likes.push(userId);
        }

        await book.save();

        res.json({ likes: book.likes.length });
    } catch (error) {
        console.error("Error liking the book:", error);
        res.status(500).send("Failed to like the book");
    }
});

router.delete('/delete/:bookId', isAuthenticated, async (req, res) => {
    const bookId = req.params.bookId;
    
    try {
        await Books.findByIdAndDelete(bookId);
        res.status(200).json({ message: 'Book deleted successfully' });
    } catch (error) {
        console.error('Error deleting book:', error);
        res.status(500).send("Error deleting book");
    }
});

module.exports = router;
