import Koa from "koa";

export default function compose(middlewares: Koa.Middleware[]): Koa.Middleware {
  if (!Array.isArray(middlewares)) {
    throw new TypeError("Middleware stack must be an array!");
  }
  for (const fn of middlewares) {
    if (typeof fn !== "function") {
      throw new TypeError("Middleware must be composed of functions");
    }
  }
  return async (ctx, next) => {
    let index = -1;
    return dispatch(0);
    function dispatch(i: number): Promise<void> {
      if (i <= index) {
        return Promise.reject(new Error("next() call multiple times"));
      }
      index = i;
      let fn = middlewares[i];
      if (i === middlewares.length) {
        fn = next;
      }
      if (!fn) {
        return Promise.resolve();
      }
      try {
        return Promise.resolve(fn(ctx, dispatch.bind(null, i + 1)));
      } catch (error) {
        return Promise.reject(error);
      }
    }
  };
}
