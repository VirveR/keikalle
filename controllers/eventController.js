// Database
const mongoose = require('mongoose');
require('dotenv').config();
const conString = `mongodb+srv://${process.env.DBUSERNAME}:${process.env.DBPASSWORD}@${process.env.CLUSTER}.mongodb.net/${process.env.DB}?retryWrites=true&w=majority&appName=Keikalle`

mongoose.connect(conString)
.then(() => {
    console.log('eventController connected to database');
})
.catch((error) => {
    console.log(error);
});

const EventModel = require('../models/Event');
const UserModel = require('../models/User'); //used in Event Page friend search

//for formatting dates
const { format } = require('date-fns');
const { id } = require('date-fns/locale');

/* ROUTES
    - GET / (Get Home Page with Events)
    - POST / (Home Page with Event Search results)
    - POST /registerToEvent (Register user to event)
    - POST /unRegisterFromEvent (Remove user from event)
    - GET /event/:id (Get Event Page by event ID from db)
    - POST /event/:id (Event Page with Friend Search results)
*/

// GET / (Get Home Page with Events)
const getHome = async (req, res) => {
    try {
        const today = new Date();
        const e = await EventModel.find({ date: { $gte: today } }).sort({date: 1}).limit(4);
        const events = e.map(event => {
            const formattedDate = format(event.date, 'dd.MM.yyy', 'fi');
            return {...event.toObject(), date: formattedDate};
        });
        let userId = "";
        let alias = "";
        let currentPage = "";
        if (req.session.user) {
            alias = req.session.user.alias;
            userId = req.session.user.userId;
        }
        res.status(200).render('index', {
            pagetitle: 'Etusivu',
            info: req.flash('info'),
            userId: userId,
            alias: alias,
            userPressesLoginButtonShowThis: true,
            //events: concerts.map(event => event.toJSON()),
            showcase: events,
            currentPage: currentPage
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

// POST / (Home Page with Event Search results)
const searchEvents = async (req, res) => {
    let userId = "";
    let alias = "";
    if (req.session.user) {
        alias = req.session.user.alias;
        userId = req.session.user.userId;
    }
    try {
        const artist = req.body.search_performer;
        const city = req.body.search_city;
        const place = req.body.search_place;
        const today = new Date();

        const query = {};

        if (artist) { query.artists = { $elemMatch: { $regex: new RegExp(artist, 'i') }}; }
        if (city) { query.city = { $regex: city, $options: 'i' }; }
        if (place) { query.place = { $regex: place, $options: 'i' }; }
        query.date = { $gte: today };

        //Showcase events
        const se = await EventModel.find({date: {$gte: today}}).sort({date: 1});
        const showCaseEvents = se.map(event => {
            const formattedDate = format(event.date, 'dd.MM.yyyy', 'fi');

            return {...event.toObject(), date: formattedDate}
        });

        //Searched events
        const e = await EventModel.find(query).sort({date: 1});
        const events = e.map(event => {
            const formattedDate = format(event.date, 'dd.MM.yyyy', 'fi');
            
            if (req.session.user) {
                userLoggedIn = true;
                userRegisteredToEvent = event.usersRegistered.includes(userId);
            }
            else {
                userLoggedIn = false;
                userRegisteredToEvent = false;
            }
            return {...event.toObject(), date: formattedDate, userRegisteredToEvent: userRegisteredToEvent, userLoggedIn: userLoggedIn};
        });

        if (events.length == 0) {
            req.flash('info', 'Hakuehdoilla ei löytynyt tapahtumia');
            res.redirect('/');
        }
        else {
            res.status(200).render('index', {
                pagetitle: 'Etusivu',
                userId: userId,
                alias: alias,
                events: events,
                showcase: showCaseEvents.slice(0, 4),
                anchor: '#event_search_results'
            });
        }
    }
    catch(error) {
        res.status(404).render('index', {
            pagetitle: 'Etusivu',
            userId: userId,
            alias: alias,
            info: 'Tapahtumien hakeminen epäonnistui'
        });
    }
}

// POST /registerToEvent (Register user to event)
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

// POST /unRegisterFromEvent (Remove user from event)
const unRegisterFromEvent = async (req, res) => {
    var userId;
    var eventId = req.body.eventId;
    if (req.session.user) {
        userId = req.session.user.userId;
    }

    try{
        await EventModel.findOneAndUpdate(
            {_id: eventId },
            {$pull: {usersRegistered: userId}}
        );
        res.json({removed : true});
    }
    catch(error){
        console.log(error);
        res.json({removed : false});
    }
}

// GET /event/:id (Get Event Page by event ID from db)
const getEvent = async (req, res) => {
    let alias = "";
    let currentPage = "";
    let userId = "";
    if (req.session.user) {
        alias = req.session.user.alias;
        userId = req.session.user.userId;
    }
    try {
        const eventId = req.params.id;
        const concert = await EventModel.findById(eventId);
        if (concert) {
            const userRegisteredToEvent = concert.usersRegistered.includes(userId);
            const formattedDate = format(concert.date, 'dd.MM.yyy', 'fi');
            const eventWithFormattedDate = {
                ...concert.toJSON(),
                date: formattedDate
            };
            res.status(200).render('event', {
                concert: eventWithFormattedDate,
                pagetitle: 'Tapahtuma',
                alias: alias,
                userId: userId,
                userRegisteredToEvent: userRegisteredToEvent,
                info: req.flash('info'),
                currentPage: currentPage
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
            userId: userId,
            alias: alias,
            info: 'Tapahtuman haku epäonnistui'
        });
        console.log(error);
    }
}

// POST /event/:id (Event Page with Friend Search results)
const searchFriends = async (req, res) => {
    try {
        const eventId = req.params.id;
        const concert = await EventModel.findById(eventId);
        const thisYear = new Date().getFullYear();
        const formattedDate = format(concert.date, 'dd.MM.yyy', 'fi');
        const eventWithFormattedDate = {
                    ...concert.toJSON(),
                    date: formattedDate
                };
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
            if (city) { query.city = { $regex: city, $options: 'i' }; }

            const f = await UserModel.find(query);
            const friends = f.map(friend => {
                const age = thisYear - Number(friend.birthYear);
                return {...friend.toObject(), age};
            });
            if (friends.length < 1) {
                res.render('event', {
                    pagetitle: 'Tapahtuma',
                    userId: req.session.user.userId,
                    alias: req.session.user.alias,
                    concert: eventWithFormattedDate,
                    info: 'Hakuehdoilla ei löydy ketään',
                });
            }
            else {
                res.status(200).render('event', {
                    pagetitle: 'Tapahtuma',
                    userId: req.session.user.userId,
                    alias: req.session.user.alias,
                    concert: eventWithFormattedDate,
                    friends: friends,
                    eventId: eventId
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

module.exports = { 
    getHome, searchEvents, 
    registerToEvent, unRegisterFromEvent,
    getEvent,  searchFriends 
}; 