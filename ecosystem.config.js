module.exports = {
  apps: [{
    name: "gc_meet_sockets",
    script: "server/server.js",
    env: {
      "PORT": 3010,
      "NODE_ENV": "development",
      "API": "http://192.168.2.106:8802/api"
    },
    env_aospina: {
      "PORT": 3010,
      "NODE_ENV": "aospina",
      "API": "http://192.168.2.106:8802/api"
    },
    env_production: {
      "PORT": 3010,
      "NODE_ENV": "production",
      "API": "gcmeet.grantiascomunitarias.com/request/api"
    }
  }]
};