export {};

declare global {
  interface Window {
    fbq?: (
      action: string,
      event: string,
      params?: Record<string, string | number>
    ) => void;
  }
}
