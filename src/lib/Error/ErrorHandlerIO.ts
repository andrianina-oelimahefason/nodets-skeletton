import { NextFunction, Request, Response } from "express";
import { ErrorMiddlewareRuleFunction } from "./Utils";

export default interface InterfaceErrorHandler {
    handle(err: any, req: Request, res: Response, callback: NextFunction): void;

    handleWhen(shouldNext: ErrorMiddlewareRuleFunction): any;
}
