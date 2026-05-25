import { Link } from "react-router-dom";
import { ExternalLink, MapPin, Navigation, PackageSearch, Store, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { buildNavigationUrl } from "@/lib/location";
import type { Coordinates, ShopSearchResult } from "@/types";

type ShopResultCardProps = {
  result: ShopSearchResult;
  userLocation: Coordinates | null;
  onPreviewRoute: (shopId: string) => void;
};

export function ShopResultCard({ result, userLocation, onPreviewRoute }: ShopResultCardProps) {
  const products = Array.isArray(result.products) ? result.products : [];
  const heroProduct = products[0];
  const heroImage = Array.isArray(heroProduct?.images)
    ? heroProduct.images[0]
    : null;
  const lowestPrice =
    typeof result.lowestPrice === "number" ? result.lowestPrice : null;
  const distance =
    typeof result.distanceKm === "number" ? `${result.distanceKm} km` : "Nearby";

  return (
    <Card className="shop-card">
      <div className="shop-card-media">
        {heroImage ? (
          <img src={heroImage} alt={heroProduct.productName} />
        ) : (
          <div className="shop-card-placeholder">
            <Store className="size-10" />
          </div>
        )}
        <span className="shop-card-badge">
          <Tag className="size-3.5" />
          {heroProduct?.category || "Local shop"}
        </span>
      </div>
      <CardHeader className="shop-card-header">
        <CardTitle className="shop-card-title">
          <span>{heroProduct?.productName ?? result.shopName}</span>
          <strong>{distance}</strong>
        </CardTitle>
        <CardDescription className="shop-card-subtitle">
          <Store className="size-4" />
          {result.shopName}
        </CardDescription>
        <CardDescription className="shop-card-location">
          <MapPin className="size-4" />
          {result.location}
        </CardDescription>
      </CardHeader>
      <CardContent className="shop-card-body">
        <div className="shop-meta">
          <span>
            <PackageSearch className="size-4" />
          {products.length} matching product{products.length === 1 ? "" : "s"}
        </span>
        <span>
          <Tag className="size-4" />
          {lowestPrice !== null ? `from ₹${lowestPrice.toFixed(0)}` : "price unavailable"}
        </span>
      </div>

      <div className="match-list">
          {products.map((product) => (
            <div key={product.productId} className="match-item">
              {Array.isArray(product.images) && product.images[0] && (
                <img
                  src={product.images[0]}
                  alt={product.productName}
                  className="product-thumb"
                />
              )}
              <div>
                <strong>{product.productName}</strong>
                <p>{[product.category, product.type].filter(Boolean).join(" · ")}</p>
              </div>
              <span>
                {product.currency ?? "INR"}{" "}
                {typeof product.price === "number" ? product.price.toFixed(0) : "0"}
              </span>
            </div>
          ))}
        </div>

        <div className="product-actions">
          <Button asChild>
            <Link to={`/buyer/shop/${result.shopId}`}>View Shop</Link>
          </Button>
          <Button type="button" variant="outline" onClick={() => onPreviewRoute(result.shopId)}>
            <Navigation className="size-4" />
            Route
          </Button>
          <Button type="button" className="accent-button" asChild>
            <a
              href={buildNavigationUrl(
                userLocation,
                result.latitude !== null && result.longitude !== null
                  ? { latitude: result.latitude, longitude: result.longitude }
                  : null,
              )}
              target="_blank"
              rel="noreferrer"
            >
              <ExternalLink className="size-4" />
              Navigate
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
