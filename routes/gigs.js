const express = require('express');
const Test = require('../models/Test');
const router = express.Router();

//GET home
router.get('/', (req, res) => {
    res.render('index');
});

module.exports = router;