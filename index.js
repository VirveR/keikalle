const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
// for creating session uuid
const { v4: uuidv4 } = require('uuid');

//sessioo varten tuotu nämä tänne
const mongoose = require('mongoose');
require('dotenv').config();
const conString = `mongodb+srv://${process.env.DBUSERNAME}:${process.env.DBPASSWORD}@${process.env.CLUSTER}.mongodb.net/${process.env.DB}?retryWrites=true&w=majority&appName=Keikalle`


const app = express();
require('dotenv').config();

//Routing
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(express.static('public'));
app.use(session( {
        secret: 'testi_key', //Tähän pitää vaihtaa tietoturvallisempi key
        resave: false,
        saveUninitialized: false,
        store: MongoStore.create({
            mongoUrl: conString,
        })
}));
app.use('', require(__dirname +'/routes/testRoutes'));
app.use('', require(__dirname +'/routes/users'));


//Rendering
const exphbs = require('express-handlebars');

app.engine('handlebars', exphbs.engine({
    defaultLayout: 'main',
    partialsDir: __dirname + '/views/partials/'
}));
app.set('view engine', 'handlebars');

//Listening
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
