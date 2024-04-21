const mongoose = require('mongoose');

//Schema
const concertSchema = new mongoose.Schema({
    image: String,
    artists: Array,
    date: Date,
    time: Date,
    city: String,
    address: String,
    place: String
});

module.exports = mongoose.model('Concert', concertSchema);