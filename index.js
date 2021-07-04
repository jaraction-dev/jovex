const mongoose = require('mongoose');
require('./config/db');

const express = require('express');
const handlebars = require('handlebars');
const exphbs = require('express-handlebars');
const {allowInsecurePrototypeAccess} = require('@handlebars/allow-prototype-access');
const path = require('path');
const router = require('./routes');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const passport = require('./config/passport');

require('dotenv').config({ path : 'variables.env'});

const app = express();

// Habilitar body-parser

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// Validación de campos

app.use(expressValidator());

// Habilitar handlebars como view 

app.engine('handlebars', 
    exphbs({
        handlebars: allowInsecurePrototypeAccess(handlebars),
        defaultLayout: 'Layout',
        helpers: require('./helpers/handlebars')
    })
);

app.set('view engine', 'handlebars');

// static files

app.use(express.static(path.join(__dirname, 'public')));

app.use(cookieParser());

app.use(session({
    secret: process.env.SECRETO,
    key: process.env.KEY,
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({mongooseConnection: mongoose.connection})
}));

// Inicializar Passport

app.use(passport.initialize());
app.use(passport.session());

// Alertas y flash 

app.use(flash());

// Crear Middleware

app.use((req, res, next) => {
    res.locals.mensajes = req.flash();
    next();
});

app.use('/', router());

const host = '0.0.0.0';
const port = process.env.PORT;

app.listen(port, host, ()=>{
    console.log('El servidor esta corriendo');
})