import http from "http";

const server = http.createServer((req, res) => {
    res.writeHead(200, {
        "Content-Type": "text/plain"
    });

    res.end("OFDS Node.js HTTP Server is running");
});

server.listen(4001, () => {
    console.log("Server is running on http://localhost:4001");
});