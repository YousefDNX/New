import { createFileRoute, Navigate, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/app/opportunities")({
  beforeLoad: () => {
    throw redirect({ to: "/app" });
  },
  component: () => <Navigate to="/app" replace />,
});
