# iOS safe-area note

The Capacitor iOS shell uses `contentInset: "automatic"` so the `WKWebView` scroll view adjusts for the status-bar and Dynamic Island safe area. Fixed overlays retain CSS `env(safe-area-inset-*)` handling.

Source: https://capacitorjs.com/docs/config
