const { check, validationResult } = require('express-validator');

exports.validateForm = [
    check('alias')
        .trim()
        .escape()
        .not().isEmpty().withMessage('Nimimerkki ei voi olla tyhjä').bail()
        .isLength({min: 3, max: 20}).withMessage('Nimimerkin tulee olla 3-20 merkkiä pitkä.').bail(),
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