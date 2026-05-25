import { Link, Navigate } from "react-router-dom";
import { ArrowRight, ShoppingBag, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getDefaultPortalPath, useAuth } from "@/lib/auth";

const portals = [
  {
    title: "Buyer portal",
    description: "Search nearby inventory, compare local shops, and navigate directly to the right store.",
    to: "/buyer/login",
    cta: "Buyer login",
    icon: ShoppingBag,
  },
  {
    title: "Shopkeeper portal",
    description: "Manage your shop, update product listings, and keep your inventory visible to nearby buyers.",
    to: "/shopkeeper/login",
    cta: "Shopkeeper login",
    icon: Store,
  },
];

export function PortalHomePage() {
  const { session } = useAuth();

  if (session) {
    return <Navigate to={getDefaultPortalPath(session)} replace />;
  }

  return (
    <div className="page-stack">
      <section className="portal-hero">
        <div className="hero-copy">
          <p className="eyebrow">Local market access</p>
          <h1>Separate buyer and shopkeeper pages, each behind login.</h1>
          <p className="hero-text">
            Buyers browse inventory through a dedicated portal. Shopkeepers manage products through
            a separate dashboard. Anonymous access now starts here.
          </p>
        </div>

        <Card className="portal-summary-card">
          <CardHeader>
            <CardTitle>What changed</CardTitle>
            <CardDescription>Choose the right portal to continue.</CardDescription>
          </CardHeader>
          <CardContent className="portal-summary-list">
            <div className="portal-summary-item">
              <strong>Buyer pages</strong>
              <span>Protected search, map, and shop detail flow</span>
            </div>
            <div className="portal-summary-item">
              <strong>Shopkeeper pages</strong>
              <span>Protected inventory dashboard with shop login</span>
            </div>
            <div className="portal-summary-item">
              <strong>Responsive UI</strong>
              <span>Cleaner stacking and mobile-friendly controls</span>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="portal-grid">
        {portals.map((portal) => {
          const Icon = portal.icon;

          return (
            <Card key={portal.title} className="portal-card">
              <CardHeader>
                <div className="portal-card-icon">
                  <Icon className="size-5" />
                </div>
                <CardTitle>{portal.title}</CardTitle>
                <CardDescription>{portal.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild size="lg" className="portal-card-button">
                  <Link to={portal.to}>
                    {portal.cta}
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </section>
    </div>
  );
}
