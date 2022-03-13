import * as React from "react";
import Home from "./pages/Home";
import { Nav } from "./pages/Nav";
import * as Comlink from "comlink";
import useWebWorker from "./hooks/useWebWorker";
import { AppRoutesProps } from "./routes";
import { RouteObject, useRoutes } from "react-router-dom";

// const Hom = React.lazy(() => import("./pages/Home"))

const App = () => {
  const routes = [
    {
      path: "/",
      page: () => import("./pages/Home"),
    },
    {
      path: "/users",
      page: () => import("./pages/Users"),
    },
  ];

  console.log(routes);

  return (
    <div>
      <AppRoutes routes={routes} />
    </div>
  );
};

export function AppRoutes(props: {
  routes: AppRoutesProps[];
}): React.ReactElement | null {
  const { routes } = props;
  const routeObjects: RouteObject[] = [];
  for (const route of routes) {
    const routeObject: RouteObject = { ...route };
    const Component = React.lazy(
      async (): Promise<{ default: React.ComponentType }> => {
        console.log(route);
        const page = await route.page!();
        console.log(page);
        return page;
      }
    );
    routeObject.element = (
      <React.Suspense fallback={null}>
        <Component />
      </React.Suspense>
    );
    routeObjects.push(routeObject);
  }
  return useRoutes(routeObjects);
}

export function wrapRoutes(
  routes: AppRoutesProps[]
): React.ReactElement | null {
  return null;
}

export default App;
