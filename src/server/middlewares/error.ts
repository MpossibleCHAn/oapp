import Koa from "koa"
import Boom from "@hapi/boom"

export default function error():Koa.Middleware {
	return async (ctx, next) => {
		try {
			await next()
		} catch (error) {
			console.log(error);
			console.log(Boom.isBoom(error));
		}
	}
}
