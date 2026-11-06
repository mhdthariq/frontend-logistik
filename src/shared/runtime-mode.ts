export type RuntimeMode = "development" | "preview" | "production";

const configuredMode = import.meta.env.VITE_RUNTIME_MODE;
if (configuredMode && !["development", "preview", "production"].includes(configuredMode)) {
  throw new Error("VITE_RUNTIME_MODE must be development, preview or production.");
}
export const RUNTIME_MODE: RuntimeMode = configuredMode ||
  (import.meta.env.DEV ? "development" : import.meta.env.MODE === "preview" ? "preview" : "production");
export const IS_DEV = RUNTIME_MODE === "development";
export const IS_PREVIEW = RUNTIME_MODE === "preview";
export const IS_PROD = RUNTIME_MODE === "production";
export const SHOW_DEMO_ACCOUNTS = IS_DEV || IS_PREVIEW;
export const SHOW_CORP_ID = !IS_DEV;
export const SHOW_TRACKING_LINK = IS_DEV || IS_PREVIEW;
export const MODE_LABEL = IS_DEV ? "DEV Mode" : IS_PREVIEW ? "PREVIEW Mode" : "Production";
export const PREVIEW_CORP_ID = import.meta.env.VITE_PREVIEW_CORP_ID ?? "TRIAL";

export {
  RUNTIME_MODE as NEXT_PUBLIC_RUNTIME_MODE,
  IS_DEV as NEXT_PUBLIC_IS_DEV,
  IS_PREVIEW as NEXT_PUBLIC_IS_PREVIEW,
  IS_PROD as NEXT_PUBLIC_IS_PROD,
  SHOW_DEMO_ACCOUNTS as NEXT_PUBLIC_SHOW_DEMO_ACCOUNTS,
  SHOW_CORP_ID as NEXT_PUBLIC_SHOW_CORP_ID,
  SHOW_TRACKING_LINK as NEXT_PUBLIC_SHOW_TRACKING_LINK,
  MODE_LABEL as NEXT_PUBLIC_MODE_LABEL,
  PREVIEW_CORP_ID as NEXT_PUBLIC_PREVIEW_CORP_ID,
};
