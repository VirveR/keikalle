//testing, voi poistaa
const mongoose = require('mongoose');

//Schema
const testSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    number: Number
});

module.exports = mongoose.model('Test', testSchema);