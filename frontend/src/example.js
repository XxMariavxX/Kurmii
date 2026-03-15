import memoize from "./memoize.js";

const example = function (n) {
  console.log(`Calculate : ${n}`);
  return n + 3;
}

const lru = memoize(example, { capacity: 2, policy: "LRU" });

console.log("LRU");
lru(1);
lru(2);
lru(3);

lru(2);
lru(3);
lru(1);

const lfu = memoize(example, { capacity: 3, policy: "LFU" });

console.log("LFU");
lfu(1);
lfu(1);
lfu(2);
lfu(2);
lfu(2);
lfu(3);
lfu(4);

lfu(1);
lfu(2);
lfu(3);
lfu(4);

const ttl = memoize(example, { ttl: 500 });

console.log("TTL");

ttl(100);
ttl(100);
setTimeout(() => ttl(100), 200);
setTimeout(() => ttl(100), 700);

const short = memoize(example, 2);
console.log("Custom");

short(10);
short(20);
short(10); 

short(30); 

short(20); 