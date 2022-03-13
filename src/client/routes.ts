import * as React from "react";
import {
  RouteObject,
  RouteProps as ReactRouteProps,
  useRoutes,
} from "react-router-dom";

export interface AppRoutesProps {
  id?: string;
  path: string;
  page?: () => Promise<{ default: React.FunctionComponent<any> | React.ComponentClass<any> }>;
  children?: AppRoutesProps[];
}


