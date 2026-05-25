import type {
  ShopkeeperSession,
  AssistantChatResponse,
  Coordinates,
  Product,
  ProductDraft,
  Shop,
  ShopDraft,
  ShopSearchResult,
} from "@/types";

const API_BASE = import.meta.env.VITE_API_BASE ?? "/api";

function toFiniteNumber(value: unknown): number | null {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function normalizeShop(shop: Shop): Shop {
  return {
    ...shop,
    id: shop.id ?? "",
    ownerName: shop.ownerName ?? "",
    email: shop.email ?? "",
    shopName: shop.shopName ?? "Local shop",
    shopLocation: shop.shopLocation ?? "Location unavailable",
    latitude: toFiniteNumber(shop.latitude),
    longitude: toFiniteNumber(shop.longitude),
  };
}

function normalizeProduct(product: Product): Product {
  return {
    ...product,
    price: toFiniteNumber(product.price) ?? 0,
    originalPrice: toFiniteNumber(product.originalPrice),
    currency: product.currency ?? "INR",
    description: product.description ?? "",
    category: product.category ?? "Uncategorized",
    userId: product.userId ?? "",
    type: product.type ?? "",
    attributes: product.attributes ?? null,
    images: Array.isArray(product.images) ? product.images : [],
    shopId: product.shopId ?? product.userId ?? "",
    shopName: product.shopName ?? "Local shop",
    location: product.location ?? "Location unavailable",
    latitude: toFiniteNumber(product.latitude),
    longitude: toFiniteNumber(product.longitude),
    distanceKm: toFiniteNumber(product.distanceKm),
  };
}

function normalizeShopSearchResult(result: ShopSearchResult): ShopSearchResult {
  return {
    ...result,
    shopId: result.shopId ?? "",
    shopName: result.shopName ?? "Local shop",
    location: result.location ?? "Location unavailable",
    latitude: toFiniteNumber(result.latitude),
    longitude: toFiniteNumber(result.longitude),
    distanceKm: toFiniteNumber(result.distanceKm),
    lowestPrice: toFiniteNumber(result.lowestPrice),
    products: (Array.isArray(result.products) ? result.products : []).map((product) => ({
      ...product,
      price: toFiniteNumber(product.price) ?? 0,
      originalPrice: toFiniteNumber(product.originalPrice),
      currency: product.currency ?? "INR",
      description: product.description ?? "",
      category: product.category ?? "Uncategorized",
      type: product.type ?? "",
      attributes: product.attributes ?? null,
      images: Array.isArray(product.images) ? product.images : [],
    })),
  };
}

function parseAttributes(attributes: string): Record<string, unknown> | null {
  if (!attributes.trim()) {
    return null;
  }

  try {
    return JSON.parse(attributes) as Record<string, unknown>;
  } catch {
    throw new Error("Attributes must be valid JSON.");
  }
}

function parseImages(images: string): string[] {
  return images
    .split(/\r?\n|,/)
    .map((value) => value.trim())
    .filter(Boolean);
}

async function parseJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Request failed");
  }

  return response.json() as Promise<T>;
}

export async function fetchShops(): Promise<Shop[]> {
  const shops = await parseJson<Shop[]>(await fetch(`${API_BASE}/shops`));
  return shops.map(normalizeShop);
}

export async function fetchShop(shopId: string): Promise<Shop> {
  return normalizeShop(await parseJson(await fetch(`${API_BASE}/shops/${shopId}`)));
}

export async function createShop(draft: ShopDraft): Promise<Shop> {
  return parseJson(
    await fetch(`${API_BASE}/shops`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ownerName: draft.ownerName,
        email: draft.email,
        password: draft.password,
        shopName: draft.shopName,
        shopLocation: draft.shopLocation,
        latitude: draft.latitude.trim() ? Number(draft.latitude) : null,
        longitude: draft.longitude.trim() ? Number(draft.longitude) : null,
      }),
    }),
  );
}

export async function loginShopkeeper(
  email: string,
  password: string,
): Promise<ShopkeeperSession> {
  return parseJson(
    await fetch(`${API_BASE}/auth/shopkeeper/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    }),
  );
}

export async function fetchProducts(): Promise<Product[]> {
  const products = await parseJson<Product[]>(
    await fetch(`${API_BASE}/products`),
  );
  return products.map(normalizeProduct);
}

export async function fetchProductsByShop(shopId: string): Promise<Product[]> {
  const products = await parseJson<Product[]>(
    await fetch(`${API_BASE}/shops/${shopId}/products`),
  );
  return products.map(normalizeProduct);
}

export async function searchShops(
  query: string,
  latitude?: number,
  longitude?: number,
): Promise<ShopSearchResult[]> {
  const params = new URLSearchParams({ query });
  if (latitude !== undefined && longitude !== undefined) {
    params.set("latitude", String(latitude));
    params.set("longitude", String(longitude));
  }

  const results = await parseJson<ShopSearchResult[]>(
    await fetch(`${API_BASE}/shops/search?${params.toString()}`),
  );
  return results.map(normalizeShopSearchResult);
}

export async function chatWithAssistant(
  message: string,
  userLocation: Coordinates | null,
): Promise<AssistantChatResponse> {
  const response = await parseJson<AssistantChatResponse>(
    await fetch(`${API_BASE}/assistant/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message,
        latitude: userLocation?.latitude ?? null,
        longitude: userLocation?.longitude ?? null,
      }),
    }),
  );

  return {
    response: response.response ?? "",
    products: (Array.isArray(response.products) ? response.products : []).map(normalizeProduct),
    shops: (Array.isArray(response.shops) ? response.shops : []).map(normalizeShopSearchResult),
  };
}

export async function createProduct(draft: ProductDraft): Promise<Product> {
  return normalizeProduct(
    await parseJson(
      await fetch(`${API_BASE}/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: draft.name,
          price: Number(draft.price),
          originalPrice: draft.originalPrice.trim()
            ? Number(draft.originalPrice)
            : null,
          currency: draft.currency.trim() || null,
          description: draft.description,
          category: draft.category,
          type: draft.type.trim() || null,
          attributes: parseAttributes(draft.attributes),
          images: parseImages(draft.images),
          userId: draft.userId,
        }),
      }),
    ),
  );
}

export async function updateProduct(
  productId: string,
  draft: ProductDraft,
): Promise<Product> {
  return normalizeProduct(
    await parseJson(
      await fetch(`${API_BASE}/products/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: draft.name,
          price: Number(draft.price),
          originalPrice: draft.originalPrice.trim()
            ? Number(draft.originalPrice)
            : null,
          currency: draft.currency.trim() || null,
          description: draft.description,
          category: draft.category,
          type: draft.type.trim() || null,
          attributes: parseAttributes(draft.attributes),
          images: parseImages(draft.images),
          userId: draft.userId,
        }),
      }),
    ),
  );
}

export async function deleteProduct(productId: string): Promise<void> {
  const response = await fetch(`${API_BASE}/products/${productId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Delete failed");
  }
}
