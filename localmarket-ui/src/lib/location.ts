import type { Coordinates, Product, Shop, ShopSearchResult } from "@/types";

export function parseCoordinateInput(latitude: string, longitude: string): Coordinates | null {
  const parsedLatitude = Number(latitude);
  const parsedLongitude = Number(longitude);

  if (Number.isNaN(parsedLatitude) || Number.isNaN(parsedLongitude)) {
    return null;
  }

  return { latitude: parsedLatitude, longitude: parsedLongitude };
}

export function calculateDistanceKm(origin: Coordinates, destination: Coordinates): number {
  const earthRadiusKm = 6371;
  const latDistance = toRadians(destination.latitude - origin.latitude);
  const lonDistance = toRadians(destination.longitude - origin.longitude);
  const startLat = toRadians(origin.latitude);
  const endLat = toRadians(destination.latitude);

  const haversine =
    Math.sin(latDistance / 2) * Math.sin(latDistance / 2) +
    Math.sin(lonDistance / 2) *
      Math.sin(lonDistance / 2) *
      Math.cos(startLat) *
      Math.cos(endLat);

  return Math.round(earthRadiusKm * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine)) * 10) / 10;
}

export function buildNavigationUrl(origin: Coordinates | null, destination: Coordinates | null): string {
  if (!destination) {
    return "#";
  }

  const url = new URL("https://www.google.com/maps/dir/");
  url.searchParams.set("api", "1");
  url.searchParams.set("destination", `${destination.latitude},${destination.longitude}`);
  url.searchParams.set("travelmode", "driving");

  if (origin) {
    url.searchParams.set("origin", `${origin.latitude},${origin.longitude}`);
  }

  return url.toString();
}

export function groupProductsByShop(products: Product[], userLocation: Coordinates | null, shops: Shop[]): ShopSearchResult[] {
  const shopMap = new Map<string, ShopSearchResult>();

  products.forEach((product) => {
    const existing = shopMap.get(product.shopId);
    const distanceKm =
      userLocation && product.latitude !== null && product.longitude !== null
        ? calculateDistanceKm(userLocation, {
            latitude: product.latitude,
            longitude: product.longitude,
          })
        : product.distanceKm;

    if (existing) {
      existing.products.push({
        productId: product.productId,
        productName: product.productName,
        price: product.price,
        originalPrice: product.originalPrice,
        currency: product.currency,
        description: product.description,
        category: product.category,
        type: product.type,
        attributes: product.attributes,
        images: product.images,
      });
      existing.lowestPrice = Math.min(existing.lowestPrice ?? product.price, product.price);
      return;
    }

    const shop = shops.find((entry) => entry.id === product.shopId);
    shopMap.set(product.shopId, {
      shopId: product.shopId,
      shopName: product.shopName,
      location: product.location,
      latitude: product.latitude ?? shop?.latitude ?? null,
      longitude: product.longitude ?? shop?.longitude ?? null,
      distanceKm,
      lowestPrice: product.price,
      products: [
        {
          productId: product.productId,
          productName: product.productName,
          price: product.price,
          originalPrice: product.originalPrice,
          currency: product.currency,
          description: product.description,
          category: product.category,
          type: product.type,
          attributes: product.attributes,
          images: product.images,
        },
      ],
    });
  });

  return Array.from(shopMap.values()).map((shop) => ({
    ...shop,
    products: [...shop.products].sort((left, right) => left.price - right.price),
  }));
}

function toRadians(value: number): number {
  return (value * Math.PI) / 180;
}
