const express = require('express');
const app = express();
const dotenv = require('dotenv');
dotenv.config();

//Routing
app.use('', require('./routes/gigs'));
app.use(express.urlencoded({extended: false}));
app.use(express.static('public'));

//Rendering
const exphbs = require('express-handlebars');
app.engine('handlebars', exphbs.engine({
    defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');

//Database connection and - go!
const mongoose = require('mongoose');
mongoose.connect(`mongodb+srv://${process.env.DBUSERNAME}:${process.env.DBPASSWORD}@${process.env.CLUSTER}.mongodb.net/?retryWrites=true&w=majority&appName=${process.env.DB}`)
.then(() => {
    console.log('Connected to database');
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
})
.catch((error) => {
    console.log(error);
});