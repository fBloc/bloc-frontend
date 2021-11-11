import qs from "query-string";
export function useQuery<T extends Record<string, string | undefined>>() {
  return qs.parseUrl(window.location.href).query as T;
}
