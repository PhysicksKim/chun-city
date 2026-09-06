import axios, { AxiosHeaders } from 'axios';
import { V1Urls } from '@app/constants/V1Urls';
import { appEnv } from '@app/config/environment';

// Store injection to avoid circular dependency
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _store: any = null;

export const injectStore = (store: any) => {
  _store = store;
};

const sanitizeBaseUrl = (base: string) => {
  if (!base) return '';
  return base.endsWith('/') ? base.slice(0, -1) : base;
};

const httpClient = axios.create({
  baseURL: sanitizeBaseUrl(V1Urls.apiUrl),
  timeout: 10000,
});

httpClient.interceptors.request.use((config) => {
  config.baseURL = sanitizeBaseUrl(V1Urls.apiUrl);

  if (config.url && config.url.startsWith('http')) {
    return config;
  }

  const normalizedUrl = config.url?.startsWith('/')
    ? config.url
    : `/${config.url ?? ''}`;
  config.url = normalizedUrl;

  const headers =
    config.headers instanceof AxiosHeaders
      ? config.headers
      : new AxiosHeaders(config.headers);
  headers.set('X-Footballay-Env', appEnv);
  headers.set('Accept-Language', 'ko');

  // Cloudflare Access headers for dev environment
  if (appEnv === 'dev') {
    // Priority 1: Use env vars (dev server with .env.secret)
    let clientId = import.meta.env.VITE_CF_ACCESS_CLIENT_ID;
    let clientSecret = import.meta.env.VITE_CF_ACCESS_CLIENT_SECRET;

    // Priority 2: Use Redux state (build:dev with Settings tab input)
    if (!clientId || !clientSecret) {
      if (_store) {
        const state = _store.getState();
        clientId = state.cfAccess?.clientId;
        clientSecret = state.cfAccess?.clientSecret;
      }
    }

    if (clientId && clientSecret) {
      headers.set('CF-Access-Client-Id', clientId);
      headers.set('CF-Access-Client-Secret', clientSecret);
    }
  }

  config.headers = headers;

  return config;
});

httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('V1 API error:', error?.message ?? error);
    return Promise.reject(error);
  }
);

export default httpClient;
