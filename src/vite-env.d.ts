/// <reference types="vite/client" />
declare module '@fontsource/*' {}

declare module 'threads' {
  export function spawn<T>(worker: Worker): Promise<T>
}
declare module 'threads/worker' {
  export function expose(api: object): void
}
