const Luna = require(".");

const luna = new Luna(undefined, { memoryExpiry: 5000, checkInterval: 1000 });

setInterval(async () => {
    console.log(await luna.size());
}, 1000);

luna.set("key", 123);
console.log("key added to cache");

setTimeout(async () => {
    const value = await luna.get("key");
    console.log(`value is ${value}`);
}, 4000);

setTimeout(async () => {
    await luna.delete("key");
    console.log("key deleted");
}, 8000);

/**
 * Expect output to console:
 * 
 * ```
 * key added to cache
 * 1
 * 1
 * 1
 * 1
 * value is 123
 * (key moved to storage)
 * 1
 * 1
 * 1
 * key deleted
 * 0
 * ```
 */