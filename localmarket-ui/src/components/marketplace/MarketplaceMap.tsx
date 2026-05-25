import { useEffect, useRef, useState } from "react";

import type { Coordinates, ShopSearchResult } from "@/types";

import { loadGoogleMapsApi } from "@/lib/googleMaps";

type MarketplaceMapProps = {
  userLocation: Coordinates | null;
  shops: ShopSearchResult[];
  selectedShopId?: string | null;
  showRoute?: boolean;
  emptyMessage: string;
};

export function MarketplaceMap({ userLocation, shops }: MarketplaceMapProps) {
  const mapRef = useRef<HTMLDivElement | null>(null);

  const mapInstanceRef =
    useRef<google.maps.Map | null>(null);

  const markersRef = useRef<
    google.maps.Marker[]
  >([]);

  const [mapStatus, setMapStatus] = useState("Loading map...");

  const [isLoaded, setIsLoaded] = useState(false);

  /*
  ============================================
  INITIALIZE MAP ONLY ONCE
  ============================================
  */

  useEffect(() => {
    let mounted = true;

    async function setupMap() {
      try {
        setMapStatus("Loading Google Maps...");

        await loadGoogleMapsApi();

        if (!mounted) return;

        if (!window.google?.maps) {
          setMapStatus("Google Maps unavailable");
          return;
        }

        if (!mapRef.current) {
          setMapStatus("Map container missing");
          return;
        }

        /*
        PREVENT DUPLICATE MAPS
        */

        if (mapInstanceRef.current) {
          setIsLoaded(true);
          return;
        }
        const maps = window.google?.maps;
        
        if (!maps || !maps.Map) {
          setMapStatus("Google Maps not ready");
          return;
        }

        /*
        DEFAULT CENTER
        */

        let center = {
          lat: 18.5204,
          lng: 73.8567,
        };

        /*
        USER LOCATION
        */

        if (userLocation) {
          center = {
            lat: userLocation.latitude,
            lng: userLocation.longitude,
          };
        }

        /*
        CREATE MAP
        */

        const map = new window.google.maps.Map(
          mapRef.current,
          {
          center,
          zoom: 12,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        });

        mapInstanceRef.current = map;

        setIsLoaded(true);

        setMapStatus("Map loaded");
      } catch (error) {
        console.error("MAP ERROR:", error);
        
        if (error instanceof Error) {
          setMapStatus(error.message);
        } else {
          setMapStatus("Failed to load map");
        }
      }
    }

    setupMap();

    return () => {
      mounted = false;
    };
  }, [userLocation]);

  /*
  ============================================
  UPDATE MARKERS
  ============================================
  */

  useEffect(() => {
    if (!window.google?.maps || !mapInstanceRef.current) {
      return;
    }

    const maps = window.google.maps

    /*
    REMOVE OLD MARKERS
    */

    markersRef.current.forEach((marker) => marker.setMap(null));

    markersRef.current = [];

    const bounds = new maps.LatLngBounds();

    /*
    USER MARKER
    */

    if (userLocation) {
      const marker = new maps.Marker({
        map: mapInstanceRef.current,

        position: {
          lat: userLocation.latitude,
          lng: userLocation.longitude,
        },

        title: "Your Location",
      });

      markersRef.current.push(marker);

      bounds.extend({
        lat: userLocation.latitude,
        lng: userLocation.longitude,
      });
    }

    /*
    SHOP MARKERS
    */

    shops.forEach((shop) => {
      if (shop.latitude === null || shop.longitude === null) {
        return;
      }

      const marker = new maps.Marker({
        map: mapInstanceRef.current,

        position: {
          lat: shop.latitude,
          lng: shop.longitude,
        },

        title: shop.shopName,
      });

      markersRef.current.push(marker);

      bounds.extend({
        lat: shop.latitude,
        lng: shop.longitude,
      });
    });

    /*
    AUTO FIT
    */

    if (!bounds.isEmpty()) {
      mapInstanceRef.current.fitBounds(bounds, 80);
    }
  }, [shops, userLocation]);


  return (
    <div className="relative h-full min-h-[650px] w-full overflow-hidden rounded-[32px] bg-slate-100">
      {/* GOOGLE MAP */}
      <div ref={mapRef} className="h-full w-full" />

      {/* FALLBACK */}
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-100 text-sm text-slate-500">
          {mapStatus}
        </div>
      )}
    </div>
  );
}
