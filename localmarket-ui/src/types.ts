export type Coordinates = {
  latitude: number;
  longitude: number;
};

export type Shop = {
  id: string;
  ownerName: string;
  email: string;
  shopName: string;
  shopLocation: string;
  latitude: number | null;
  longitude: number | null;
};

export type Product = {
  productId: string;
  productName: string;
  price: number;
  originalPrice: number | null;
  currency: string | null;
  description: string;
  category: string;
  userId: string;
  type: string | null;
  attributes: Record<string, unknown> | null;
  images: string[];
  shopId: string;
  shopName: string;
  location: string;
  latitude: number | null;
  longitude: number | null;
  distanceKm: number | null;
};

export type MatchingProduct = {
  productId: string;
  productName: string;
  price: number;
  originalPrice: number | null;
  currency: string | null;
  description: string;
  category: string;
  type: string | null;
  attributes: Record<string, unknown> | null;
  images: string[];
};

export type ShopSearchResult = {
  shopId: string;
  shopName: string;
  location: string;
  latitude: number | null;
  longitude: number | null;
  distanceKm: number | null;
  lowestPrice: number | null;
  products: MatchingProduct[];
};

export type AssistantChatResponse = {
  response: string;
  products: Product[];
  shops: ShopSearchResult[];
};

export type ProductDraft = {
  name: string;
  price: string;
  originalPrice: string;
  currency: string;
  description: string;
  category: string;
  type: string;
  attributes: string;
  images: string;
  userId: string;
};

export type ShopDraft = {
  ownerName: string;
  email: string;
  password: string;
  shopName: string;
  shopLocation: string;
  latitude: string;
  longitude: string;
};

export type BuyerSession = {
  role: "buyer";
  name: string;
  email: string;
};

export type ShopkeeperSession = {
  role: "shopkeeper";
  id: string;
  ownerName: string;
  email: string;
  shopName: string;
  shopLocation: string;
  latitude: number | null;
  longitude: number | null;
};

export type AuthSession = BuyerSession | ShopkeeperSession;
