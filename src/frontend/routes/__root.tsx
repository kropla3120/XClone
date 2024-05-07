import { createRootRoute, createRootRouteWithContext, Link, Outlet, RouteContext } from "@tanstack/react-router";

export const Route = createRootRouteWithContext<RouteContext>()({
  component: () => (
    <>
      <Outlet />
      {/* <TanStackRouterDevtools /> */}
    </>
  ),
});
