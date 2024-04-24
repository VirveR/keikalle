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

//for formatting dates
const { format } = require('date-fns');

//GET home and get the events to the home page
const getHome = async (req, res) => {
    try {
        const today = new Date();
        const e = await EventModel.find({ date: { $gte: today } }).sort({date: 1}).limit(4);
        const events = e.map(event => {
            const formattedDate = format(event.date, 'dd.MM.yyy', 'fi');
            return {...event.toObject(), date: formattedDate};
        });
        let alias = "";
        if (req.session.user) {
            alias = req.session.user.alias;
        }
        res.render('index', {
            info: req.flash('info'),
            alias: alias,
            userPressesLoginButtonShowThis: true,
            //events: concerts.map(event => event.toJSON()),
            showcase: events
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
    let alias = "";
    if (req.session.user) {
        alias = req.session.user.alias;
    }
    try {
        const artist = req.body.search_performer;
        const city = req.body.search_city;
        const place = req.body.search_place;
        const today = new Date();
        //console.log(`artist: ${artist}, city: ${city}, place: ${place}`);

        const query = {};

        if (artist) { query.artists = { $in: [artist] }; }
        if (city) { query.city = city; }
        if (place) { query.place = place; }
        query.date = { $gte: today };

        const e = await EventModel.find(query).sort({date: 1});
        const events = e.map(event => {
            const formattedDate = format(event.date, 'dd.MM.yyy', 'fi');
            return {...event.toObject(), date: formattedDate};
        });

        if (events.length == 0) {
            req.flash('info', 'Hakuehdoilla ei löytynyt tapahtumia');
            res.redirect('/');
        }
        else {
            res.render('index', {
                alias: alias,
                events: events,
                showcase: events.slice(0, 4)
            });
        }
    }
    catch(error) {
        res.status(404).render('index', {
            alias: alias,
            info: 'Tapahtumien hakeminen epäonnistui'
        });
    }
}

// GET event page
const getEvent = async (req, res) => {
    res.render('event');
}

module.exports = { getHome, searchEvents, getEvent };