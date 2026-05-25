import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getDefaultPortalPath, useAuth } from "@/lib/auth";

type NavigationState = {
  from?: {
    pathname?: string;
  };
};

export function BuyerLoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { session, loginBuyer } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("Sign in to access the buyer marketplace.");

  if (session) {
    return <Navigate to={getDefaultPortalPath(session)} replace />;
  }

  const redirectPath =
    (location.state as NavigationState | null)?.from?.pathname && (location.state as NavigationState | null)?.from?.pathname !== "/buyer/login"
      ? (location.state as NavigationState).from?.pathname
      : "/buyer";

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!name.trim() || !email.trim()) {
      setStatus("Name and email are required.");
      return;
    }

    loginBuyer({
      role: "buyer",
      name: name.trim(),
      email: email.trim(),
    });
    navigate(redirectPath ?? "/buyer", { replace: true });
  }

  return (
    <div className="auth-layout">
      <section className="auth-panel">
        <p className="eyebrow">Buyer login</p>
        <h1>Enter the buyer portal.</h1>
        <p className="hero-text">
          Save your buyer access for this browser and unlock the marketplace pages without leaving
          the local-first flow.
        </p>
        <div className="auth-panel-badge">
          <ShoppingBag className="size-4" />
          <span>Buyer pages are no longer public.</span>
        </div>
      </section>

      <Card className="auth-card">
        <CardHeader>
          <CardTitle>Buyer sign in</CardTitle>
          <CardDescription>{status}</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="auth-form" onSubmit={handleSubmit}>
            <Input
              placeholder="Your name"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
            <Input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
            <Button type="submit" size="lg">
              Continue as buyer
              <ArrowRight className="size-4" />
            </Button>
          </form>

          <div className="auth-footer">
            <span>Need the inventory dashboard instead?</span>
            <Link to="/shopkeeper/login">Go to shopkeeper login</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
