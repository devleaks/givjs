const SocketServer = require("ws").Server;
var express = require("express");

var app = express();

var connectedUsers = [];

var router = express.Router();

var port = process.env.PORT || 3000;

router.get("/status", function(req, res) {
    res.json({ status: "App is running" });
});


//connect path to router
app.use("/", router);

app.use(express.static("dist"))

var server = app.listen(port, function() {
    console.log("express.js static server listening on port: " + port)
})

//if serving static app from another server/port, send CORS headers in response
//{ headers: {
//"Access-Control-Allow-Origin": "*",
//    "Access-Control-Allow-Headers": "http://localhost:3000",
//    "Access-Control-Allow-Methods": "PUT, GET, POST, DELETE, OPTIONS"
//} }
const wss = new SocketServer({ server });

wss.on("connection", function connection(ws) {
    console.log("connecting..");
    //on connect message
    ws.on("message", function incoming(message) {
        console.log("received: %s", message);
        connectedUsers.push(message);
    });
    ws.send("message from server at: " + new Date());
});