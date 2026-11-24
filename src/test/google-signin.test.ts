import { beforeEach, describe, expect, it, vi } from "vitest";

const callOrder: string[] = [];

const mockUser = {
  uid: "google_uid_1",
  email: "student@gmail.com",
  emailVerified: true,
  displayName: "Sara Student",
  photoURL: "https://lh3.googleusercontent.com/a/avatar",
  phoneNumber: null,
  isAnonymous: false,
  providerData: [{ providerId: "google.com" }],
  getIdToken: vi.fn(async () => "tok_123"),
  getIdTokenResult: vi.fn(async () => ({ signInProvider: "google.com" })),
  reload: vi.fn(async () => undefined),
};

const signInWithPopupMock = vi.fn(async () => {
  callOrder.push("signInWithPopup");
  return { user: mockUser };
});

const signInWithRedirectMock = vi.fn(async () => {
  callOrder.push("signInWithRedirect");
});

const getRedirectResultMock = vi.fn(async () => null);

const setPersistenceMock = vi.fn(async () => {
  callOrder.push("setPersistence");
});

const bootstrapMock = vi.fn(async () => null);

vi.mock("firebase/auth", async (importOriginal) => {
  const actual = await importOriginal<typeof import("firebase/auth")>();
  return {
    ...actual,
    signInWithPopup: signInWithPopupMock,
    signInWithRedirect: signInWithRedirectMock,
    getRedirectResult: getRedirectResultMock,
    setPersistence: setPersistenceMock,
  };
});

vi.mock("@/lib/auth-bootstrap", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/auth-bootstrap")>();
  return {
    ...actual,
    ensureFirebaseUserBootstrap: bootstrapMock,
  };
});

describe("Google Sign-In Flow Guarantees", () => {
  beforeEach(() => {
    callOrder.length = 0;
    vi.clearAllMocks();
  });

  it("calls signInWithPopup BEFORE any async setPersistence await so user activation is preserved", async () => {
    const { signInWithGoogle } = await import("@/lib/firebase-auth");
    const result = await signInWithGoogle("en", true);

    expect(result.redirected).toBe(false);
    expect(result.user?.uid).toBe("google_uid_1");
    expect(signInWithPopupMock).toHaveBeenCalledTimes(1);
    expect(callOrder[0]).toBe("signInWithPopup");
    expect(callOrder).toContain("setPersistence");
    expect(bootstrapMock).toHaveBeenCalledWith(mockUser, "en");
  });

  it("captures and surfaces getRedirectResult errors via consumeLastRedirectError", async () => {
    vi.resetModules();
    getRedirectResultMock.mockRejectedValueOnce({
      code: "auth/account-exists-with-different-credential",
    });

    const { waitForAuthReady, consumeLastRedirectError } = await import("@/lib/firebase-auth");
    await waitForAuthReady("en");
    const err = consumeLastRedirectError() as { code?: string } | null;

    expect(err?.code).toBe("auth/account-exists-with-different-credential");
    expect(consumeLastRedirectError()).toBeNull();
  });

  it("coordinates waitForAuthReady with an in-flight signInWithGoogle bootstrap", async () => {
    vi.resetModules();
    let releaseBootstrap!: () => void;
    const pendingBootstrap = new Promise<null>((resolve) => {
      releaseBootstrap = () => resolve(null);
    });
    bootstrapMock.mockImplementationOnce(() => pendingBootstrap);

    const mod = await import("@/lib/firebase-auth");
    const signInPromise = mod.signInWithGoogle("en", true);

    // Wait a tick for signInWithPopup & applyAuthPersistence to yield into bootstrap
    await vi.waitFor(() => {
      expect(bootstrapMock).toHaveBeenCalledTimes(1);
    });
    expect(mod.isGoogleSignInInFlight()).toBe(true);

    let readyResolved = false;
    const readyPromise = mod.waitForAuthReady("en").then((u) => {
      readyResolved = true;
      return u;
    });

    await Promise.resolve();
    await Promise.resolve();
    expect(readyResolved).toBe(false);

    releaseBootstrap();
    const res = await signInPromise;
    await readyPromise;

    expect(readyResolved).toBe(true);
    expect(mod.isGoogleSignInInFlight()).toBe(false);
    expect(res.user?.uid).toBe("google_uid_1");
  });

  it("completes Google sign-in on transient bootstrap failure but rethrows permission-denied", async () => {
    vi.resetModules();
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => undefined);

    bootstrapMock.mockRejectedValueOnce({ code: "firestore/unavailable", message: "offline" });
    const mod = await import("@/lib/firebase-auth");

    const okRes = await mod.signInWithGoogle("en", true);
    expect(okRes.user?.uid).toBe("google_uid_1");
    expect(okRes.redirected).toBe(false);
    expect(mod.isGoogleSignInInFlight()).toBe(false);

    bootstrapMock.mockRejectedValueOnce(
      new Error(JSON.stringify({ error: "Missing or insufficient permissions." })),
    );
    await expect(mod.signInWithGoogle("en", true)).rejects.toThrow(
      /Missing or insufficient permissions/i,
    );
    expect(mod.isGoogleSignInInFlight()).toBe(false);

    warnSpy.mockRestore();
  });
});
