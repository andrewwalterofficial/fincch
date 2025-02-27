const express = require("express");
const bodyParser = require("body-parser");
const path = require('path');
const session = require('express-session');
const mongoStore = require('connect-mongo');
const flash = require('connect-flash');
const exphbs = require('express-handlebars');
const passport = require('passport');
const bcrypt = require('bcrypt');
const rate = require("./crawler");

// Import database configuration
require("./mongodb/db");

const app = express();
const PORT = process.env.PORT || 3000;

// Create Handlebars instance with helpers
const hbs = exphbs.create({
    defaultLayout: 'main',
    extname: 'hbs',
    helpers: {
        formatDate: function(date) {
            if (!date) return '';
            return new Date(date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        },
        formatDateTime: function(date) {
            if (!date) return '';
            return new Date(date).toLocaleString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        },
        formatCurrency: function(number) {
            if (number === null || number === undefined) return '';
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD'
            }).format(number);
        },
        eq: function(a, b) {
            return a === b;
        },
        json: function(context) {
            return JSON.stringify(context);
        },
        subtract: function(a, b) {
            return a - b;
        },
        add: function(a, b) {
            return a + b;
        }
    }
});

app.use(session({
    secret: 'required1234$',
    resave: false,
    saveUninitialized: false,
    store: mongoStore.create({
        mongoUrl: 'mongodb+srv://andrewwalterofficial:andrewwalterofficial@cluster0.dmxca.mongodb.net/onlinebanking'
    }),
    cookie: { maxAge: 1000 * 60 * 60, }
}));

// Configure middlewares
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// Configure view engine
const viewspath = path.join(__dirname, './view');
app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('views', viewspath);

// Define routes
app.use("/", require("./routes/index"));
app.use("/login", require("./routes/login"));
app.use("/register", require("./routes/register"));
app.use("/dashboard", require("./routes/dashboard"));
app.use("/admin", require("./routes/admin.js"));

app.listen(PORT, () => {
    console.log(`Listening on PORT ${PORT}`);
});