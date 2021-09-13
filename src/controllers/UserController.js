/* Requires */
const fs = require('fs');
const path = require('path');
const {validationResult} = require("express-validator");
const bcryptjs = require("bcryptjs")
/* Lectura de Usuarios del Json */
const usersFilePath = path.join(__dirname, '../data/usersDataBase.json');
//const usuarios = JSON.parse(fs.readFileSync(usersFilePath, 'utf-8'));

const db = require ("../../database/models");
const { sequelize, Sequelize } = require('../../database/models');

//const { where } = require('sequelize/types');
const op = Sequelize.Op;

let usuarios;
db.Usuario.findAll()
.then((resultados) => {
     usuarios = resultados;
    
});

const controladorUsers = {
        login: (req, res) => {
            res.render("login")
        },
        ingresar: (req, res) => {
            let errors = validationResult(req)

            if(errors.isEmpty()){ 

                let emailBuscar = req.body.email;
                let passwordIngresada = req.body.contraseña;
                let usuarioEncontrado;
                let emailEncontrado;
                for (let i of usuarios){
                    if (emailBuscar == i.email) {
                        emailEncontrado = 1;
                        if(bcryptjs.compareSync(passwordIngresada, i.clave)){
                            usuarioEncontrado = i; //usuario encontrado en el JSON
                            break;
                        }
                    }
                }
                if (usuarioEncontrado){
                   // delete usuarioEncontrado.password; // borro la Contraseña del Usuario a Loguearse por Seguridad
                    req.session.usuarioLogueado = usuarioEncontrado; // Guardo el Usuario en Session
                    if (req.body.recordarUsuario) {
                        res.cookie("userEmail", req.body.email, {maxAge: (1000 * 60) * 2});
                    }
                    res.redirect ("/"); // Usuario Logueado Exitosamente
                }
                else {
                    if(emailEncontrado == 1){
                        res.render("login", {
                            errors: {
                                contraseña: {
                                    msj:'Contraseña Incorrecta'
                                }
                            },
                            old: req.body}); // Email Correcto pero Password Incorrecto       
                    }
                    else{
                        res.render("login",{
                            errors: {
                                email: {
                                    msj:'No pudimos encontrar tu Email'
                                }
                            },
                            old: req.body}); // Datos Incorrectos
                    }
                }
            } 
            else {
                if (errors.errors.length > 0){
                    res.render("login", {errors: errors.mapped(),
                    old: req.body});
                    
                };
            }
        },
        cerrarSesion: (req, res) => {
            res.clearCookie("userEmail"); // Elimino la Cookie
            req.session.destroy(); // Destruyo la Session
            res.redirect("/");
        },
        perfil: (req, res) => {
            res.render("perfil");
           // console.log(req.cookies.userEmail);
        },
        datosUsuario: (req, res) => {
            let idURL = req.params.id;
            let usuarioEncontrado;

            for (let u of usuarios){
                if (u.id==idURL){
                    usuarioEncontrado=u;
                    break;
                }
            }

            res.render("detallePerfil", {usuarioDetalle: usuarioEncontrado});
        },
        registro: (req, res) => {
            res.render("register")
        },
        crearNuevoUsuario: (req, res) => {
            let errors = validationResult(req)
            
            
            
            if(errors.isEmpty()){ 
            
            /*idNuevo=0;

            for (let i of usuarios){
                if (idNuevo<i.id){
                    idNuevo=i.id;
                }
            }

            idNuevo++;*/

            //let nombreImagen = req.file.filename;
            let compradorSitio = "vendedor"; // por  defecto es vendedor
            let passEncriptada = bcryptjs.hashSync(req.body.contraseña, 10);

            if(req.body.tipoUsuario == 1){
                compradorSitio = "comprador"; // si el valor es 1, se lo registra como comprador
            }

            let usuarioNuevo =  {
                //id:   idNuevo,
                nombre: req.body.nombre ,    
                apellido: req.body.apellido ,
                email: req.body.email ,
                clave: passEncriptada,
                telefono: req.body.telefono,
                foto_perfil: "foto.jpg",
                rol: compradorSitio
            };

            usuarios.push(usuarioNuevo);

            //fs.writeFileSync(usersFilePath, JSON.stringify(usuarios,null,' '));
            db.Usuario.create(usuarioNuevo);

            res.redirect("/users/registracionOK"); 
        } 
            else {
                if (errors.errors.length > 0){
            res.render("register", 
                {errors: errors.mapped(),
                old: req.body
        });
        };
    }
        },
        registracionExitosa: (req, res) => {
            res.render("registracionExitosa");
        },
        modificarDatos: (req,res) => {
            let idURL = req.params.id;
            let usuarioEncontrado;

            for(let u of usuarios){
                if (idURL == u.id){
                    usuarioEncontrado = u;
                }
            }
            res.render("EditarUsuario", {usuarioaEditar: usuarioEncontrado});
        },
        almacenarUsuarioEditado: (req, res) => {
            let idURL = req.params.id;
            //let nombreImagen = req.file.filename;
            
            let usuarioEncontrado;
            let compradorSitio;

            if(req.body.tipoUsuario == 1){
                compradorSitio = true; // si el valor es 1, se lo guarda como comprador
            }
            else{
                compradorSitio = false;
            }

            for (let u of usuarios){
                if(idURL == u.id){
                    u.nombre = req.body.nombre ;   
                    u.apellido = req.body.apellido;
                    u.email = req.body.email;
                    u.password = u.password;
                    u.telefono = req.body.telefono;
                    //u.fotoPerfil = nombreImagen;
                    u.rol = compradorSitio;
                    usuarioEncontrado= u;
                    break;
                }
            }
            db.Usuario.update({
                nombre: req.body.nombre ,    
                apellido: req.body.apellido ,
                email: req.body.email ,
                telefono: req.body.telefono,
                foto_perfil: "foto.jpg",
                rol: req.body.tipoUsuario
            }, {
                where: {
                    id: idURL
                }
            })

            //fs.writeFileSync(usersFilePath, JSON.stringify(usuarios,null," "))

            req.session.usuarioLogueado = usuarioEncontrado; // Guardo el Usuario con los nuevos Datos en Session
            res.render("detallePerfil", {usuarioDetalle: usuarioEncontrado});
        },
        eliminarCuenta: (req, res) => {
            let idURL = req.params.id;

            /*let Nusuarios = usuarios.filter(function(e){
                return idURL != e.id;

            })*/

            db.Usuario.destroy({
                where: {
                    id: idURL
                }
            })

            //fs.writeFileSync(usersFilePath, JSON.stringify(Nusuarios,null," "));
            
            req.session.destroy();
            res.redirect("/"); 
        }
        
}

module.exports = controladorUsers;