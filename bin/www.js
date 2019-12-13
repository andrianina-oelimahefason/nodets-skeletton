const www = require('../dist/www').www;
const Server = require('../dist/lib/server').Server;
const config = require('../dist/config').config;

var http = require('http');
var cluster = require('cluster');
var debug = require('debug')('portal:billing');

const createServer = function (conf) {
    www(conf.name, conf.port, function (port) {
        debug('Init [%s] on port %s', conf.name, port);

        var allowCrossDomain = function (req, res, next) {
            // Website you wish to allow to connect
            res.setHeader('Access-Control-Allow-Origin', '*');

            // Request methods you wish to allow
            res.setHeader('Access-Control-Allow-Methods', 'POST, GET, HEAD, DELETE, PUT, OPTIONS');
            res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Content-Range, Authorization');
            res.setHeader('Access-Control-Expose-Headers', 'Content-Type, Content-Range');

            // Set to true if you need the website to include cookies in the requests sent
            // to the API (e.g. in case you use sessions)
            res.setHeader('Access-Control-Allow-Credentials', true);

            // Pass to next layer of middleware
            next();
        };

        //create http server
        var app = Server.bootstrap([
            // new Router()
        ], [
            //cors(corsOptions),
            allowCrossDomain,
        ]).app;

        app.set('port', port);

        var httpServer = http.createServer(app);

        // https://cloud.google.com/load-balancing/docs/https/#timeouts_and_retries
        httpServer.keepAliveTimeout = 620000;

        return [httpServer, app];
    });
};

var httpInstance;
if (process.argv.indexOf('--debug') !== -1) {
    httpInstance = createServer(config);
} else if (process.argv.indexOf('--with-cluster') && cluster.isMaster) {
    // Count the machine's CPUs
    var cpuCount = require('os').cpus().length;

    debug('master setting up ' + cpuCount + ' workers');

    // Create a worker for each CPU
    for (var i = 0; i < cpuCount; i += 1) {
        cluster.fork();
    }

    // process is clustered on a core and process id is assigned
    cluster.on('online', function (worker) {
        debug('worker ' + worker.process.pid + ' is listening');
    });

    cluster.on('exit', function (worker, code, signal) {
        debug('Worker ' + worker.process.pid + ' died with code: ' + code + ', and signal: ' + signal);
        debug('respawning...');
        cluster.fork();
    });
} else {
    httpInstance = createServer(config);
}

module.exports = httpInstance;