type DevRoute =
  | {
      file: string;
      path?: string;
      index?: true;
      children?: DevRoute[];
      meta?: { label?: string };
    }
  | {
      file: string;
      children?: DevRoute[];
      meta?: { label?: string };
    };

type BreadcrumbItem = {
  path: string;
  label: string;
  children?: BreadcrumbItem[];
};

function getSegmentLabel(file: string): string {
  const parts = file.split("/");
  const name = parts[parts.length - 1]
    .replace(/\.\w+$/, "") // remove extension
    .replace(/^\[(.+)\]$/, ":$1") // convert [param] -> :param
    .replace(/_/g, " ")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
  return name || "Home";
}

function getSegmentPath(file: string): string {
  const parts = file.split("/");
  const name = parts[parts.length - 1].replace(/\.\w+$/, "");
  if (name === "index" || name === "home") return "";
  if (name === "404") return "*";
  if (/^\[.+\]$/.test(name)) return `:${name.slice(1, -1)}`;
  return name;
}

export default function buildBreadcrumbTree(
  routes: DevRoute[],
  basePath = ""
): BreadcrumbItem[] {
  return routes.map((r) => {
    const segment = r.index
      ? ""
      : r.path ?? getSegmentPath(r.file);

    const fullPath = basePath + (segment ? `/${segment}` : "");
    const label = r.meta?.label ?? getSegmentLabel(r.file);

    let children: BreadcrumbItem[] = [];

    if (r.children && Array.isArray(r.children)) {
      children = buildBreadcrumbTree(r.children, fullPath);
    }

    return {
      path: fullPath || "/",
      label,
      children: children.length ? children : undefined,
    };
  });
}
