const express = require('express');
const app = express();

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
//const mongoose = require('mongoose');
//mongoose.connect('')
//.then(() => {
//    console.log('Connected to database');
//    const PORT = process.env.PORT || 3000;
//    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
//})
//.catch((error) => {
//    console.log(error);
//});

//Väliaikainen yhteys, poista kun tietokanta toimii
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));