import Koa from "koa";
import fs from "fs/promises"
import path from "path"
import { paths } from './../../utils/common';

export default function html(): Koa.Middleware {
  return async (ctx, next) => {
		if (ctx.url.startsWith("/client/")) {
			  const filePaths = ctx.url.split("/");
				const file = await fs.readFile(path.resolve(paths.dist, "client", filePaths[filePaths.length - 1],))
				ctx.body = file
				return
		}
		const html = await fs.readFile(path.resolve(paths.src, "index.html"))
		ctx.type = "text/html"
		ctx.body = html
		await next()
	};
}
