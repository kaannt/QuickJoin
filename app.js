const express = require('express')
const app = express()
const session = require('express-session')
const pgSession = require('connect-pg-simple')(session)

const login = require('./auth/login.js')
const signup = require('./auth/signup.js')
const home = require('./dashboard/home.js')
const settings = require('./dashboard/settings.js')
const db = require('./db/index.js')

app.use(express.static('public'))
app.use(express.json()) // check later
app.use(express.urlencoded({ extended: false }))

const store = new pgSession({
    pool: db.pool,
    tableName: 'user_sessions'
})

const sess = {
    store: store,
    secret: 'some secret',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 }
}

if (app.get('env') === 'production') {
    app.set('trust proxy', 1)
    sess.cookie.secure = true
}

app.use(session(sess))
        
// load routes
app.use(login)
app.use(signup)
app.use(home)
app.use(settings)

app.set('views', './views')
app.set('view engine', 'ejs')

// 404 handling
app.use(function (req, res, next) {
  res.status(404).sendFile(__dirname + '/views/notfound.html')
})

let port = process.env.PORT || 8080

app.listen(port, () => console.log('Running at ' + port))

module.exports.store = store
