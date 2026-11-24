import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { VerificationPending } from "@/components/auth/VerificationPending";
import { PreferencesProvider } from "@/lib/preferences";

vi.mock("@tanstack/react-router", async () => {
  const actual =
    await vi.importActual<typeof import("@tanstack/react-router")>("@tanstack/react-router");
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

function renderWithProviders(ui: React.ReactNode) {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={qc}>
      <PreferencesProvider>{ui}</PreferencesProvider>
    </QueryClientProvider>,
  );
}

describe("VerificationPending Component", () => {
  afterEach(() => {
    cleanup();
  });

  it("displays the user's email and fires Resend, Refresh Status, and Logout actions", async () => {
    const onResend = vi.fn().mockResolvedValue(undefined);
    const onRefresh = vi.fn().mockResolvedValue(true);
    const onVerified = vi.fn().mockResolvedValue(undefined);
    const onLogout = vi.fn().mockResolvedValue(undefined);

    renderWithProviders(
      <VerificationPending
        variant="embedded"
        email="student@nexora.school"
        onResend={onResend}
        onRefresh={onRefresh}
        onVerified={onVerified}
        onLogout={onLogout}
      />,
    );

    expect(screen.getByTestId("verification-pending-target")).toHaveTextContent(
      "st***@nexora.school",
    );
    expect(screen.getByTestId("verification-state-badge")).toHaveTextContent(
      "EMAIL_VERIFICATION_PENDING",
    );

    const revealBtn = screen.getByRole("button", { name: "Show target" });
    fireEvent.click(revealBtn);
    expect(screen.getByTestId("verification-pending-target")).toHaveTextContent(
      "student@nexora.school",
    );

    const refreshBtn = screen.getByRole("button", { name: "Refresh Status" });
    const resendBtn = screen.getByRole("button", { name: "Resend" });
    const logoutBtn = screen.getByRole("button", { name: "Logout" });

    fireEvent.click(resendBtn);
    await waitFor(() => expect(onResend).toHaveBeenCalledTimes(1));

    fireEvent.click(refreshBtn);
    await waitFor(() => expect(onRefresh).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(onVerified).toHaveBeenCalledTimes(1));

    fireEvent.click(logoutBtn);
    await waitFor(() => expect(onLogout).toHaveBeenCalledTimes(1));
  });

  it("displays the user's phone number masked by default and phone verification copy when gating phone verification", async () => {
    const onRefresh = vi.fn().mockResolvedValue(false);
    const onLogout = vi.fn().mockResolvedValue(undefined);

    renderWithProviders(
      <VerificationPending
        variant="standalone"
        phoneNumber="+96550001234"
        onRefresh={onRefresh}
        onLogout={onLogout}
      />,
    );

    expect(screen.getByRole("heading", { name: "Verify your phone number" })).toBeInTheDocument();
    expect(screen.getByTestId("verification-pending-target")).toHaveTextContent("+965••••1234");
    expect(screen.getByTestId("verification-state-badge")).toHaveTextContent(
      "PHONE_VERIFICATION_PENDING",
    );
    expect(screen.getByRole("button", { name: "Refresh Status" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Resend" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Logout" })).toBeInTheDocument();
  });
});
