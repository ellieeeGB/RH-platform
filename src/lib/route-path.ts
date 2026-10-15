/** Next static exports use trailing slashes; navigation must share one route identity. */
export function normalizePathname(pathname: string | null | undefined): string {
  return (pathname ?? "/").replace(/\/+$/, "") || "/";
}
