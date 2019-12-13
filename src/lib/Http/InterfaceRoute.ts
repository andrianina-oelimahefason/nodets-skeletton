import { Router } from "express";

export default interface InterfaceRoute {
    /**
     * Configure all routes defined in the class
     *
     * @param router Application Router
     */
    configure(router: Router): any;
}
