//user testausta
const mongoose = require('mongoose');

//Schema
const userSchema = new mongoose.Schema({
    alias: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    firstName: String,
    lastName: String,
    city: String,
    favoriteGenres: Array
});

module.exports = mongoose.model('User', userSchema);