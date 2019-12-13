import AbstractError from "./AbstractError";
import InterfaceError from "./InterfaceError";

export default class ServerError extends AbstractError implements InterfaceError {
    public status: number = 500;
}
