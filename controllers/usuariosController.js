const mongoose = require('mongoose');
const Usuarios = mongoose.model('Usuarios');
const multer = require('multer');

exports.formCrearCuenta = (req, res) => {
    res.render('crear-cuenta', {
        nombrePagina: 'Crea tu cuenta en jovEx',
        tagline: 'Comienza a publicar tus vacantes gratis, solo debes crear una cuenta'
    })
}

exports.validarRegistro = (req, res, next) => {

    // Sanitizar los campos

    req.sanitizeBody('nombre').escape();
    req.sanitizeBody('email').escape();
    req.sanitizeBody('password').escape();
    req.sanitizeBody('confirmar').escape();

    // Validar datos

    req.checkBody('nombre', 'El Nombre es Obligatorio').notEmpty();
    req.checkBody('email', 'El email debe ser valido').isEmail();
    req.checkBody('password', 'La contraseña no puede ir vacío').notEmpty();
    req.checkBody('confirmar', 'Debes confirmas tu contraseña').notEmpty();
    req.checkBody('confirmar', 'Las contraseñas son distintas').equals(req.body.password);

    const errores = req.validationErrors();

    if(errores){
        // Si hay errores
        req.flash('error', errores.map(error => error.msg));

        res.render('crear-cuenta', {
            nombrePagina: 'Crea tu cuenta en jovEx',
            tagline: 'Comienza a publicar tus vacantes gratis, solo debes crear una cuenta',
            mensajes: req.flash()
        });

        return;
    }

    // si la validacion es correcta
    next();
}

exports.crearUsuario = async (req, res, next) => {
    // crear el usuario

    const usuario = new Usuarios(req.body);

    try {

        await usuario.save();

        res.redirect('/iniciar-sesion');

    } catch (error) {
        
        req.flash('error', error);
        res.redirect('/crear-cuenta');

    }
}

// formulario para iniciar sesión

exports.formIniciarSesion = (req, res) => {
    res.render('iniciar-sesion', {
        nombrePagina : 'Iniciar Sesión en jovEx'
    })
}

// Editar perfil

exports.formEditarPerfil = (req, res) => {
    res.render('editar-perfil', {
        nombrePagina: 'Edita tu perfil en jovEx',
        usuario: req.user,
        cerrarSesion: true,
        nombre: req.user.nombre
    })
}

// Guardas cambios perfil

exports.editarPerfil = async (req, res) => {
    const usuario = await Usuarios.findById(req.user._id);

    usuario.nombre = req.body.nombre;
    usuario.email = req.body.email;
    if(req.body.password){
        usuario.password = req.body.password
    }
    await usuario.save();

    req.flash('correcto', 'Cambios Guardados');

    // redirect

    res.redirect('/administracion');
}

// sanitizar perfil

exports.validarPerfil = (req, res, next) => {
    // sanitizar

    req.sanitizeBody('nombre').escape();
    req.sanitizeBody('email').escape();
    if(req.body.password){
        req.sanitizeBody('password').escape();
    }

    // validar

    req.checkBody('nombre', 'El nombre no puede ir vacío').notEmpty();
    req.checkBody('email', 'El email no puede ir vacío').notEmpty();

    const errores = req.validationErrors();

    if(errores){
        req.flash('error', errores.map(error => error.msg));

        res.render('editar-perfil', {
            nombrePagina: 'Edita tu perfil en jovEx',
            usuario: req.user,
            cerrarSesion: true,
            nombre: req.user.nombre,
            mensajes: req.flash()
        })
    }

    next();
}

