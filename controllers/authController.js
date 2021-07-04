const passport = require('passport');
const mongoose = require('mongoose');
const Vacante = mongoose.model('Vacante')
const Usuarios = mongoose.model('Usuarios');
const crypto = require('crypto');
const enviarEmail = require('../handlers/email');

exports.autenticarUsuario = passport.authenticate('local', {
    successRedirect: '/administracion',
    failureRedirect: '/iniciar-sesion',
    failureFlash: true,
    badRequestMessage: 'Todos los campos son obligatorios'
});

// Revisar si el usuario esta autenticado o no
exports.verificarUsuario = (req, res, next) => {

    // revisar el usuario

    if(req.isAuthenticated()){
        return next(); // estan autenticados
    }

    // redireccionar
    res.redirect('/iniciar-sesion');

}

exports.mostrarPanel = async (req, res) => {

    // consultar el usuario autenticado

    const vacantes = await Vacante.find({autor: req.user._id});
    res.render('administracion', {
        nombrePagina: 'Panel de Administración',
        tagline: 'Crea y Administra tus vacantes desde aquí',
        cerrarSesion: true,
        nombre: req.user.nombre,
        vacantes
    })
}

exports.cerrarSesion = (req, res) => {
    
    req.logout();

    return res.redirect('/iniciar-sesion');
}

// Formulario reinicar password

exports.formReestablecerPassword = (req, res) => {
    res.render('reestablecer-password',{
        nombrePagina: 'Reestablece tu Contraseña',
        tagline: 'Si ya tienes una cuenta y olvidaste tu contraseña, coloca tu email'
    })
}

// Genera el Token en la tabla del usuario

exports.enviarToken = async (req, res) => {
    const usuario = await Usuarios.findOne({email: req.body.email});

    if(!usuario){
        req.flash('error', 'No existe esa cuenta');
        return res.redirect('/iniciar-sesion');
    }

    usuario.token = crypto.randomBytes(20).toString('hex');
    usuario.expira = Date.now() + 3600000;

    await usuario.save();
    const resetUrl = `http://${req.headers.host}/reestablecer-password/${usuario.token}`;

    // console.log(resetUrl);

    await enviarEmail.enviar({
        usuario,
        subject : 'Password Reset',
        resetUrl,
        archivo: 'reset'
    })

    req.flash('correcto', 'Revisa tu email')
    res.redirect('/iniciar-sesion');
}