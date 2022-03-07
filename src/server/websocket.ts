import fs from "fs/promises";
import path from "path";
import { setTimeout } from "timers";
import Fastify, { FastifyInstance } from "fastify";
import fastifyIO from "fastify-socket.io";
import { format } from "date-fns";
import fastifyStatic from "fastify-static";
import { paths } from "../utils/common";

export default function registerWs(server: FastifyInstance) {
  try {
    server.register(fastifyIO);
    server.register(fastifyStatic, {
      root: path.join(__dirname, "../static"),
      // prefix: "/static/"
    });

    server.get("/ws", async (req, res) => {
      const staticHtml = (
        await fs.readFile(path.resolve(paths.static, "ws.html"))
      ).toString();
      res.type("text/html");
      res.send(staticHtml);
    });
    server.ready().then(() => registerWsEvent(server));
    server.io;
  } catch (error) {
    server.log.error(error);
  }
}

function updateMsg(server: FastifyInstance) {
  const now = Date.now();
  const randomId = now.toString(32);
  const msg = `${format(now, "yyyy-MM-dd HH:mm:ss")} - ${randomId}`;
  server.io.emit("update", {
    data: msg,
  });
  setTimeout(() => updateMsg(server), 2000);
}

function registerWsEvent(server: FastifyInstance) {
  server.io.on("connection", (socket) => {
    server.log.info(`----- ${socket.id} is connected -----`);
    socket.on("disconnect", () => {
      server.log.info(`---------- ${socket.id} disconnect -----------`);
    });
    socket.on("chat", (msg) => {
      const randomId = Date.now().toString(32);
      server.log.info(msg);
      socket.emit(msg + " " + randomId);
    });
    updateMsg(server);
  });
}
