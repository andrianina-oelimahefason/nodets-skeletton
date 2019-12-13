import { NextFunction, Request, Response } from "express";
import InterfaceErrorHandler from "../ErrorHandlerIO";
import DecoratorAbstract from "./DecoratorAbstract";

export default class HtmlHandler extends DecoratorAbstract implements InterfaceErrorHandler {
    public handle(err: any, req: Request, res: Response, callback: NextFunction) {
        res.set("Content-Type", "text/html");

        const options: Record<string, any> = {
            title: `${err.name}`,
            // tslint:disable-next-line: object-literal-sort-keys
            status: err.status,
            message: err.message
        };

        res.render("error", options);
    }
}
