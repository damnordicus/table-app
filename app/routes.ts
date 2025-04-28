import {
    type RouteConfig,
    route,
    index,
    layout,
    prefix,
  } from "@react-router/dev/routes";
  
  export default [
    index("./routes/home.tsx"),
    route("filament-brands", "./routes/filament-brands.tsx"),
  
  ] satisfies RouteConfig;
  