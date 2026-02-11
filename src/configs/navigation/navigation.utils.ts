import type { RouteObject } from "react-router-dom";
import type { ComponentType } from "react";
import { ROUTES, type RouteKey } from "./navigation.constants";

const route = (path: RouteKey, Component?: ComponentType): RouteObject => ({
  path: ROUTES[path],
  Component,
});

const layout = (
  Component: ComponentType,
  children: RouteObject[],
  path?: string,
): RouteObject => ({
  Component,
  children,
  path,
});

export const navigationUtils = {
  route,
  layout,
};
