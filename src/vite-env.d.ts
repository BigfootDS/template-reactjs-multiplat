/// <reference types="vite/client" />

interface AppMetadata {
  applicationName: string
  platformName: string
  platformType: string
  productName: string
  productVersion: string
  version: string
}

declare const __APP_METADATA__: AppMetadata
