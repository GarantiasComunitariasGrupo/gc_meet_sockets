const axios = require('axios');

class ReunionOld
{
    /** Array para almacenar convocados de la reunión */
    listaConvocados = [];
    /** Array para almcenar administradores de la reunión */
    listaAdministradores = [];
    /** Endpoint backend laravel */
    urlAPI = process.env.API || 'http://192.168.13.26:8802/api';

    /**
     * Función encargada de añadir un concovado/administrador a su respectivo array
     * 
     * @param tipo => listaConvocados|listaAdministradores
     * @param data => info del usuario
     */
    agregarLista = (tipo, data, callback) => {
        /** Valida que exista el array */
        if (this[tipo]) {
            /** Consulta si en dicho array ya existe el id_convocado_reunion */
            const user = this[tipo].find((row) => row.id_convocado_reunion == data.id_convocado_reunion);
            if (!user) {
                /** Si no existe, lo añade al array */
                this[tipo].push(data);
            } else {
                /** Si ya existe, retorna callback para indicar que se le debe cerrar las otras pestañas abiertas */
                callback(user.socketId);
                /** Actualiza socket.id del usuario existente */
                user.socketId = data.socketId;
            }
        }
    }

    /** Función encargada de sacar de ambos array un usuario con un socket.id especifico
     * @param socket_id => socket.id
     */
    sacarUsuario = (socket_id) => {
        this.listaConvocados = this.listaConvocados.filter((row) => row.socketId != socket_id);
        this.listaAdministradores = this.listaAdministradores.filter((row) => row.socketId != socket_id);
    }

    /**
     * Función encargada de obtener un array especifíco
     * @param tipo => nombre del array en esta clase
     */
    getLista = (tipo) => this[tipo];

    /**
     * Función encargada de consumir API de laravel para registrar el acceso de un convocado a una reunión
     * @param {*} data 
     */
    storeUser = (data) => {
        axios.post(`${this.urlAPI}/acceso-reunion/guardar-acceso-reunion`, data)
        .then((response) => {
            if (response.status === 200) {
                console.log(response.data);
            }
        }).catch((error) => console.log('error', error));
    }

    /**
     * Función encargada de buscar un usuario especifico en cualquier lista de array
     * @param tipo => nombre de array en esta clase
     * @param campo => campo por el cual se va realizar la búsqueda
     * @param value => valor de comparación para realizar búsqueda
     * @return array | false
     */
    buscarUsuario = (tipo, campo, value) => {
        if (this[tipo]) {
            const user = this[tipo].find((row) => row[campo] == value);
            return (user) ? user : false;
        }
    }

    /**
     * Función encargada de consumir API de laravel para registrar la desconexión de un usuario de la reunión
     * @param usuario => información del usuario 
     */
    guardarDesconexion = (usuario) => {
        axios.post(`${this.urlAPI}/acceso-reunion/actualizar-acceso-reunion`, usuario)
        .then((response) => {
            if (response.status === 200) {
                console.log(response.data);
            }
        }).catch((error) => console.log('error', error));
    }

    /**
     * Función encargada de consumir API de laravel para obtener las respuestas de un programa específico
     * @param {*} id_programa 
     * @param {*} callback 
     */
    getResultadosPrograma = (id_programa, callback) => {
        axios.get(`${this.urlAPI}/acceso-reunion/get-resultados-votacion/${id_programa}`)
        .then((response) => {
            if (response.status === 200) {
                callback(response.data);
            }
        }).catch((error) => console.log('error', error))
    }

    /**
     * Función encargada de crear un array con los socket.id de cada uno de los administradores de la reunión
     * @return array
    */
    getIdSocketAdmin = () => {
        if (this.listaAdministradores.length > 0) {
            return this.listaAdministradores.map((row) => row.socketId);
        }
    }

    /** Función encargada de eliminar un usuario de la lista de convocados y registrar en BD su desconexión */
    desconectarUsuario = (id_socket, callback) => {

        const listado = this.listaConvocados;
        const user = listado.findIndex((row) => row.socketId == id_socket);

        if (user !== -1) {
            this.guardarDesconexion(listado[user]);
            callback(listado[user]);
            listado.splice(user, 1);
        }

    }

    /**
     * Función encargada de obtener las opciones de respuesta para un programa de tipo: SELECCIÓN ÚNICA/MÚLTIPLE
     * @param {*} id_padre 
     * @param {*} callback 
     */
    getOpcionesSeleccion  = (id_padre, callback) => {
        axios.get(`${this.urlAPI}/acceso-reunion/get-opciones-seleccion/${id_padre}`)
        .then((response) => {
            if (response.status === 200) {
                callback(response.data);
            }
        }).catch((error) => console.log('error', error));
    }

    /**
     * Función encargada de construir las estadísticas de voto para un programa específico que sea de tipo: SELECCIÓN ÚNICA/MÚLTIPLE
     * @param {*} id_programa 
     * @param {*} isChild 
     * @param {*} callback 
     */
    asignacionVotosSeleccion = (id_programa, isChild, callback) => {

        this.getOpcionesSeleccion(id_programa, (response) => {

            if (response.ok) {

                const programas = response.response.map((row) => ({ id: row.id_programa, txt: row.titulo }));

                this.getResultadosPrograma(id_programa, (resultados) => {

                    let datos = {};
                    const valoresResultado = resultados.response.map((row) => JSON.parse(row.descripcion));

                    programas.forEach((row) => {
                        
                        let contador = 0;

                        valoresResultado.forEach((elm) => {
                            const valor = elm.seleccion.filter((col) => +col === +row.id);
                            (valor.length > 0) ? contador++ : null;
                        });

                        row.cantidad = contador;

                    });

                    datos.resultados = programas;
                    datos.isChild = isChild;
                    datos.id_programa = id_programa;

                    callback(datos);
                });

            }
        });

    }

}

module.exports = { ReunionOld }