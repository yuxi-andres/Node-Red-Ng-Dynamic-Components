var http = require('http');
var express = require("express");
var RED = require("node-red");

async function bootstrap() {
    // Create an Express app
    var app = express();

    // Add a simple route for static content served from 'public'
    app.use("/", express.static("./../dynamic-components/dist/dynamic-json-components"));

    // Create a server
    var server = http.createServer(app);

    // Create the settings object - see default settings.js file for other options
    var settings = {
        httpAdminRoot: "/red",
        httpNodeRoot: "/api",
        userDir: "./../flows",
        functionGlobalContext: {},
        flowFile: "flows.json"// enables global context
    };

    // Initialise the runtime with a server and settings
    RED.init(server, settings);

    // Serve the http nodes UI from /api
    app.use(settings.httpNodeRoot, RED.httpNode);
    // Serve the editor UI from /red
    app.use(settings.httpAdminRoot, RED.httpAdmin);

    await server.listen(4000);

    // Start the runtime
    await RED.start();
    await RED.nodes.loadFlows();

    app.use("/button", (req, res) => {
        const buttonNode = RED.nodes.getNode('e8eacc0b.1b204');
        const textNode = RED.nodes.getNode('c82c3ef4.64c6d');
        textNode.once('input', function (msg) {
            console.log('input node text msg', msg);
            res.status(200).json(msg);
        });
        buttonNode.send(req.query);
    });

    app.use("/keypad", (req, res) => {
        const buttonNodeKey = RED.nodes.getNode('be0520d2.d3e0b');
        const textNodeKey = RED.nodes.getNode("c35464dc.3910a8");
        textNodeKey.once('input', function (msg) {
            console.log('input node text msg', msg);
            res.status(200).json(msg);
        });
        buttonNodeKey.send(req.query);
    });
}

bootstrap();