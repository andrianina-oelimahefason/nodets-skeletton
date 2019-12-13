import AbstractError from "./AbstractError";
import InterfaceError from "./InterfaceError";

export default class ApiError extends AbstractError implements InterfaceError {
    public status: number = 503;
}
