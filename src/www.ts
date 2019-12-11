import Debug from "debug";
const debug: any = Debug("portal:billing:HTTP");

/**
 * Normalize a port into a number, string, or false.
 */
const normalizePort = (val: any): number | boolean => {
    const port = parseInt(val, 10);

    if (isNaN(port)) {
        // named pipe
        return val;
    }

    if (port >= 0) {
        // port number
        return port;
    }

    return false;
};

/**
 * Event listener for HTTP server "error" event.
 */
const onError = (httpPort: any): (error?: any) => void => {
    return (error: any): void => {
        if (error.syscall !== "listen") {
            throw error;
        }

        const bind = typeof httpPort === "string"
            ? "Pipe " + httpPort
            : "Port " + httpPort;

        // handle specific listen errors with friendly messages
        switch (error.code) {
            case "EACCES":
                debug(bind + " requires elevated privileges");
                process.exit(1);
                break;
            case "EADDRINUSE":
                debug(bind + " is already in use");
                process.exit(1);
                break;
            default:
                throw error;
        }
    };
};

/**
 * Event listener for HTTP server "listening" event.
 */
const onListening = (httpServer: any): (error?: any) => void => {
    return () => {
        const addr = httpServer.address();
        const bind = typeof addr === "string"
            ? "pipe " + addr
            : "port " + addr.port;
        debug("Listening on " + bind);
    };
};

/**
 *
 * @param server
 * @param port
 */
export const www = (name: string, port: any, server: () => void, after: () => void = null) => {

    // create http server
    const httpPort = normalizePort(port);

    if (!httpPort) {
        throw new Error("Incorrect port specified for this service, cannot continue");
    }

    // the logic of server factory should be inside server function
    const [httpServer, ...component] = server.call(null, port);

    // listen on provided ports
    httpServer.listen(httpPort, () => {
        debug(name + " up and running");
    });

    // execute any statement while listening
    if (typeof after === "function") {
        after.apply(null, [httpServer, ...component]);
    }

    // increase the timeout a bit to 4mins
    httpServer.setTimeout(600000);

    // add error handler
    httpServer.on("error", onError(port));

    // start listening on port
    httpServer.on("listening", onListening(httpServer));

    return httpServer;
};
