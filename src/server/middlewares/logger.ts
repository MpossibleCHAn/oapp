import Koa from "koa";

export default function logger(): Koa.Middleware {
  return async function (ctx, next) {
    console.log(ctx.method + " " + ctx.url);
    await next();
  };
}
