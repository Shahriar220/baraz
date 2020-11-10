const express = require('express')
const path = require('path')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const session = require('express-session')
const mongoDBStore = require('connect-mongodb-session')(session)

const errorController = require('./controllers/error')
const User = require('./models/user')

const app = express()
const store = new mongoDBStore({
    uri: 'mongodb://localhost:27017/shop',
    collection: 'sessions'
})

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin')
const shopRoutes = require('./routes/shop')
const authRoutes = require('./routes/auth')


app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static(path.join(__dirname, 'public')))

app.use(session({
    secret: 'my secret',
    resave: false,
    saveUninitialized: false,
    store: store
}))

app.use((req, res, next) => {
    if (!req.session.user) {
        return next()
    }
    User.findById(req.session.user._id)
        .then(user => {
            req.user = user;
            next()
        })
        .catch(err => console.log(err));
})

app.use((req, res, next) => {
    User.findById('5fa77b62a9825a1cca759946')
        .then(user => {
            req.user = user;
            next()
        }).catch(err => console.log(err))
})

app.use('/admin', adminRoutes)
app.use(shopRoutes)
app.use(authRoutes)

app.use(errorController.get404)

mongoose
    .connect("mongodb://localhost:27017/shop", { useUnifiedTopology: true, useNewUrlParser: true }).then(result => {
        User.findOne().then(user => {
            if (!user) {
                const user = new User({
                    name: 'maax',
                    email: 'hka@gmail.com',
                    cart: {
                        items: []
                    }
                })
                user.save()
            }
        })
        app.listen(3000)
    }).catch(err => console.log(err))