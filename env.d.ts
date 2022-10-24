export interface ImportMetaEnv {
    VITE_TITLE?: string;
    VITE_GITHUB_USER?: string;
    GITHUB_USER?: string;
    VITE_GH_USER?: string;
    GH_USER?: string;
    VITE_GH_TOKEN?: string;
    GH_TOKEN?: string;
    VITE_ADMIN_KEY?: string;
    BASE_URL: string;
    MODE: string;
    PROD: boolean;
    DEV: boolean;
  };

export interface ImportMeta {
  env: ImportMetaEnv;
}