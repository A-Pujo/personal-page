import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home-3d-rev.tsx"),
  route("wedding", "routes/home2.tsx"),
  route("wedding-3d", "routes/home-3d.tsx"),
  route("wedding-3d-new", "routes/home.tsx"),
] satisfies RouteConfig;
