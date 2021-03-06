// Require the framework and instantiate it
const fastify = require('fastify')({
    logger: true
});
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const AppSingleton = require('./appsingleton');
const init = require('./init');

const adapter = new FileSync('db.json');
const db = low(adapter);

db.defaults({
    messages: [],
    unread: [],
    sessions: []
}).write();

const sharedInstance = AppSingleton.getInstance();

sharedInstance.db = db;

sharedInstance.satcom = {
    status: 'UNKNOWN',
    time: new Date().toLocaleString()
};

sharedInstance.gps = {
    lat: 'NOT FIXED',
    lng: 'NOT FIXED',
    time: 'UNKNOWN'
};

sharedInstance.sensors = {
    temperature: -1,
    pressure: -1,
    humidity: -1,
    gasResistance: -1,
    altitude: -1
};

sharedInstance.sessions = {};

sharedInstance.unread = sharedInstance.db.get('unread').value();


fastify.register(require('./routes/status'));
fastify.register(require('./routes/satcom'));
fastify.register(require('./routes/sensors'));
fastify.register(require('./routes/session'));

// Run the server!
const start = async () => {
    try {
        await fastify.listen(3939, '0.0.0.0');
        init();
        fastify.log.info(`server listening on ${fastify.server.address().port}`);
    } catch (err) {
        fastify.log.error(err);
        throw err;
    }
};

start();
