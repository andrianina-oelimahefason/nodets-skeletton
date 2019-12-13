import { connect, connection as Mongoose } from "mongoose";

import { get as _get } from "lodash";
import { config } from "../../config";

interface IConfigShape {
    wait: number;
    retry: number;
}

type ConnectionCallback = (err: Error | null, config: IConfigShape | null) => void;

class MongodbConnection {

    public static getInstance(): MongodbConnection {
        return MongodbConnection.instance;
    }

    private static instance: MongodbConnection = new MongodbConnection();

    protected config = config;

    protected db: any;

    constructor() {
        if (MongodbConnection.instance) {
            throw new Error("Error: Instantiation failed: Use Connection.getInstance() instead of new.");
        }

        MongodbConnection.instance = this;
    }

    /**
     * Connect to db server
     *
     * @param callback
     */
    public connect(callback: ConnectionCallback) {
        let dsn = `mongodb://${_get(this.config, "db.mongodb.user")}:${_get(this.config, "db.mongodb.pwd")}@${_get(this.config, "db.mongodb.host")}:${_get(this.config, "db.mongodb.port")}/${_get(this.config, "db.mongodb.dbname")}`;

        if (_get(this.config, "db.mongodb.asAdmin", false)) {
            dsn += "?authSource=admin";
        }

        this.db = connect(dsn, {
            reconnectInterval: 500,
            reconnectTries: Number.MAX_VALUE,
            useNewUrlParser: true
        }, (err: any) => {
            callback.call(this, err, _get(this.config, ["qdispatcher"], {}));

        });
    }

    public close() {
        return Mongoose.close();
    }
}

export { ConnectionCallback, MongodbConnection, IConfigShape as ConfigShape };
