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
        res.render('index', {
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

module.exports = {getHome};