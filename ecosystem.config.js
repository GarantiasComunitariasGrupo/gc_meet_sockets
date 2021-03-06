module.exports = {
  apps: [{
    name: "gc_meet_sockets",
    script: "server/server.js",
    env: {
      CERTIFICATE: JSON.stringify({ path: 'C:\\wamp64\\bin\\apache\\apache2.4.51\\conf\\key\\', cert: 'certificate.crt', key: 'private.key' }),
      API: "http://192.168.2.106:8802/api",
      NODE_ENV: "development",
      PORT: 3010,
    },
    env_aospina: {
      CERTIFICATE: JSON.stringify({ path: 'C:\\wamp64\\bin\\apache\\apache2.4.51\\conf\\key\\', cert: 'certificate.crt', key: 'private.key' }),
      API: "http://192.168.2.106:8802/api",
      NODE_ENV: "aospina",
      PORT: 3010,
    },
    env_production: {
      CERTIFICATE: JSON.stringify({ path: '/etc/ssl/', cert: 'certs/ssl-cert-snakeoil.pem', key: 'private/ssl-cert-snakeoil.key' }),
      // CERTIFICATE: JSON.stringify({ path: '/usr/home/gc/certs/', cert: 'garantias.pem', key: 'garantias.key' }),
      API: "gcmeet.grantiascomunitarias.com/request/api",
      NODE_ENV: "production",
      PORT: 3010,
    }
  }]
};