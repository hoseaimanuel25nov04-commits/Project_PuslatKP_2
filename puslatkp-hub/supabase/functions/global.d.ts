// Global type declarations for Supabase Edge Functions (Deno Runtime)
declare module 'https://*' {
  const content: any
  export default content
  export const serve: (handler: (req: Request) => Promise<Response> | Response) => void
  export const createClient: any
}

declare namespace Deno {
  const env: {
    get(key: string): string | undefined
    set(key: string, value: string): void
  }
}
