/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_NODE_URL: string
  readonly VITE_NETWORK_TYPE: number
  readonly VITE_ISSUER_PUBLIC_KEY: string
  readonly VITE_GENERATION_HASH: string
  readonly VITE_EPOCH_ADJUST: string
  readonly VITE_API_ENDPOINT: string
  readonly VITE_CREDENTIAL_PREFIX: string
  readonly VITE_APP_URL: string
  readonly VITE_EXPLORER_URL: string
  readonly VITE_FIREBASE_STORAGE_BUCKET: string
}
