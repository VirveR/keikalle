const { check, validationResult } = require('express-validator');

exports.validateForm = [
    check('alias')
        .trim()
        .escape()
        .not().isEmpty().withMessage('Nimimerkki ei voi olla tyhjä').bail()
        .isLength({min: 3, max: 20}).withMessage('Nimimerkin tulee olla 3-20 merkkiä pitkä.').bail()
        .custom((value,{req, loc, path}) => {
            if (value !== encodeURIComponent(value)) {
                throw new Error(`Nimimerkki ei voi sisältää erikoismerkkejä: < " ' > &`);
            } else {
                return value;
            }
        }),
    check('email')
        .trim()
        .escape()
        .not().isEmpty().withMessage('Sähköpostiosoite vaaditaan.').bail()
        .isEmail().withMessage('Syötä toimiva sähköpostiosoite'),
    check('password')
        .trim()
        .not().isEmpty().withMessage('Salasana ei voi olla tyhjä, tai koostua välilyönneistä').bail()
        .isLength({min: 8, max: 40}).withMessage('Salasanan tulee olla 8-40 merkkiä pitkä').bail()
        .custom((value,{req, loc, path}) => {
            if (value !== req.body.password2) {
                throw new Error("Syötetyt salasanat eivät täsmää.");
            } else {
                return value;
            }
        }),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const infoArray = errors.array().map(error => `${error.msg}`);
            return res.render("index", {
                infoArray: infoArray
            });
        }
        next();
    },
];

exports.validateLogin = [
    check('alias')
        .trim()
        .escape()
        .not().isEmpty().withMessage('Nimimerkki kenttä oli tyhjä'),
    check('password')
        .trim()
        .not().isEmpty().withMessage('Salasanakenttä oli tyhjä'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const infoArray = errors.array().map(error => `${error.msg}`);
            return res.render("index", {
                infoArray: infoArray
            });
        }
        next();
    },
];

exports.sanitizeEventSearch = [
    check('search_performer')
        .escape(),
    check('search_city')
        .escape(),
    check('search_place')
        .escape(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const infoArray = errors.array().map(error => `${error.msg}`);
            return res.render("index", {
                infoArray: infoArray
            });
        }
        next();
    },
];

exports.sanitizeProfileUpdate = [
    check('firstName')
        .escape()
        .custom((value,{req, loc, path}) => {
            if (value !== encodeURIComponent(value)) {
                throw new Error(`Etunimi ei voi sisältää erikoismerkkejä: < " ' > &`);
            } else {
                return value;
            }
        }).optional({values: 'falsy'}),
    check('lastName')
        .escape()
        .custom((value,{req, loc, path}) => {
            if (value !== encodeURIComponent(value)) {
                throw new Error(`Sukunimi ei voi sisältää erikoismerkkejä: < " ' > &`);
            } else {
                return value;
            }
        }).optional({values: 'falsy'}),
    check('alias')
        .trim()
        .escape()
        .not().isEmpty().withMessage('Nimimerkki ei voi olla tyhjä').bail()
        .isLength({min: 3, max: 20}).withMessage('Nimimerkin tulee olla 3-20 merkkiä pitkä.').bail()
        .custom((value,{req, loc, path}) => {
            if (value !== encodeURIComponent(value)) {
                throw new Error(`Nimimerkki ei voi sisältää erikoismerkkejä: < " ' > &`);
            } else {
                return value;
            }
        }),
    check('email')
        .trim()
        .escape()
        .not().isEmpty().withMessage('Sähköpostiosoite vaaditaan.').bail()
        .isEmail().withMessage('Syötä toimiva sähköpostiosoite'),
    check('city')
        .escape()
        .custom((value,{req, loc, path}) => {
            if (value !== encodeURIComponent(value)) {
                throw new Error(`Paikkakunta ei voi sisältää erikoismerkkejä: < " ' > &`);
            } else {
                return value;
            }
        }).optional({values: 'falsy'}),
    check('gender')
        .escape(),
    check('birthYear')
        .escape(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const infoArray = errors.array().map(error => `${error.msg}`);
            req.body.sanitizingErrors = infoArray.toString();
        }
        next();
    },
]