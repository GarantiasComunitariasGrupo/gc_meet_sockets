const { io, app } = require('../server');
const { Reunion } = require('../classes/reunion');

const reunion = new Reunion();

io.on('connection', (socket) => {

    socket.on('acceso-reunion', (data) => {
        const tipoAcceso = (data.tipo_convocado === 'Convocado') ? 'listaConvocados' : 'listaAdministradores';
        reunion.agregarLista(tipoAcceso, { ...data, socketId: socket.id });
    });

});