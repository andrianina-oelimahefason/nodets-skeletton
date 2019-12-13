import { NextFunction, Request, Response } from "express";
import InterfaceErrorHandler from "../ErrorHandlerIO";
import DecoratorAbstract from "./DecoratorAbstract";

export default class PlainTextHandler extends DecoratorAbstract implements InterfaceErrorHandler {
    public handle(err: any, req: Request, res: Response, callback: NextFunction) {
        res.set("Content-Type", "text/plain");
        res.send(`Error ${err.status}: ${err.message}`);
    }
}
