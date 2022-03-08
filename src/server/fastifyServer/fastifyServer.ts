import Fastify from "fastify";
import middie from "middie"
import fastifyIO from "fastify-socket.io";
import fastifyStatic from "fastify-static";
import path from "path";
import fs from "fs/promises";
import { paths } from "../utils/common";
import * as React from "react";
import ReactDOMServer from "react-dom/server";
import Home from "../client/Home";
import registerWs from "../server/websocket";

const PORT = process.env.PORT || "3010";

const server = Fastify({ logger: true });

// --- reigster websocket ---
// registerWs(server);
server.register(middie)

server.register(fastifyStatic, {
  root: paths.dist,
  // prefix: "/static/"
});

server.addHook("onRequest", async (req, res, next) => {
  console.log("======");
  console.log(req.url);
  // if (``)
});

server.get("/client/*", {}, async (req, res) => {
  console.log(req.url);
  const filePaths = req.url.split("/");
  return res.sendFile(
    filePaths[filePaths.length - 1],
    path.resolve(paths.dist, "client")
  );
});

server.get("/", {}, async (req, res) => {
  console.log("aaaa");
  // console.log(req);

  // const content = ReactDOMServer.renderToString(<Home />);
  // console.log(content);
  const html = `
    <html>
      <head></head>
      <body>
        <div id="root"></div>
        <script src="/client/index.js"></script>
      </body>
    </html>
  `;
  res.type("text/html");
  res.send(html);
  // res.send(content)
  // const staticHtml = (
  //   await fs.readFile(path.resolve(paths.static, "index.html"))
  // ).toString();
  // res.type("text/html");
  // res.send(staticHtml);
  // return res.sendFile("index.html")
});

const start = async () => {
  try {
    await server.listen(PORT);
    console.log("Server running on prot: ", PORT);
  } catch (error) {
    server.log.error(error);
    process.exit(1);
  }
};

start();
