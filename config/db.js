const mongoose = require('mongoose');
mongoose.set('useCreateIndex', true);
require('dotenv').config({path: 'variables.env'});

mongoose.connect(process.env.DATABASE, { 
    useNewUrlParser:true,
    useUnifiedTopology: true
})

mongoose.connection.on('error', (error) => {
    console.log(error);
})

// Importar los modelos

require('../models/usuarios');
require('../models/vacantes');