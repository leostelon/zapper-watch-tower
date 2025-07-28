import "dotenv/config"

import express from "express";
const app = express()

app.use(express.json());
// Create an HTTP server to handle requests and proxy them
// CORS
app.use(function (req, res, next) {
    // var allowedDomains = process.env.ALLOWED_DOMAINS.split(" ");
    // var origin = req.headers.origin;
    // if (allowedDomains.indexOf(origin) > -1) {
    //     res.setHeader("Access-Control-Allow-Origin", origin);
    // }
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.header(
        "Access-Control-Allow-Methods",
        " GET, POST, PATCH, PUT, DELETE, OPTIONS"
    );
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    next();
});


app.get("/", (req, res) => {
    res.send("Hello World!");
});

const port = 3000;
app.listen(port, () => {
    console.log(`Watch tower listening on port ${port}`);
});
