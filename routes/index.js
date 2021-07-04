const express = require('express');
const router = express.Router();
const homeController = require('../controllers/homeController');
const vacantesController = require('../controllers/vacantesController');
const usuariosController = require('../controllers/usuariosController');
const authController = require('../controllers/authController');

module.exports = () => {
    router.get('/', homeController.mostrarTrabajos);

    // Crear Vacantes

    router.get('/vacantes/nueva',
        authController.verificarUsuario,
        vacantesController.formularioNuevaVacante
    );
    router.post('/vacantes/nueva',
        authController.verificarUsuario, 
        vacantesController.validarVacante,
        vacantesController.agregarVacante
    );

    // Mostrar vacante

    router.get('/vacantes/:url',vacantesController.mostrarVacante );

    // Editar vacante

    router.get('/vacantes/editar/:url',
        authController.verificarUsuario,
        vacantesController.formEditarVacante
    );
    router.post('/vacantes/editar/:url', 
        authController.verificarUsuario,
        vacantesController.validarVacante,
        vacantesController.editarVacante
    );

    // Eliminar Vacantes

    router.delete('/vacantes/eliminar/:id',
        vacantesController.eliminarVacante
    );

    // Crear Cuentas

    router.get('/crear-cuenta', usuariosController.formCrearCuenta);
    router.post('/crear-cuenta', 
        usuariosController.validarRegistro,
        usuariosController.crearUsuario
    );

    // Autenticar Usuarios
    
    router.get('/iniciar-sesion', usuariosController.formIniciarSesion);
    router.post('/iniciar-sesion', authController.autenticarUsuario);

    // Cerrar Sesión

    router.get('/cerrar-sesion',
        authController.verificarUsuario,
        authController.cerrarSesion
    );

    // Cambiar password

    router.get('/reestablecer-password', authController.formReestablecerPassword);
    router.post('/reestablecer-password', authController.enviarToken);

    // Dashboard

    router.get('/administracion',
        authController.verificarUsuario,
        authController.mostrarPanel
    );

    // Editar Perfil
    router.get('/editar-perfil',
        authController.verificarUsuario,
        usuariosController.formEditarPerfil
    );
    router.post('/editar-perfil',
        authController.verificarUsuario,
        usuariosController.validarPerfil,
        usuariosController.editarPerfil
    );

    // Recibir mensajes de candidatos
    router.post('/vacantes/:url',
        vacantesController.subirCV,
        vacantesController.contactar
    );

    // Muestra los candidatos
    router.get('/candidatos/:id',
        authController.verificarUsuario,
        vacantesController.mostrarCandidatos
    );

    return router;
}