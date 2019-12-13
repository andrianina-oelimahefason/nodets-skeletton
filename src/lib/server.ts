import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import express from "express";
import logger from "morgan";
import path from "path";

import { get } from "lodash";
import { config } from "../config";
import JsonHandler from "../lib/Error/Decorator/JsonHandler";
import { registerErrorHandler } from "../lib/Error/ErrorHandler";
import NotFoundError from "../lib/Error/ErrorType/NotFoundError";
import InterfaceRoute from "../lib/Http/InterfaceRoute";

/**
 * The server.
 *
 * @class Server
 */
export class Server {

    /**
     * Bootstrap the application.
     *
     * @class Server
     * @method bootstrap
     * @static
     * @return {ng.auto.IInjectorService} Returns the newly created injector for this app.
     */
    public static bootstrap(routes: InterfaceRoute[] = [], middlewares: any[] = []): Server {
        return new Server(routes, middlewares);
    }

    public app: express.Application;

    /**
     * Constructor.
     *
     * @class Server
     * @constructor
     */
    public constructor(routes: InterfaceRoute[] = [], middlewares: any[] = []) {
        // create expressjs application
        this.app = express();

        // configure application
        this.config(middlewares);

        // add routes
        this.routes(routes);

        // register error handlers
        this.errorHandler();
    }

    /**
	 * Configure application
	 *
	 * @class Server
	 * @method config
	 */
    public config(middlewares: any[] = []): void {

        // inject config method into app.locals
        this.app.locals.config = (key: string, defaultValue: any): string => {
            return get(config, key, defaultValue);
        };

        // add static paths
        this.app.use(express.static(path.join(__dirname, "../public")));

        // configure ejs
        // this.app.set('views', path.join(__dirname, '../views'))
        // this.app.set('view engine', 'ejs')

        // mount logger - deactivated for unit-test (chaiRequest)
        this.app.use(logger("dev", {
            skip: (req: express.Request) => ["/healthz", "/"].indexOf(req.url) >= 0
        }));

        // mount json form parser
        this.app.use(bodyParser.json({ limit: "50mb" }));

        // mount query string parser
        this.app.use(bodyParser.urlencoded({
            extended: true
        }));

        // establish SQL connection
        this.handleSequelCloseOnExitProcess();

        // initialize rabbitmq connection and configure queue config

        middlewares.forEach((m): void => {
            this.app.use(m);
        });

        // mount cookie parser middleware
        this.app.use(cookieParser(process.env.APP_KEY || "no-key-set"));

        // catch 404 and forward to error handler
        this.app.use(function (err: any, req: express.Request, res: express.Response, next: express.NextFunction): void {
            res.status(404);
            err.status = 404;
            next(new NotFoundError("404 Error - Not found"));
        });
    }

    public errorHandler(): void {
        const handler = registerErrorHandler(this.app);

        handler.addRule((err: any, req: express.Request): boolean[] => ([
            (err.type || "").match(/^stripe/ig),
            req.xhr,
            req.url.match(/^\/(api|webhook|customer|card|subscription|auth)\//i) !== null,
        ]), new JsonHandler());

        // handler.addRule((err: any, req: express.Request): boolean[] => ([
        //     (req.headers['accept'] || '').match(/html/ig) !== null
        // ]), new HtmlHandler)

        handler.register();
    }

    /**
     * Close the sequelize instance when the process exits
     */
    private handleSequelCloseOnExitProcess() {

        const exitHandler = () => {

        };

        // Handles app closing
        process.on("exit", exitHandler);
        // catches ctrl+c event
        process.on("SIGINT", exitHandler);
        // catches "kill pid" (for example: nodemon restart)
        process.on("SIGUSR1", exitHandler);
        process.on("SIGUSR2", exitHandler);
        // catches uncaught exceptions
        process.on("uncaughtException", exitHandler);
    }

    /**
	 * Create and return Router.
	 *
	 * @class Server
	 * @method config
	 * @return void
	 */
    private routes(routes: InterfaceRoute[] = []): void {
        let router: express.Router;
        router = express.Router();

        // implement each defined routes
        routes.forEach((route: InterfaceRoute): void => {
            route.configure(router);
        });

        const routerOpt: any[] = [router];

        // use router middleware
        this.app.use.apply(this.app, routerOpt);

        // serve also static routes that are supposed to be in UI
        // this.app.use('/static', express.static('ui/static'))
    }
}
