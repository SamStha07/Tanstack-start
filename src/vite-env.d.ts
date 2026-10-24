/// <reference types="vite/client" />

// Types for our own environment variables (see /environment-variables).
interface ImportMetaEnv {
  readonly VITE_APP_NAME?: string
}
interface ImportMeta {
  readonly env: ImportMetaEnv
}
