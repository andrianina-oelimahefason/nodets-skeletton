import AbstractError from "./AbstractError";
import InterfaceError from "./InterfaceError";

export default class BadRequestError extends AbstractError implements InterfaceError {
    public status: number = 400;

    constructor(message: any) {
        super(message);
    }
}
