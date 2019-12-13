import { NextFunction, Request, Response } from "express";
import * as fs from "fs";
import * as path from "path";

/**
 * Constructor
 *
 * @class BaseRoute
 */
export abstract class BaseRoute {

    protected title: string;

    private scripts: string[];

    /**
     * Constructor
     *
     * @class BaseRoute
     * @constructor
     */
    public constructor() {
        this.title = "";
        this.scripts = [];
    }

    /**
     * The home page route.
     *
     * @class BaseRoute
     * @method index
     * @param req {Request} The express Request object.
     * @param res {Response} The express Response object.
     * @next {NextFunction} Execute the next method.
     */
    public index(req: Request, res: Response, next: NextFunction) {
        // tslint:disable-next-line: max-line-length
        const json = JSON.parse(fs.readFileSync(path.join(path.dirname(path.dirname(__dirname)), "../package.json"), { encoding: "utf-8" }));

        return res.json({
            author: json.author,
            name: json.name,
            service: json.description,
            version: json.version,
        });
    }

    /**
     * Add a JS external file to the request.
     *
     * @class BaseRoute
     * @method addScript
     * @param src {string} The src to the external JS file.
     * @return {BaseRoute} Self for chaining
     */
    public addScript(src: string): BaseRoute {
        this.scripts.push(src);
        return this;
    }

    /**
     * Render a page.
     *
     * @class BaseRoute
     * @method render
     * @param req {Request} The request object.
     * @param res {Response} The response object.
     * @param view {String} The view to render.
     * @param options {Object} Additional options to append to the view's local scope.
     * @return void
     */
    public render(req: Request, res: Response, view: string, options?: Record<string, any>) {
        // add constants
        res.locals.BASE_URL = "/";

        // add scripts
        res.locals.scripts = this.scripts;

        // add title
        res.locals.title = this.title;

        // render view
        res.render(view, options);
    }
}
