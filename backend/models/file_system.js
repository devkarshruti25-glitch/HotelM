import fs from "fs";

// Write data into a file
fs.writeFileSync(
    "food.txt",
    "Welcome to OFDS - Online Food Delivery System"
);

// Read data from the file
const data = fs.readFileSync(
    "food.txt",
    "utf8"
);

console.log("File Content:");
console.log(data);