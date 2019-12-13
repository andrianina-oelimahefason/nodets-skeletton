import { NextFunction, Request, Response } from "express";
import InterfaceErrorHandler from "../ErrorHandlerIO";
import DecoratorAbstract from "./DecoratorAbstract";

export default class JsonHandler extends DecoratorAbstract implements InterfaceErrorHandler {
    public handle(err: any, req: Request, res: Response, callback: NextFunction) {
        res.set("Content-Typpe", "application/json");
        const output: any = { error: true, success: false, message: err.message, code: err.status };

        if (process.env.NODE_ENV === "development") {
            output.type = err.name;
            output.trace = err.trace;
        }

        res.status(err.status || 500).send(output);
    }
}
