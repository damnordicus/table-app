import {
    type RouteConfig,
    route,
    index,
    layout,
    prefix,
  } from "@react-router/dev/routes";
  
  export default [
    index("./routes/home.tsx", { meta: { label: "Home" } }),
  
    layout("./routes/settings/_layout.tsx", { meta: { label: "Settings" } }, [
      index("./routes/settings/profile.tsx", { meta: { label: "Profile" } }),
      route("security", "./routes/settings/security.tsx", { meta: { label: "Security" } }),
      route("notifications", "./routes/settings/notifications.tsx", { meta: { label: "Notifications" } }),
    ]),
  
    route("products", "./routes/products/index.tsx", { meta: { label: "Products" } }),
    layout("./routes/products/[productId]/_layout.tsx", { meta: { label: "Product" } }, [
      index("./routes/products/[productId]/detail.tsx", { meta: { label: "Details" } }),
      route("reviews", "./routes/products/[productId]/reviews.tsx", { meta: { label: "Reviews" } }),
    ]),
  
    route("*", "./routes/error.tsx", { meta: { label: "Not Found" } }),
  ] satisfies RouteConfig;
  