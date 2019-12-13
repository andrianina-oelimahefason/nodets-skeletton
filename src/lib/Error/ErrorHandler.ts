import * as express from "express";

import { ErrorCaughtHandler, ErrorHandlerConfig, ErrorMiddlewareRuleFunction, getErrorTrace, RuleItem } from "./Utils";

import { NextFunction } from "express";
import { pick as _pick } from "lodash";
import InterfaceErrorHandler from "./ErrorHandlerIO";

const logError = (config: any) => (
    (err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
        if (!err.trace) {
            err.trace = getErrorTrace(err);
        }

        if (!err.status) {
            err.status = err.statusCode || 500;
        }

        if (err.message && typeof (err.message) === "object") {
            if (err.message.error_description) {
                err.message = err.message.error_description;
            } else {
                err.message = JSON.stringify(err.message);
            }
        }

        if (req.headers["x-unit-test"]) {
            // tslint:disable-next-line: no-console
            console.error(`HTTP Error: ${req.method} ${req.url} -> ${err.name}, ${err.message}`);

            return next(err);
        }

        // write log on default output / console
        // tslint:disable-next-line: no-console
        console.error(new Date(), "[ERROR]", `[${err.name}, Status=${err.status || 500}] ${err.message}`, {
            req: _pick(req, ["hostname", "url", "headers", "query", "body", "params"]),
            trace: err.trace
        });

        // event emitter
        if (!config.onCaught) {
            // go to next middleware
            next(err);
        } else if (typeof config.onCaught === "function") {
            config.onCaught.call(undefined, err, req, res);
        } else if (typeof config.onCaught === "object") {
            config.onCaught.forEach((callbackErrorHandler: ErrorCaughtHandler) => {
                callbackErrorHandler.call(undefined, err, req, res);
            });
        }
    }
);

const rulesBasedHandler = (app: express.Application, config: ErrorHandlerConfig) => {
    return (err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
        if (req.xhr) {
            res.status(err.status || 500).send({ error: true, message: err.message });
        } else {
            next(err);
        }
    };
};

/**
 * Show error in the simpliest way
 *
 * @param err
 * @param req
 * @param res
 * @param next
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const fallbackErrorHandler = (err: any, req: express.Request, res: express.Response, next: NextFunction) => {
    res.status(err.status || 500);
    res.set("Content-Type", "text/plain");

    res.send({ err: err.message, trace: err.trace || err.stack });
};

/**
 * Class that handles error middlewares
 */
class ErrorHandler {

    protected app: express.Application;

    protected config: ErrorHandlerConfig;

    public constructor(app: express.Application, config: ErrorHandlerConfig = {
        fallbackHandler: null,
        onCaught: null,
        rules: []
    }) {
        this.app = app;
        this.config = config;
    }

    /**
     * Register errors middlewares as specified in rules
     */
    public registerByRules() {
        this.config.rules.forEach((rule: RuleItem) => {
            this.app.use(rule[1].handleWhen(rule[0]));
        });
    }

    /**
     * Default and basic implementation of error handler
     */
    public register() {
        // simple/default error
        this.app.use(logError(this.config));

        // handle client error
        this.registerByRules();

        // as fallback, it pushes the error onto screen
        this.app.use(this.config.fallbackHandler);
    }

    public addRule(func: ErrorMiddlewareRuleFunction, handler: InterfaceErrorHandler) {
        this.config.rules.push([func, handler]);

        return this;
    }

    public addLogger(callbackErrorHandler: ErrorCaughtHandler) {
        if (!this.config.onCaught) {
            this.config.onCaught = [callbackErrorHandler];
        } else if (typeof this.config.onCaught === "function") {
            this.config.onCaught = [this.config.onCaught, callbackErrorHandler];
        } else if (typeof this.config.onCaught === "object") {
            this.config.onCaught.push(callbackErrorHandler);
        }
    }
}

/**
 * Main error handler register function
 *
 * @param app
 * @param config
 */
const registerErrorHandler = (app: express.Application, config: ErrorHandlerConfig = {
    fallbackHandler: null,
    onCaught: null,
    rules: []
}) => {

    const handler = new ErrorHandler(app, config);

    if (config.fallbackHandler === null) {
        config.fallbackHandler = fallbackErrorHandler;
    }

    return handler;
};

export { ErrorHandler as default, registerErrorHandler, rulesBasedHandler };
