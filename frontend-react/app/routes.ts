import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("about", "routes/about.tsx"),
  route("thoughts", "routes/thoughts.tsx"),
  route("thoughts/:slug", "routes/thoughts.$slug.tsx"),
  route("works", "routes/works.tsx"),
  route("works/:slug", "routes/works.$slug.tsx"),
  route("analytics", "routes/analytics.tsx"),
  route("analytics/:slug", "routes/analytics.$slug.tsx"),
  route("admin", "routes/admin.tsx"),
  route("admin/dashboard", "routes/admin.dashboard.tsx"),
  route("admin/dashboard/thoughts", "routes/admin.dashboard.thoughts.tsx"),
  route("admin/dashboard/thoughts/new", "routes/admin.dashboard.thoughts.new.tsx"),
  route("admin/dashboard/thoughts/:slug", "routes/admin.dashboard.thoughts.$slug.tsx"),
  route("admin/dashboard/works", "routes/admin.dashboard.works.tsx"),
  route("admin/dashboard/works/new", "routes/admin.dashboard.works.new.tsx"),
  route("admin/dashboard/works/:slug", "routes/admin.dashboard.works.$slug.tsx"),
  route("admin/dashboard/analytics", "routes/admin.dashboard.analytics.tsx"),
  route("admin/dashboard/analytics/new", "routes/admin.dashboard.analytics.new.tsx"),
  route("admin/dashboard/analytics/:slug", "routes/admin.dashboard.analytics.$slug.tsx"),
] satisfies RouteConfig;
