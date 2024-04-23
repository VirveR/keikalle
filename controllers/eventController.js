//Database connection
const mongoose = require('mongoose');
require('dotenv').config();
const conString = `mongodb+srv://${process.env.DBUSERNAME}:${process.env.DBPASSWORD}@${process.env.CLUSTER}.mongodb.net/${process.env.DB}?retryWrites=true&w=majority&appName=Keikalle`

mongoose.connect(conString)
.then(() => {
    console.log('testController connected to database');
})
.catch((error) => {
    console.log(error);
});

const EventModel = require('../models/Event');

//GET home and get the events to the home page
const getHome = async (req, res) => {
    try {
        const concerts = await EventModel.find();
        let alias = "";
        if (req.session.user) {
            alias = req.session.user.alias;
        }
        res.render('index', {
            info: req.flash('info'),
            alias: alias,
            userPressesLoginButtonShowThis: true,
            events: concerts.map(event => event.toJSON())
        });
    }
    catch(error) {
        res.status(404).render('index', {
            userPressesLoginButtonShowThis: true,
            events_info: 'Tapahtumien haku epäonnistui'
        });
        console.log(error);
    }
    
};

//POST search events according to search criteria
const searchEvents = async (req, res) => {
    try {
        const artist = req.body.search_performer;
        const city = req.body.search_city;
        const place = req.body.search_place;

        const query = {};

        if (artist) { query.artists = { $in: [artist] }; }
        if (city) { query.city = city; }
        if (place) { query.place = place; }

        const events = await EventModel.find(query);

        let alias = "";
        if (req.session.user) {
            alias = req.session.user.alias;
        }
        if (events.length == 0) {
            req.flash('info', 'Hakuehdoilla ei löytynyt tapahtumia');
            res.redirect('/');
        }
        else {
            res.render('index', {
                alias: alias,
                events: events.map(event => event.toJSON())
            });
        }
    }
    catch(error) {
        res.status(404).render('index', {
            alias: alias,
            info: 'Hakuehdoilla ei löydy tapahtumia'
        });
    }
}

// GET event page
const getEvent = async (req, res) => {
    res.render('event');
}

module.exports = { getHome, searchEvents, getEvent };