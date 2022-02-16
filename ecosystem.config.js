module.exports = {
  apps: [{
    name: "gc_meet_sockets",
    script: "server/server.js",
    env: {
      "PORT": 3010,
      "NODE_ENV": "development",
      "API": "http://192.168.0.4:8803/api"
    },
    env_aospina: {
      "PORT": 3010,
      "NODE_ENV": "aospina",
      "API": "http://192.168.0.4:8803/api"
    },
    env_production: {
      "PORT": 3010,
      "NODE_ENV": "production",
      "API": "http://192.168.0.4:8803/api"
    }
  }]
};