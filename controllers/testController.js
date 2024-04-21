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

const UserModel = require('../models/User');
const EventModel = require('../models/Event');

//GET home
const getHome = async (req, res) => {
    try {
        const concerts = await EventModel.find();
        console.log('Toimii tähän asti');
        console.log(concerts);
        res.render('index', {
            userPressesLoginButtonShowThis: true,
            events_info: 'Tapahtuman hakeminen onnistui',
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