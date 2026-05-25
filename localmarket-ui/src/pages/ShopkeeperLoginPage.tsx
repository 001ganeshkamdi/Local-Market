import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { createShop, loginShopkeeper as loginShopkeeperRequest } from "@/lib/api";
import { getDefaultPortalPath, useAuth } from "@/lib/auth";

type NavigationState = {
  from?: {
    pathname?: string;
  };
};

const emptyRegistration = {
  ownerName: "",
  email: "",
  password: "",
  shopName: "",
  shopLocation: "",
  latitude: "",
  longitude: "",
};

export function ShopkeeperLoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { session, loginShopkeeper: saveShopkeeperSession } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [registration, setRegistration] = useState(emptyRegistration);
  const [status, setStatus] = useState("Sign in with your shop email, or create a new shopkeeper account.");
  const [loading, setLoading] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [locationStatus, setLocationStatus] = useState("");
  
  function detectLocation() {
    if (!navigator.geolocation) {
      setLocationStatus("Geolocation not supported ❌");
      return;
    }
  
    setLocationStatus("Detecting location...");
  
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
  
        setRegistration((current) => ({
          ...current,
          latitude: lat.toString(),
          longitude: lng.toString(),
        }));
  
        setLocationStatus("Location detected ✅");
      },
      () => {
        setLocationStatus("Permission denied or failed ❌");
      }
    );
  }

  if (session) {
    return <Navigate to={getDefaultPortalPath(session)} replace />;
  }

  const redirectPath =
    (location.state as NavigationState | null)?.from?.pathname &&
    (location.state as NavigationState | null)?.from?.pathname !== "/shopkeeper/login"
      ? (location.state as NavigationState).from?.pathname
      : "/shopkeeper/dashboard";

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!email.trim() || !password.trim()) {
      setStatus("Email and password are required.");
      return;
    }

    setLoading(true);
    try {
      const shopkeeper = await loginShopkeeperRequest(email.trim(), password);
      saveShopkeeperSession(shopkeeper);
      navigate(redirectPath ?? "/shopkeeper/dashboard", { replace: true });
    } catch (error) {
      console.error(error);
      setStatus(error instanceof Error ? error.message : "Unable to sign in.");
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (
      !registration.ownerName.trim() ||
      !registration.email.trim() ||
      !registration.password.trim() ||
      !registration.shopName.trim() ||
      !registration.shopLocation.trim()
    ) {
      setStatus("Owner, email, password, shop name, and shop location are required.");
      return;
    }

    setRegistering(true);
    try {
      await createShop(registration);
      const shopkeeper = await loginShopkeeperRequest(registration.email.trim(), registration.password);
      saveShopkeeperSession(shopkeeper);
      setRegistration(emptyRegistration);
      navigate("/shopkeeper/dashboard", { replace: true });
    } catch (error) {
      console.error(error);
      setStatus(error instanceof Error ? error.message : "Unable to create shopkeeper account.");
    } finally {
      setRegistering(false);
    }
  }

  return (
    <div className="auth-layout">
      <section className="auth-panel">
        <p className="eyebrow">Shopkeeper login</p>
        <h1>Enter the inventory dashboard.</h1>
        <p className="hero-text">
          Sign in with your saved shop credentials to manage products, add listings, and update
          what buyers can see.
        </p>
        <div className="auth-panel-badge">
          <Store className="size-4" />
          <span>Passwords are stored securely, and each shopkeeper account maps to one shop.</span>
        </div>
      </section>

      <div className="page-stack">
        <Card className="auth-card">
          <CardHeader>
            <CardTitle>Shopkeeper sign in</CardTitle>
            <CardDescription>{status}</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="auth-form" onSubmit={handleSubmit}>
              <Input
                type="email"
                placeholder="Shop email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
              <Button type="submit" size="lg" disabled={loading}>
                {loading ? "Signing in..." : "Continue as shopkeeper"}
                <ArrowRight className="size-4" />
              </Button>
            </form>

            <div className="auth-footer">
              <span>Need marketplace access instead?</span>
              <Link to="/buyer/login">Go to buyer login</Link>
            </div>
          </CardContent>
        </Card>

        <Card className="auth-card">
          <CardHeader>
            <CardTitle>Create shopkeeper account</CardTitle>
            <CardDescription>Register a new shop, then go straight into the dashboard.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="auth-form" onSubmit={handleRegister}>
              <Input
                placeholder="Owner name"
                value={registration.ownerName}
                onChange={(event) => setRegistration((current) => ({ ...current, ownerName: event.target.value }))}
              />
              <Input
                type="email"
                placeholder="Email"
                value={registration.email}
                onChange={(event) => setRegistration((current) => ({ ...current, email: event.target.value }))}
              />
              <Input
                type="password"
                placeholder="Password (min 8 characters)"
                value={registration.password}
                onChange={(event) => setRegistration((current) => ({ ...current, password: event.target.value }))}
              />
              <Input
                placeholder="Shop name"
                value={registration.shopName}
                onChange={(event) => setRegistration((current) => ({ ...current, shopName: event.target.value }))}
              />
              <Input
                placeholder="Shop locality"
                value={registration.shopLocation}
                onChange={(event) => setRegistration((current) => ({ ...current, shopLocation: event.target.value }))}
              />
              <div className="coordinate-grid">
                <Input
                  placeholder="Latitude"
                  value={registration.latitude}
                  onChange={(event) =>
                    setRegistration((current) => ({
                      ...current,
                      latitude: event.target.value,
                    }))
                  }
                />
              
                <Input
                  placeholder="Longitude"
                  value={registration.longitude}
                  onChange={(event) =>
                    setRegistration((current) => ({
                      ...current,
                      longitude: event.target.value,
                    }))
                  }
                />
              </div>
              
              <Button type="button" variant="outline" onClick={detectLocation}>
                Use my current location 📍
              </Button>
              
              {locationStatus && (
                <p className="text-sm text-muted-foreground">{locationStatus}</p>
              )}
              <Button type="submit" size="lg" disabled={registering}>
                {registering ? "Creating account..." : "Create shopkeeper account"}
                <ArrowRight className="size-4" />
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
