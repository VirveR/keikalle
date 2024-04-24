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
const UserModel = require('../models/User');

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
        res.status(200).render('index', {
            pagetitle: 'Etusivu',
            info: req.flash('info'),
            alias: alias,
            userPressesLoginButtonShowThis: true,
            //events: concerts.map(event => event.toJSON()),
            showcase: events
        });
    }
    catch(error) {
        res.status(404).render('index', {
            pagetitle: 'Etusivu',
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
            res.status(200).render('index', {
                pagetitle: 'Etusivu',
                alias: alias,
                events: events,
                showcase: events.slice(0, 4)
            });
        }
    }
    catch(error) {
        res.status(404).render('index', {
            pagetitle: 'Etusivu',
            alias: alias,
            info: 'Tapahtumien hakeminen epäonnistui'
        });
    }
}

// GET event page
const getEvent = async (req, res) => {
    try {
        const eventId = req.params.id;
        const concert = await EventModel.findById(eventId);
        if (concert) {
            const formattedDate = format(concert.date, 'dd.MM.yyy', 'fi');
            const eventWithFormattedDate = {
                ...concert.toJSON(),
                date: formattedDate
            };
            res.status(200).render('event', {
                alias: req.session.user.alias,
                concert: eventWithFormattedDate
            });
        }
        else {
            res.status(404).render('event', {
                info: req.flash('info')
            });
        }
    }

    catch(error) {
        res.status(404).render('index', {
            pagetitle: 'Etusivu',
            info: 'Tapahtuman haku epäonnistui'
        });
        console.log(error);
    }

    //res.render('event');
}

// POST user to event
const registerToEvent = async (req, res) => {
    var userId;
    var eventId = req.body.eventId;
    if (req.session.user) {
        userId = req.session.user.userId;
    }

    try{
        await EventModel.findOneAndUpdate(
            {_id: eventId },
            {$push: {usersRegistered: userId}}
        );
        res.json({added : true});
    }
    catch(error){
        console.log(error);
        res.json({added : false});
    }

}

// POST Friend Search via Event Page
const searchFriends = async (req, res) => {
    try {
        const eventId = req.params.id;
        const concert = await EventModel.findById(eventId);
        const thisYear = new Date().getFullYear();
        if (concert) {
            let minYear = thisYear;
            if (req.body.min_friend_age) { minYear = thisYear - Number(req.body.min_friend_age); }
            let maxYear = thisYear - 120;
            if (req.body.max_friend_age) { maxYear = thisYear - Number(req.body.max_friend_age); }
            const gender = req.body.friend_gender;
            const city = req.body.friend_city;
            const users = concert.usersRegistered.filter(id => id !== req.session.user.userId);

            const query = {};
            query._id = { $in: users };
            query.birthYear = { $lte: minYear, $gte: maxYear };
            if (gender && gender !== 'ei valittu') { query.gender = gender; }
            if (city) { query.city = city; }

            const f = await UserModel.find(query);
            const friends = f.map(friend => {
                const age = thisYear - Number(friend.birthYear);
                return {...friend.toObject(), age};
            });
            if (friends.length < 1) {
                res.render('event', {
                    pagetitle: 'Tapahtuma',
                    alias: req.session.user.alias,
                    info: 'Hakuehdoilla ei löydy ketään',
                    concert: concert.toJSON()
                });
            }
            else {
                const formattedDate = format(concert.date, 'dd.MM.yyy', 'fi');
                const eventWithFormattedDate = {
                    ...concert.toJSON(),
                    date: formattedDate
                };
                res.status(200).render('event', {
                    pagetitle: 'Tapahtuma',
                    alias: req.session.user.alias,
                    concert: eventWithFormattedDate,
                    friends: friends
                });
            }
        }
        else {
            req.flash('info', 'Jotain meni pieleen');
            res.status(404).redirect('/');
        }
    }
    catch(error) {
        req.flash('info', 'Jotain meni pieleen')
        res.status(404).redirect('/');
        console.log(error);
    }
}

module.exports = { getHome, searchEvents, getEvent, registerToEvent, searchFriends }; 