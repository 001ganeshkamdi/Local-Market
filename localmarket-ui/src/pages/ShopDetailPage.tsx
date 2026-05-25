import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ExternalLink,
  MapPin,
  Store,
  Star,
  ShoppingCart,
  ShieldCheck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import { fetchProductsByShop, fetchShop } from "@/lib/api";
import { buildNavigationUrl } from "@/lib/location";

import { MarketplaceMap } from "@/components/marketplace/MarketplaceMap";

import type {
  Coordinates,
  Product,
  Shop,
  ShopSearchResult,
} from "@/types";

export function ShopDetailPage() {
  const { id } = useParams();

  const [shop, setShop] = useState<Shop | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [userLocation, setUserLocation] =
    useState<Coordinates | null>(null);

  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("Loading shop...");

  useEffect(() => {
    async function loadShop() {
      if (!id) {
        setLoading(false);
        setStatus("Shop id is missing.");
        return;
      }

      setLoading(true);
      try {
        const [shopData, productData] = await Promise.all([
          fetchShop(id),
          fetchProductsByShop(id),
        ]);

        setShop(shopData);
        setProducts(Array.isArray(productData) ? productData : []);
        setStatus("Shop loaded.");
      } catch (error) {
        console.error(error);
        setShop(null);
        setProducts([]);
        setStatus("Unable to load this shop.");
      } finally {
        setLoading(false);
      }
    }

    loadShop();
  }, [id]);

  useEffect(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (position) =>
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }),
      () => undefined,
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  const mapShops = useMemo<ShopSearchResult[]>(() => {
    if (!shop) return [];

    const validPrices = products
      .map((product) => product.price)
      .filter((price) => Number.isFinite(price));

    return [
      {
        shopId: shop.id,
        shopName: shop.shopName,
        location: shop.shopLocation,
        latitude: shop.latitude,
        longitude: shop.longitude,
        distanceKm: null,
        lowestPrice: validPrices.length > 0 ? Math.min(...validPrices) : null,

        products: products.map((product) => ({
          productId: product.productId,
          productName: product.productName,
          price: product.price,
          originalPrice: product.originalPrice,
          currency: product.currency,
          description: product.description,
          category: product.category,
          userId: product.userId,
          type: product.type,
          attributes: product.attributes,
          images: product.images,
        })),
      },
    ];
  }, [products, shop]);

  if (!loading && !shop) {
    return (
      <div className="min-h-screen bg-[#f7f8fa]">
        <section className="page-error-state">
          <Store className="size-10" />
          <h1>Shop not available</h1>
          <p>{status}</p>
          <div>
            <Button asChild>
              <Link to="/buyer">Back to marketplace</Link>
            </Button>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f8fa]">
      {/* HERO SECTION */}
      <section className="bg-white border-b sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <p className="text-sm text-blue-600 font-semibold uppercase tracking-wider">
              Trusted Marketplace Seller
            </p>

            <h1 className="text-3xl font-bold text-gray-900 mt-1">
              {shop?.shopName ?? "Loading..."}
            </h1>

            <div className="flex items-center gap-3 mt-2 text-gray-600 flex-wrap">
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {shop?.shopLocation ?? "Location loading"}
              </span>

              <span className="flex items-center gap-1 text-amber-500">
                <Star className="w-4 h-4 fill-amber-500" />
                4.8 Seller Rating
              </span>

              <span className="flex items-center gap-1 text-green-600">
                <ShieldCheck className="w-4 h-4" />
                Verified Seller
              </span>

              <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-500">
                {status}
              </span>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="rounded-xl px-5"
              asChild
            >
              <Link to="/buyer">Back</Link>
            </Button>

            <Button
              className="rounded-xl px-5"
              asChild
              disabled={
                !shop ||
                shop.latitude === null ||
                shop.longitude === null
              }
            >
              <a
                href={buildNavigationUrl(
                  userLocation,
                  shop &&
                    shop.latitude !== null &&
                    shop.longitude !== null
                    ? {
                        latitude: shop.latitude,
                        longitude: shop.longitude,
                      }
                    : null
                )}
                target="_blank"
                rel="noreferrer"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Navigate
              </a>
            </Button>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* TOP GRID */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* MAP */}
          <div className="xl:col-span-2">
            <Card className="rounded-2xl border-0 shadow-md overflow-hidden">
              <CardContent className="p-0">
                <MarketplaceMap
                  userLocation={userLocation}
                  shops={mapShops}
                  selectedShopId={shop?.id ?? null}
                  showRoute
                  emptyMessage="Allow location access to calculate route."
                />
              </CardContent>
            </Card>
          </div>

          {/* SHOP INFO */}
          <div>
            <Card className="rounded-2xl border-0 shadow-md">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-5">
                  Shop Information
                </h2>

                <div className="space-y-5">
                  <div className="flex items-center gap-3">
                    <Store className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-500">
                        Owner
                      </p>
                      <p className="font-semibold">
                        {shop?.ownerName}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-red-500" />
                    <div>
                      <p className="text-sm text-gray-500">
                        Location
                      </p>
                      <p className="font-semibold">
                        {shop?.shopLocation}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <ShoppingCart className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="text-sm text-gray-500">
                        Products
                      </p>
                      <p className="font-semibold">
                        {products.length} Listed
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* PRODUCTS SECTION */}
        <section className="mt-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">
                All Products
              </h2>

              <p className="text-gray-500 mt-1">
                Explore everything from this seller
              </p>
            </div>
          </div>

          {/* PRODUCT GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              (() => {
                const price =
                  typeof product.price === "number" && Number.isFinite(product.price)
                    ? product.price
                    : 0;
                const originalPrice =
                  typeof product.originalPrice === "number" &&
                  Number.isFinite(product.originalPrice)
                    ? product.originalPrice
                    : null;

                return (
              <Card
                key={product.productId}
                className="group overflow-hidden rounded-2xl border-0 shadow-sm hover:shadow-2xl transition-all duration-300 bg-white"
              >
                {/* IMAGE */}
                <div className="relative overflow-hidden bg-gray-100 aspect-square">
                  <img
                    src={
                      product.images?.[0] ||
                      "https://placehold.co/600x600?text=No+Image"
                    }
                    alt={product.productName}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />

                  <div className="absolute top-3 left-3 bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-semibold shadow">
                    {product.category}
                  </div>
                </div>

                {/* CONTENT */}
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg line-clamp-1 text-gray-900">
                    {product.productName}
                  </h3>

                  <p className="text-sm text-gray-500 mt-1 line-clamp-2 min-h-[40px]">
                    {product.description}
                  </p>

                  {/* RATING */}
                  <div className="flex items-center gap-1 mt-3">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span className="font-medium text-sm">
                      4.5
                    </span>

                    <span className="text-xs text-gray-400">
                      (120 reviews)
                    </span>
                  </div>

                  {/* PRICE */}
                  <div className="mt-4 flex items-end gap-2">
                    <span className="text-2xl font-bold text-gray-900">
                      ₹{price.toLocaleString()}
                    </span>

                    {originalPrice && (
                      <span className="text-sm line-through text-gray-400">
                        ₹
                        {originalPrice.toLocaleString()}
                      </span>
                    )}
                  </div>

                  {/* DISCOUNT */}
                  {originalPrice && originalPrice > price && (
                    <div className="mt-1 text-green-600 text-sm font-semibold">
                      {Math.round(
                        ((originalPrice - price) /
                          originalPrice) *
                          100
                      )}
                      % OFF
                    </div>
                  )}

                  {/* BUTTONS */}
                  <div className="mt-5 flex gap-2">
                
                  </div>
                </CardContent>
              </Card>
                );
              })()
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
