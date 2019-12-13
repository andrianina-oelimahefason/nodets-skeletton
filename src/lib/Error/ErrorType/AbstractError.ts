import { getErrorTrace } from "../Utils";

export default class AbstractError extends Error {
    public name: string = this.constructor.toString().match(/\w+/g)[1];
    public status: number = 500;
    protected trace: any[];

    public constructor(message: any, status: number | null = null) {
        super(message);

        if (status) {
            this.status = status;
        }

        this.trace = this.getTrace();
    }

    public getTrace() {
        return getErrorTrace(this);
    }
}
