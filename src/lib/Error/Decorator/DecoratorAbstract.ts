import { NextFunction, Request, Response } from "express";
import { filter } from "lodash";
import { ErrorMiddlewareRuleFunction } from "../Utils";

export default abstract class DecoratorAbstract {
    public shouldNext: ErrorMiddlewareRuleFunction;

    public abstract handle(err: any, req: Request, res: Response, callback: NextFunction): void;

    public handleWhen(shouldNext: ErrorMiddlewareRuleFunction) {
        this.shouldNext = shouldNext;

        return this.__handle.bind(this);
    }

    protected __handle(err: any, req: Request, res: Response, callback: NextFunction) {
        const should = this.shouldNext(err, req, res, callback);

        if (err.status) {
            res.status(err.status);
        }

        if (typeof should === "undefined") {
            return callback(err);
        } else if (typeof should === "boolean" && !should) {
            return callback(err);
        } else if (typeof should === "object" && should.length !== 0 && filter(should).length === 0) {
            return callback(err);
        }

        return this.handle(err, req, res, callback);
    }
}
