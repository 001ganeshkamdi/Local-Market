const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

let googleMapsPromise: Promise<void> | null = null;

declare global {
  interface Window {
    google: typeof google;
  }
}

export async function loadGoogleMapsApi(): Promise<void> {
  if (!GOOGLE_MAPS_API_KEY) {
    console.warn("Google Maps API key missing");
    return;
  }

  /*
  ALREADY LOADED
  */

  if (window.google && window.google.maps) {
    return;
  }

  /*
  PREVENT DUPLICATE LOADS
  */

  if (googleMapsPromise) {
    return googleMapsPromise;
  }

  googleMapsPromise = new Promise<void>((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[data-google-maps="localmarket"]',
    );

    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(), { once: true });

      existingScript.addEventListener(
        "error",
        () => {
          reject(new Error("Google Maps failed to load"));
        },
        { once: true },
      );

      return;
    }

    const script = document.createElement("script");

    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&loading=async`;

    script.async = true;

    script.defer = true;

    script.dataset.googleMaps = "localmarket";

    script.onload = () => {
      setTimeout(() => {
        resolve();
      }, 500);
    };

    script.onerror = () => {
      reject(new Error("Google Maps failed to load"));
    };

    document.head.appendChild(script);
  });

  return googleMapsPromise;
}
