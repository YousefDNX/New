import { createFileRoute, Navigate, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/app/english")({
  beforeLoad: () => {
    throw redirect({ to: "/app/study" });
  },
  component: () => <Navigate to="/app/study" />,
});
