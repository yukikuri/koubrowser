import { Env } from "@common/env";

let baseUrl = 'https://api.kanlog.info';
if (Env.isTestMode) {
  baseUrl = 'http://test.api.kanlog.info';
}

export const fetchWithBaseUrl = async <T>(
  url: string,
  options: RequestInit,
): Promise<T> => {
  const fullUrl = baseUrl ? new URL(url, baseUrl).toString() : url;
  // options.headers = {
  //   ...options.headers,
  //   'Prefer': 'code=500',
  // };
  const res = await fetch(fullUrl, options);

  const body = [204, 205, 304].includes(res.status) ? null : await res.text();
  const data = body ? JSON.parse(body) : {};

  return {
    data,
    status: res.status,
    headers: res.headers,
  } as T;
};
