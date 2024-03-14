const { QuickDB } = require("quick.db");

module.exports = class Luna {
    constructor(data, { memoryExpiry = 60 * 3600 * 1000, checkInterval = 30 * 3600 * 1000, specialIdentifier = "" }) {

        this._cache = new Map(data);

        this._storage = new QuickDB();

        this._storage.deleteAll();

        this._timestamps = new Map();

        this._memoryExpiry = memoryExpiry;

        this._checkInterval = checkInterval;

        this._specialIdentifier = specialIdentifier;

        this.size = 0;

        setInterval((() => {

            const cachedData = this._cache.entries();

            for (const [key, value] of cachedData) {

                const cachedAt = this._timestamps.get(key);

                if ((cachedAt.getTime() + this._memoryExpiry) < new Date().getTime()) {

                    this._storage.set(`${this._specialIdentifier}_${key}`, value);

                    this._cache.delete(key);

                    this._timestamps.delete(key);

                }

            }

        }), this._checkInterval);

    }

    async clear() {

        this._cache.clear();

        this._timestamps.clear();

        await this._storage.deleteAll();

        this.size = 0;

        return;

    }

    async delete(key) {

        if (this._cache.delete(key) == true) {
            this._timestamps.delete(key);
            this.size--;
            return true;
        } else if (await this._storage.delete(`${this._specialIdentifier}_${key}`)) {
            this.size--;
            return true;
        } else
            return false;

    }

    async entries() {

        const cachedEntries = this._cache.entries();
        
        let finalEntries = [];

        for (const cachedEntry of cachedEntries)
            finalEntries.push(cachedEntry.value);

        const storedEntries = await this._storage.all();

        for (let i = 0; i < storedEntries.length; i++)
            finalEntries.push([storedEntries[i].id.replace(`${this._specialIdentifier}_`, ""), storedEntries[i].value]);

        return finalEntries;

    }

    forEach(callbackfn) {

        this._cache.forEach((value, key) => {

            return callbackfn(value, key);

        });

        this._storage.all()
            .then(allStorage => {

                for (let i = 0; i < allStorage.length; i++)
                    callbackfn(allStorage[i].value, allStorage[i].id.replace(`${this._specialIdentifier}_`, ""));

            });

    }

    async get(key) {

        const getCached = this._cache.get(key);

        if (getCached)
            return getCached;

        const getStored = await this._storage.get(`${this._specialIdentifier}_${key}`);

        if (getStored)
            return getStored;

        return;

    }

    async groupBy() {

    }

    async has(key) {

        if (this._cache.has(key) == true)
            return true;
        else if ((await this._storage.has(`${this._specialIdentifier}_${key}`)) == true)
            return true;
        else
            return false;

    }

    async keys() {

        const cachedEntries = this._cache.entries();
        
        let finalEntries = [];

        for (const cachedEntry of cachedEntries)
            finalEntries.push(cachedEntry[0]);

        const storedEntries = await this._storage.all();

        for (let i = 0; i < storedEntries.length; i++)
            finalEntries.push(storedEntries[i].id.replace(`${this._specialIdentifier}_`, ""));

        return finalEntries;

    }

    set(key, value) {

        this._cache.set(key, value);

        this._timestamps.set(key, new Date());

        this.size++;

    }

    async values() {

        const cachedEntries = this._cache.entries();
        
        let finalEntries = [];

        for (const cachedEntry of cachedEntries)
            finalEntries.push(cachedEntry[1]);

        const storedEntries = await this._storage.all();

        for (let i = 0; i < storedEntries.length; i++)
            finalEntries.push(storedEntries[i].value);

        return finalEntries;

    }

};