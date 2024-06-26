const express = require('express');
const session = require('express-session');
const { v4: uuidv4 } = require('uuid'); // for creating session uuid
const checkSession = require('./middlewares/expiredSessions');
const flash = require('express-flash');
const store = require('./middlewares/validate');

const MongoStore = require('connect-mongo');

// Generates unique session secure key
const generateUUIDKey = () => {
    return uuidv4();
}

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
    secret: generateUUIDKey(),
    resave: false, // saving session data to the store only when something in it changes
    saveUninitialized: false, // session is not stored if there is not any changes made to it
    store: MongoStore.create({
        mongooseConnection: mongoose.connection,
        mongoUrl: conString,
        collection: 'sessions',
    }),
    cookie: {
        maxAge: 30 * 60 * 1000, // Set maxAge to 30 minutes in milliseconds,
        httpOnly: true, // Session cookie will be accessible only through HTTP(S) requests and cannot be accessed by client-side scripts
        secure: false // Session cookie will be sent over both HTTP and HTTPS connections. Good for developmen but in production, set to true -> ensures that the session cookie is only sent over secure HTTPS connections
    }
   
}));
app.use(checkSession);

app.use(flash());

app.use('', require(__dirname +'/routes/events'));
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
