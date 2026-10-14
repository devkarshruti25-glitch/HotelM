import { Readable } from "stream";

const foodStream = Readable.from([
    "Veg Spring Rolls",
    "Masala Dosa",
    "Paneer Butter Masala",
    "Chicken Biryani"
]);

foodStream.on("data", (chunk) => {
    console.log("Received:", chunk.toString());
});

foodStream.on("end", () => {
    console.log("Stream completed");
});