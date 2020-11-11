const User = require("../models/user");
const bcrypt = require('bcryptjs')
const nodemailer = require('nodemailer')
const sendgridTransport = require('nodemailer-sendgrid-transport')
    //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
const transporter = nodemailer.createTransport(sendgridTransport({
    auth: {
        api_key: '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'
    }
}))

exports.getLogin = (req, res, next) => {
    let message = req.flash('error')
    if (message.length > 0) {
        message = message[0]
    } else {
        message = null;
    }
    res.render('auth/login', {
        path: '/login',
        pageTitle: 'Login',
        errorMessage: message
    });
};

exports.getSignup = (req, res, next) => {
    let message = req.flash('error')
    if (message.length > 0) {
        message = message[0]
    } else {
        message = null;
    }
    res.render('auth/signup', {
        path: '/signup',
        pageTitle: 'Signup',
        errorMessage: message
    });
};

exports.postSignup = (req, res, next) => {
    const email = req.body.email
    const password = req.body.password
    const confirmPassword = req.body.confirmPassword
    User.findOne({ email: email })
        .then(userDoc => {
            if (userDoc) {
                return res.redirect('/signup');
            }
            return bcrypt
                .hash(password, 12)
                .then(hashedPassword => {
                    const user = new User({
                        email: email,
                        password: hashedPassword,
                        cart: { items: [] }
                    });
                    return user.save();
                })
                .then(result => {
                    res.redirect('/login');
                    return transporter.sendMail({
                        to: email,
                        from: 'shahriar.uchchash@gmail.com',
                        subject: 'signed successfully',
                        html: '<h1>You successfully signed up</h1>'
                    })

                }).catch(err => {
                    console.log(err)
                })
        })

    .catch(err => {
        console.log(err);
    });
};

exports.postLogin = (req, res, next) => {
    const email = req.body.email
    const password = req.body.password

    User.findOne({ email: email })
        .then(user => {
            if (!user) {
                req.flash('error', 'Invalid email or Password')
                return res.redirect('/login')
            }
            bcrypt.compare(password, user.password)
                .then(doMatch => {
                    if (doMatch) {
                        req.session.isLoggedIn = true;
                        req.session.user = user;
                        return req.session.save(err => {
                            console.log(err)
                            res.redirect('/')
                        });
                    }
                    res.redirect('/login')
                })
                .catch(err => {
                    console.log(err)
                    res.redirect('/login')
                })

        })
        .catch(err => console.log(err));
};

exports.postLogout = (req, res, next) => {
    req.session.destroy(err => {
        console.log(err)
        res.redirect('/');

    })
};