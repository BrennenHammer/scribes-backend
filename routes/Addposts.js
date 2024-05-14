const express = require('express');
const router = express.Router();

const isAuthenticated = require('../middleware/isAuthenticated')

const Books = require('../models/Books')
const User = require('../models/User')

router.post('/create', isAuthenticated, (req, res) => {
   

});


module.exports = router;
