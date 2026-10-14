console.log("Start");

setTimeout(() => {
    console.log("Timeout executed");
}, 0);

Promise.resolve().then(() => {
    console.log("Promise executed");
});

console.log("End");