class GlobalDB extends EventTarget {
    #observationChannel;
    #database;
    #receiveSameWindow;
    #dispatchOldValue;

    constructor(databaseName, options = {}) {
        super();
        const channel = new BroadcastChannel(`GlobalDB:observation.${databaseName}`);
        channel.addEventListener('message', e => {
            const { event, args } = e.data;
            this.#dispatchEvent(event, args);
        });
        const db = new Dexie(databaseName);
        db.version(1).stores({
            table: "key"
        });
        db.open();
        this.#observationChannel = channel;
        this.#receiveSameWindow = options.receiveSameWindowEvent ?? false;
        this.#dispatchOldValue = options.dispatchOldValue ?? false;
        this.#database = db;
    }

    put(key, value) {
        let oldValue = undefined;
        if (this.#dispatchOldValue) {
            oldValue = this.#database.table.get(key)?.value;
        }
        this.#database.table.put({ key, value });
        const args = { key, value, oldValue };
        if (this.#receiveSameWindow) {
            this.#dispatchEvent('put', args);
        }
        this.#observationChannel.postMessage({ event: "put", args });
    }

    get(key) {
        return this.#database.table.get(key)?.value;
    }

    remove(key) {
        let oldValue = undefined;
        if (this.#dispatchOldValue) {
            oldValue = this.#database.table.get(key)?.value;
        }
        this.#database.table.remove(key);
        const args = { key, oldValue };
        if (this.#receiveSameWindow) {
            this.#dispatchEvent('remove', args);
        }
        this.#observationChannel.postMessage({ event: "remove", args });
    }

    onput(handler) {
        this.addEventListener('put', handler);
    }

    onremove(handler) {
        this.addEventListener('remove', handler);
    }

    #dispatchEvent(type, args) {
        switch (type) {
            case 'put': {
                this.dispatchEvent(new (class extends Event {
                    #key;
                    #value;
                    #oldValue;
                    constructor(key, value, oldValue) {
                        super('put');
                        this.#key = key;
                        this.#value = value;
                        this.#oldValue = oldValue;
                    }
                    get key() {
                        return this.#key;
                    }
                    get value() {
                        return this.#value;
                    }
                    get oldValue() {
                        return this.#oldValue;
                    }
                })(args.key, args.value, args.oldValue));
                break;
            }
            case 'remove': {
                this.dispatchEvent(new (class extends Event {
                    #key;
                    #oldValue;
                    constructor(key, oldValue) {
                        super('remove');
                        this.#key = key;
                        this.#oldValue = oldValue;
                    }
                    get key() {
                        return this.#key;
                    }
                    get oldValue() {
                        return this.#oldValue;
                    }
                })(args.key, args.oldValue));
                break;
            }
        }
    }
}

