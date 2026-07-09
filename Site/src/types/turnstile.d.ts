interface TurnstileApi {
  render: (container: string | HTMLElement, options?: Record<string, unknown>) => string;
  reset: (widgetId?: string) => void;
}

interface Window {
  turnstile?: TurnstileApi;
}
