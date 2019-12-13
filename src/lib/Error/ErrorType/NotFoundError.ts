import AbstractError from "./AbstractError";
import InterfaceError from "./InterfaceError";

export default class NotFoundError extends AbstractError implements InterfaceError {
    public status: number = 404;
}
