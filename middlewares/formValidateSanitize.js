const { check, validationResult } = require('express-validator');

exports.validateForm = [
    check('alias')
        .trim()
        .escape()
        .not().isEmpty().withMessage('Nimimerkki ei voi olla tyhjä').bail()
        .isLength({min: 3, max: 20}).withMessage('Nimimerkin tulee olla 3-20 merkkiä pitkä.').bail(),
    check('email')
        .trim()
        .not().isEmpty().withMessage('Sähköpostiosoite vaaditaan.').bail()
        .isEmail().withMessage('Syötä toimiva sähköpostiosoite'),
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