import * as express from "express";
import InterfaceErrorHandler from "./ErrorHandlerIO";

type ErrorCaughtHandler = (err: any, req: express.Request) => void;
type ErrorMiddlewareRuleFunction = (err: any, req: express.Request, res: express.Response, next: express.NextFunction)
    => boolean[] | boolean | undefined;
type RuleItem = [ErrorMiddlewareRuleFunction, InterfaceErrorHandler];

interface IErrorHandlerConfig {
    onCaught: ErrorCaughtHandler[] | ErrorCaughtHandler | null;
    fallbackHandler: express.ErrorRequestHandler | null;
    rules: RuleItem[];
}

const makeError = (err: any, next: (error?: Error) => void | null = null) => {
    if (next) {
        return next(err);
    }

    throw err;
};

// type getErrorTrace = (err: Error) => Array <any>;
const getErrorTrace = (err: Error) => {
    const stack = err.stack.split("\n").map((line) => line.trim());
    stack.shift();

    const parseRow = (row: any) => {
        const t = row.match(/^at(\ (.*))?\ \(?([^:]+):(\d+):(\d+)\)?$/);

        if (!t) {
            return { statement: row };
        }

        return {
            col: t[5],
            file: t[3],
            line: t[4],
            statement: t[2] || null,
        };
    };

    return stack.map(parseRow);
};

export {
    makeError,
    getErrorTrace,
    ErrorCaughtHandler,
    IErrorHandlerConfig as ErrorHandlerConfig,
    ErrorMiddlewareRuleFunction,
    RuleItem
};
