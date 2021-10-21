/**
 * Librería para peticiones HTTP
 */
const axios = require('axios');

/**
 * SalaEspera
 * 
 * Clase para manejar lógica de sockets
 */
class SalaEspera
{
    listaSalaEspera = [];

    /**
     * Función encargada de añadir un usuario a la sala
     * 
     * @params usuario => usuario que entró a la sala
     * @params callback => Function. Se usa callback en caso de que ya el usuario exista en la sala
     */
    addUserRoom = (usuario, callback) => {

        /**
         * Se busca si el usuario ya ha accedido a la sala
         */
        const user = this.listaSalaEspera.find((row) => row.usuario === usuario.usuario);

        if (!user) {

            /**
             * Si no ha accedido, se añade
             */
            this.listaSalaEspera.push(usuario);
        } else {

            /**
             * Si ya ha accedido, se modifica id del socket y se devuelve callback con id existente
             */
            callback(user.id);
            user.id = usuario.id;
        }
    }

    /**
     * Función encargada de obtener todos los usuarios que están conectados a la sala de espera
     * 
     * @returns Array
     */
    getUsersRoom = () => this.listaSalaEspera;

    /**
     * Función encargada de realizar petición POST a LARAVEL para guardar en base de datos la información del usuario que accedió a la sala
     * 
     * @param {*} data 
     */
    storeUser = (data) => {

        axios.post('http://192.168.2.85:8800/api/acceso-reunion/guardar-acceso-reunion', data)
        .then((response) => {
            if (response.status === 200) {
                console.log(response.data);
            }
        }).catch((error) => console.log('error', error));
        
    }

}

module.exports = { SalaEspera }