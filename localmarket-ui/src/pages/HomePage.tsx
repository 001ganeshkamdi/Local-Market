import { useEffect, useMemo, useState } from "react";


import { MarketplaceAssistant } from "@/components/marketplace/MarketplaceAssistant";


import {
  Store,
  ShoppingBag,
  Sparkles,
  ListFilter,
  Map as MapIcon,
  X,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

import { fetchProducts, fetchShops, searchShops } from "@/lib/api";

import { useAuth } from "@/lib/auth";

import { groupProductsByShop, parseCoordinateInput } from "@/lib/location";

import { SearchControls } from "@/components/marketplace/SearchControls";

import { ShopResultCard } from "@/components/marketplace/ShopResultCard";

import type { Product, Shop, ShopSearchResult } from "@/types";

export function HomePage() {
  const { buyerSession } = useAuth();

  const [shops, setShops] = useState<Shop[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchResults, setSearchResults] = useState<ShopSearchResult[]>([]);

  const [query, setQuery] = useState("");

  const [distanceFilter, setDistanceFilter] = useState("all");

  const [priceSort, setPriceSort] = useState("distance");

  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");

  const [loading, setLoading] = useState(true);

  const [searching, setSearching] = useState(false);

  const [isMapOpen, setIsMapOpen] = useState(false);

  const [status, setStatus] = useState("Loading marketplace...");

  const userLocation = useMemo(
    () => parseCoordinateInput(latitude, longitude),
    [latitude, longitude],
  );

  useEffect(() => {
    async function loadMarketplace() {
      setLoading(true);

      try {
        const [shopData, productData] = await Promise.all([
          fetchShops(),
          fetchProducts(),
        ]);

        setShops(shopData);
        setProducts(productData);

        setStatus("Browse nearby shops or search products.");
      } catch (error) {
        console.error(error);

        setStatus("Unable to load marketplace data.");
      } finally {
        setLoading(false);
      }
    }

    loadMarketplace();
  }, []);

  const browseResults = useMemo(
    () => groupProductsByShop(products, userLocation, shops),
    [products, shops, userLocation],
  );

  const displayedResults = useMemo(() => {
    const base = query.trim() ? searchResults : browseResults;

    const maxDistance =
      distanceFilter === "all" ? null : Number(distanceFilter);

    const filtered = base.filter((shop) => {
      if (maxDistance === null || shop.distanceKm === null) {
        return true;
      }

      return shop.distanceKm <= maxDistance;
    });

    return [...filtered].sort((a, b) => {
      if (priceSort === "priceAsc") {
        return (
          (a.lowestPrice ?? Number.MAX_SAFE_INTEGER) -
          (b.lowestPrice ?? Number.MAX_SAFE_INTEGER)
        );
      }

      if (priceSort === "priceDesc") {
        return (b.lowestPrice ?? 0) - (a.lowestPrice ?? 0);
      }

      return (
        (a.distanceKm ?? Number.MAX_SAFE_INTEGER) -
        (b.distanceKm ?? Number.MAX_SAFE_INTEGER)
      );
    });
  }, [browseResults, distanceFilter, priceSort, query, searchResults]);

  async function handleSearch() {
    if (!query.trim()) {
      setSearchResults([]);

      setStatus("Showing all nearby marketplace shops.");

      return;
    }

    setSearching(true);
    const searchTerm = query.trim().toLowerCase();
    const localMatches = browseResults.filter((shop) => {
      const shopFields = [shop.shopName, shop.location].join(" ").toLowerCase();
      const productFields = shop.products
        .map((product) =>
          [
            product.productName,
            product.category,
            product.type,
            product.description,
          ]
            .filter(Boolean)
            .join(" "),
        )
        .join(" ")
        .toLowerCase();

      return `${shopFields} ${productFields}`.includes(searchTerm);
    });

    try {
      const results = await searchShops(
        query,
        userLocation?.latitude,
        userLocation?.longitude,
      );

      const mergedResults = new globalThis.Map<string, ShopSearchResult>();
      [...results, ...localMatches].forEach((result) => {
        mergedResults.set(result.shopId, result);
      });
      const nextResults = Array.from(mergedResults.values());

      setSearchResults(nextResults);

      setStatus(
        nextResults.length > 0
          ? `Found ${nextResults.length} matching shop${nextResults.length === 1 ? "" : "s"}`
          : `No shops found for "${query}"`,
      );
    } catch (error) {
      console.error(error);

      setSearchResults(localMatches);
      setStatus(
        localMatches.length > 0
          ? `Showing ${localMatches.length} local match${localMatches.length === 1 ? "" : "es"} while search refresh is unavailable.`
          : "Search failed. Try another product, category, or shop name.",
      );
    } finally {
      setSearching(false);
    }
  }

  function handleUseLocation() {
    if (!navigator.geolocation) {
      setStatus("Geolocation not supported.");

      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const nextLatitude = position.coords.latitude.toFixed(6);

        const nextLongitude = position.coords.longitude.toFixed(6);

        setLatitude(nextLatitude);
        setLongitude(nextLongitude);

        setStatus("Location captured.");
      },
      () => setStatus("Unable to access your location."),
      {
        enableHighAccuracy: true,
        timeout: 10000,
      },
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8">
  
        {/* HERO */}
        <section className="flex flex-col gap-6 rounded-[32px] bg-white p-8 shadow-sm ring-1 ring-black/5 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-3xl space-y-4">
            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-green-100 px-4 py-2 text-sm font-medium text-green-700">
              <Sparkles className="size-4" />
              Smart local marketplace
            </span>
  
            <div className="space-y-3">
              <h1 className="text-4xl font-semibold tracking-tight text-slate-900 lg:text-5xl">
                Discover nearby shops and products instantly.
              </h1>
  
              <p className="max-w-2xl text-base leading-7 text-slate-600 lg:text-lg">
                Browse local inventory, compare prices, preview routes,
                and explore nearby stores through a modern hyperlocal marketplace.
              </p>
            </div>
          </div>
  
          <div className="flex items-center gap-4 rounded-2xl bg-slate-50 px-5 py-4 ring-1 ring-slate-200">
            <div className="flex size-12 items-center justify-center rounded-full bg-green-100">
              <ShoppingBag className="size-6 text-green-700" />
            </div>
  
            <div className="flex flex-col">
              <span className="text-sm text-slate-500">
                Signed in as
              </span>
  
              <strong className="text-base text-slate-900">
                {buyerSession?.name ?? "Buyer"}
              </strong>
            </div>
          </div>
        </section>
  
        {/* SEARCH PANEL */}
        <section className="rounded-[28px] bg-white p-6 shadow-sm ring-1 ring-black/5">
          <div className="flex flex-col gap-5">
  
            <SearchControls
              query={query}
              setQuery={setQuery}
              distanceFilter={distanceFilter}
              setDistanceFilter={setDistanceFilter}
              priceSort={priceSort}
              setPriceSort={setPriceSort}
              latitude={latitude}
              longitude={longitude}
              setLatitude={setLatitude}
              setLongitude={setLongitude}
              onSearch={handleSearch}
              onUseLocation={handleUseLocation}
              loading={searching}
            />
  
            <div className="flex items-center gap-2 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
              <ListFilter className="size-4 text-slate-500" />
              <span>{status}</span>
            </div>
          </div>
        </section>
  
        {/* MAIN LAYOUT */}
        <div className="grid grid-cols-1 gap-8 xl:grid-cols-[1.2fr_0.8fr]">
  
          {/* LEFT FEED */}
          <section className="flex flex-col gap-6">
  
            {/* FEED HEADER */}
            <div className="flex flex-col gap-4 rounded-[28px] bg-white p-6 shadow-sm ring-1 ring-black/5 sm:flex-row sm:items-center sm:justify-between">
  
              <div className="space-y-1">
                <span className="text-sm font-medium text-slate-500">
                  Marketplace feed
                </span>
  
                <h2 className="text-2xl font-semibold text-slate-900">
                  Shops and matching products
                </h2>
              </div>
  
              <div className="flex gap-6 rounded-2xl bg-slate-50 px-5 py-4">
                <div className="flex flex-col items-center">
                  <strong className="text-2xl text-slate-900">
                    {displayedResults.length}
                  </strong>
  
                  <span className="text-sm text-slate-500">
                    Shops
                  </span>
                </div>
  
                <div className="h-12 w-px bg-slate-200" />
  
                <div className="flex flex-col items-center">
                  <strong className="text-2xl text-slate-900">
                    {products.length}
                  </strong>
  
                  <span className="text-sm text-slate-500">
                    Products
                  </span>
                </div>
              </div>
            </div>
  
            {/* CONTENT */}
            {loading ? (
              <div className="grid gap-6 md:grid-cols-2">
                {[0, 1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="h-[260px] animate-pulse rounded-[28px] bg-slate-200"
                  />
                ))}
              </div>
            ) : displayedResults.length === 0 ? (
              <Card className="rounded-[32px] border-0 shadow-sm ring-1 ring-black/5">
                <CardContent className="flex flex-col items-center gap-5 py-16 text-center">
                  <div className="flex size-20 items-center justify-center rounded-full bg-green-100">
                    <Store className="size-10 text-green-700" />
                  </div>
  
                  <div className="space-y-2">
                    <h3 className="text-2xl font-semibold text-slate-900">
                      No local shops found
                    </h3>
  
                    <p className="max-w-md text-slate-500">
                      Try another product name, category,
                      or increase the search distance.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 2xl:grid-cols-2">
                {displayedResults.map((result) => (
                  <ShopResultCard
                    key={result.shopId}
                    result={result}
                    userLocation={userLocation}
                    onPreviewRoute={() => {
                      setIsMapOpen(true);
                    }}
                  />
                ))}
              </div>
            )}
          </section>
  
          {/* RIGHT MAP PANEL */}
          <aside
            className={`sticky top-6 h-fit ${
              isMapOpen ? "mobile-open" : ""
            }`}
            aria-label="Marketplace map"
          >
            <div className="overflow-hidden rounded-[32px] bg-white shadow-sm ring-1 ring-black/5">
          
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
                {/*<div className="space-y-1">
                  <span className="text-sm font-medium text-slate-500">
                    Marketplace Map
                  </span>
          
                  <h3 className="text-lg font-semibold text-slate-900">
                    Nearby shops
                  </h3>
                </div>*/}
          
                {/*<button
                  type="button"
                  onClick={() => setIsMapOpen(false)}
                  className="flex size-10 items-center justify-center rounded-full bg-slate-100 transition hover:bg-slate-200"
                >
                  <X className="size-4 text-slate-700" />
                </button>*/}
              </div>
          
              <MarketplaceAssistant userLocation={userLocation} />
            </div>
          </aside>
        </div>
        
  
        {/* FLOATING MOBILE MAP BUTTON */}
        <button
          type="button"
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-green-700 px-5 py-4 text-sm font-medium text-white shadow-xl transition hover:scale-105 hover:bg-green-800 xl:hidden"
          onClick={() => setIsMapOpen(true)}
        >
          <MapIcon className="size-4" />
          View map
        </button>
      </div>
    </div>
  );
}
