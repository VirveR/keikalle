// Check is user signed in
const auth = (req, res, next) => {
    if (!req.session.user) {
        return res.render("index", {
            info: "Kirjaudu sisään, niin pääset käyttämään ohjelman kaikkia toimintoja!"
        });
    }
    else return next();
}

module.exports = { auth };