/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_ORIGIN?: string;
  readonly VITE_COMPANY_NAME?: string;
  readonly VITE_RUNTIME_MODE?: "development" | "preview" | "production";
  readonly VITE_PREVIEW_CORP_ID?: string;
}
