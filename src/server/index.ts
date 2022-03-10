import Koa from "koa";
import path from "path";
import fs from "fs/promises";
import { paths } from "../utils/common";
import * as React from "react";
import ReactDOMServer from "react-dom/server";
import Home from "../client/pages/Home";
import registerWs from "../server/websocket";
import compose from "./compose";
import error from "./middlewares/error";
import html from "./middlewares/html";

const PORT = process.env.PORT || "3010";

const server = new Koa();
const middlewares = [error(), html()];
server.use(compose(middlewares));

// server.use(async (ctx) => {
//   ctx.body = "hello";
// });

const start = async () => {
  try {
    await server.listen(PORT);
    console.log("Server running on prot: ", PORT);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

start();
