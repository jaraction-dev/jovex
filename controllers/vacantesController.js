const mongoose = require('mongoose');
const Vacante = mongoose.model('Vacante');
const multer = require('multer');
const shortid = require('shortid');

exports.formularioNuevaVacante = (req, res) => {
    res.render('nueva-vacante', {
        nombrePagina: 'Nueva Vacante',
        tagline: 'Llena el formulario y publica tu vacante',
        cerrarSesion: true,
        nombre: req.user.nombre
    })
}

// agregar las vacantes

exports.agregarVacante = async (req, res) => {
    const vacante = new Vacante(req.body);

    // autor de la vacante

    vacante.autor = req.user._id;

    // crear arreglo de skills

    vacante.skills = req.body.skills.split(',');

    // almacenarlo en la db

    const nuevaVacante = await vacante.save();

    // redirrecionar

    res.redirect(`/vacantes/${nuevaVacante.url}`);
}

// muestra una vacante

exports.mostrarVacante = async (req, res, next) => {
    const vacante = await Vacante.findOne({ url: req.params.url });

    // si no hay resultados

    if(!vacante) return next()

    res.render('vacante', {
        vacante,
        nombrePagina : vacante.titulo,
        barra: true
    })

}

exports.formEditarVacante = async (req, res, next) => {
    const vacante = await Vacante.findOne({ url: req.params.url});

    if(!vacante) return next()

    res.render('editar-vacante', {
        vacante,
        nombrePagina : `Editar - ${vacante.titulo}`,
        cerrarSesion: true,
        nombre: req.user.nombre
    })
}

exports.editarVacante = async (req, res) => {
    const vacanteActualizada = req.body;

    vacanteActualizada.skills = req.body.skills.split(',');

    const vacante = await Vacante.findOneAndUpdate({url: req.params.url}, vacanteActualizada, {
        new: true,
        runValidators: true
    });

    res.redirect(`/vacantes/${vacante.url}`);

}

// Validar y Sanitizar los campos de las nuevas vacantes
exports.validarVacante = (req, res, next) => {
    // sanitizar los campos
    req.sanitizeBody('titulo').escape();
    req.sanitizeBody('empresa').escape();
    req.sanitizeBody('ubicacion').escape();
    req.sanitizeBody('salario').escape();
    req.sanitizeBody('contrato').escape();
    req.sanitizeBody('skills').escape();

    // validar
    req.checkBody('titulo', 'Agrega un Titulo a la Vacante').notEmpty();
    req.checkBody('empresa', 'Agrega una Empresa').notEmpty();
    req.checkBody('ubicacion', 'Agrega una Ubicaci??n').notEmpty();
    req.checkBody('contrato', 'Selecciona el Tipo de Contrato').notEmpty();
    req.checkBody('skills', 'Agrega al menos una habilidad').notEmpty();

    const errores = req.validationErrors();

    if(errores) {
        // Recargar la vista con los errores
        req.flash('error', errores.map(error => error.msg));

        res.render('nueva-vacante', {
            nombrePagina: 'Nueva Vacante',
            tagline: 'Llena el formulario y publica tu vacante',
            cerrarSesion: true,
            nombre : req.user.nombre,
            mensajes: req.flash()
        })
    }

    next(); // siguiente middleware
}

exports.eliminarVacante = async (req, res) =>{
    const{id} = req.params;

    const vacante = await Vacante.findById(id);

    if(verificarAutor(vacante, req.user)){
        // Eliminar
        vacante.remove();
        res.status(200).send('Vacante Eliminada Correctamente');
    }else{
        // No permitido
        res.status(403).send('Error');

    }
}

const verificarAutor = (vacante = {}, usuario = {}) => {
    if(!vacante.autor.equals(usuario._id)){
        return false;
    }
    return true;
}

//  Subir PDF

exports.subirCV = (req, res, next) => {
    upload(req, res, function(error) {
        if(error) {
            if(error instanceof multer.MulterError) {
                if(error.code === 'LIMIT_FILE_SIZE') {
                    req.flash('error', 'El archivo es muy grande: M??ximo 100kb');
                } else {
                    req.flash('error', error.message);
                }
            } else {
                req.flash('error', error.message);
            }
            res.redirect('back');
            return;
        } else {
            return next();
        }
    });
}

// Opciones de Multer

const configuracionMulter = {
    limits : { fileSize : 100000 },
    storage: fileStorage = multer.diskStorage({
        destination : (req, file, cb) => {
            cb(null, __dirname+'../../public/uploads/cv');
        },
        filename : (req, file, cb) => {
            const extension = file.mimetype.split('/')[1];
            cb(null, `${shortid.generate()}.${extension}`);
        }
    }),
    fileFilter(req, file, cb) {
        if(file.mimetype === 'application/pdf' ) {
            // el callback se ejecuta como true o false : true cuando la imagen se acepta
            cb(null, true);
        } else {
            cb(new Error('Formato No V??lido'));
        }
    }
}

const upload = multer(configuracionMulter).single('cv');

// Almacenar los candidatos

exports.contactar = async (req, res, next) => {
    
    const vacante = await Vacante.findOne({url: req.params.url});

    // sino existe

    if(!vacante) return next();

    // todo bien, construir nuevo objeto

    const nuevoCandidato = {
        nombre: req.body.nombre,
        email: req.body.email,
        cv: req.file.filename
    }

    // ALMACENAR

    vacante.candidatos.push(nuevoCandidato);
    await vacante.save();

    // mensaje flash y redireccion

    req.flash('correcto', 'se envio tu curriculum correctamente');
    res.redirect('/');
}

exports.mostrarCandidatos = async (req, res, next) => {
    const vacante = await Vacante.findById(req.params.id);

    if(vacante.autor != req.user._id.toString()){
        return next();
    }

    if(!vacante) return next();

    res.render('candidatos', {
        nombrePagina: `Candidatos Vacante - ${vacante.titulo}`,
        cerrarSesion: true,
        nombre: req.user.nombre,
        candidatos: vacante.candidatos
    })
}