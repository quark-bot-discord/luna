const { QuickDB } = require("quick.db");

module.exports = class Luna {
    constructor(data, { memoryExpiry = 60 * 3600 * 1000, checkInterval = 30 * 3600 * 1000 }) {

        this._cache = new Map(data);

        this._storage = new QuickDB();

        this._storage.deleteAll();

        this._timestamps = new Map();

        this._memoryExpiry = memoryExpiry;

        this._checkInterval = checkInterval;

        setInterval((() => {

            const cachedData = this._cache.entries();

            for (const [key, value] of cachedData) {

                const cachedAt = this._timestamps.get(key);

                if ((cachedAt.getTime() + this._memoryExpiry) < new Date().getTime()) {

                    this._storage.set(key, value);

                    this._cache.delete(key);

                    this._timestamps.delete(key);

                }

            }

        }), this._checkInterval);

    }

    async size() {

        const cacheSize = this._cache.size;
        
        const allStorage = await this._storage.all();

        return allStorage.length + cacheSize;

    }

    async clear() {

        this._cache.clear();

        this._timestamps.clear();

        await this._storage.deleteAll();

        return;

    }

    async delete(key) {

        if (this._cache.delete(key) == true) {
            this._timestamps.delete(key);
            return true;
        } else if (await this._storage.delete(key))
            return true;
        else
            return false;

    }

    async entries() {

        const cachedEntries = this._cache.entries();
        
        let finalEntries = [];

        for (const cachedEntry of cachedEntries)
            finalEntries.push(cachedEntry.value);

        const storedEntries = await this._storage.all();

        for (let i = 0; i < storedEntries.length; i++)
            finalEntries.push([storedEntries[i].id, storedEntries[i].value]);

        return finalEntries;

    }

    async forEach(callbackfn) {

        this._cache.forEach((value, key) => {

            return callbackfn(value, key);

        });

        const allStorage = await this._storage.all();

        for (let i = 0; i < allStorage.length; i++)
            callbackfn(allStorage[i].value, allStorage[i].id);

    }

    async get(key) {

        const getCached = this._cache.get(key);

        if (getCached)
            return getCached;

        const getStored = await this._storage.get(key);

        if (getStored)
            return getStored;

        return;

    }

    async groupBy() {

    }

    async has(key) {

        if (this._cache.has(key) == true)
            return true;
        else if ((await this._storage.has(key)) == true)
            return true;
        else
            return false;

    }

    async keys() {

        const cachedEntries = this._cache.entries();
        
        let finalEntries = [];

        for (const cachedEntry of cachedEntries)
            finalEntries.push(cachedEntry.value[0]);

        const storedEntries = await this._storage.all();

        for (let i = 0; i < storedEntries.length; i++)
            finalEntries.push(storedEntries[i].id);

        return finalEntries;

    }

    set(key, value) {

        this._cache.set(key, value);

        this._timestamps.set(key, new Date());

    }

    async values() {

        const cachedEntries = this._cache.entries();
        
        let finalEntries = [];

        for (const cachedEntry of cachedEntries)
            finalEntries.push(cachedEntry.value[1]);

        const storedEntries = await this._storage.all();

        for (let i = 0; i < storedEntries.length; i++)
            finalEntries.push(storedEntries[i].value);

        return finalEntries;

    }

};