import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route } from "wouter";

export function ProtectedRoute({
  path,
  component: Component,
}: {
  path: string;
  component: (params?: any) => React.JSX.Element;
}) {
  const { user, isLoading } = useAuth();

  return (
    <Route
      path={path}
      component={(params) => {
        if (isLoading) {
          return (
            <div className="flex items-center justify-center min-h-screen bg-background">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          );
        }

        if (!user) {
          return <Redirect to="/auth" />;
        }

        // Special case for admin page
        if (path === "/admin" && !user.isAdmin) {
          return <Redirect to="/" />;
        }

        return <Component {...params} />;
      }}
    />
  );
}
