const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const bookSchema = new Schema({
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    mediaType: {
        type: String,
        enum: ['photo', 'video'],
        required: true
    },
    mediaUrl: {
        type: String,
        required: true
    },
    caption: String,
    likes: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    comments: [{
        type: Schema.Types.ObjectId,
        ref: 'Comment'
    }],
    createdDate: {
        type: Date,
        default: Date.now
    },
    updatedDate: Date,
    location: String,
    tags: [String]
});bookSchema.methods.like = function(userId) {

    if (!this.likes.includes(userId)) {
        this.likes.push(userId);
    }
};
bookSchema.methods.unlike = function(userId) {
    const index = this.likes.indexOf(userId);
    if (index !== -1) {
        this.likes.splice(index, 1);
    }
};

const Book = mongoose.model('Book', bookSchema);

module.exports = Book;
