/// <reference types="vite/client" />

export {};

declare global {
  namespace NodeJS {
    interface Timeout {}
    interface Timer {}
  }
}
