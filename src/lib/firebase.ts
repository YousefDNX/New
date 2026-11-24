import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import {
  browserLocalPersistence,
  browserPopupRedirectResolver,
  browserSessionPersistence,
  EmailAuthProvider,
  getAuth,
  GoogleAuthProvider,
  indexedDBLocalPersistence,
  initializeAuth,
  inMemoryPersistence,
  PhoneAuthProvider,
  ProviderId,
  setPersistence,
  type Auth,
  type PopupRedirectResolver,
} from "firebase/auth";
import { doc, getDocFromServer, getFirestore, type Firestore } from "firebase/firestore";
import firebaseConfig from "../../firebase-applet-config.json";

export interface FirebaseConfigShape {
  projectId: string;
  appId: string;
  apiKey: string;
  authDomain: string;
  firestoreDatabaseId?: string;
  storageBucket?: string;
  messagingSenderId?: string;
  measurementId?: string;
  oAuthClientId?: string;
  recaptchaSiteKey?: string;
}

const config = firebaseConfig as FirebaseConfigShape;

export const isFirebaseConfigured = Boolean(config.apiKey && config.projectId && config.appId);

export const firebaseProjectMeta = {
  projectId: config.projectId,
  authDomain: config.authDomain,
  firestoreDatabaseId: config.firestoreDatabaseId || "(default)",
  oAuthClientId: config.oAuthClientId || "",
} as const;

let _app: FirebaseApp | undefined;
let _auth: Auth | undefined;
let _db: Firestore | undefined;
let _connectionProbed = false;

export function getPopupRedirectResolver(): PopupRedirectResolver | undefined {
  return typeof browserPopupRedirectResolver === "function"
    ? browserPopupRedirectResolver
    : undefined;
}

export function getFirebaseApp(): FirebaseApp {
  if (!_app) {
    _app = getApps().length > 0 ? getApp() : initializeApp(config);
  }
  return _app;
}

export function getFirebaseAuth(): Auth {
  if (!_auth) {
    const targetApp = getFirebaseApp();
    if (typeof window !== "undefined") {
      try {
        const remember = getSessionRememberPreference();
        const resolver = getPopupRedirectResolver();
        _auth = initializeAuth(targetApp, {
          persistence: remember
            ? [
                indexedDBLocalPersistence,
                browserLocalPersistence,
                browserSessionPersistence,
                inMemoryPersistence,
              ]
            : [browserSessionPersistence, inMemoryPersistence],
          ...(resolver ? { popupRedirectResolver: resolver } : {}),
        });
      } catch {
        _auth = getAuth(targetApp);
      }
    } else {
      _auth = getAuth(targetApp);
    }
  }
  return _auth;
}

export function getFirebaseDb(): Firestore {
  if (!_db) {
    // CRITICAL: Target the provisioned named Firestore database from firebase-applet-config.json
    _db = config.firestoreDatabaseId
      ? getFirestore(getFirebaseApp(), config.firestoreDatabaseId)
      : getFirestore(getFirebaseApp());
  }
  return _db;
}

export const firebaseApp = getFirebaseApp();
export const auth = getFirebaseAuth();
export const db = getFirebaseDb();

export const AUTH_PROVIDER_IDS = {
  EMAIL_PASSWORD: ProviderId.PASSWORD,
  GOOGLE: ProviderId.GOOGLE,
  PHONE: ProviderId.PHONE,
} as const;

export function createGoogleAuthProvider(): GoogleAuthProvider {
  const provider = new GoogleAuthProvider();
  provider.addScope("profile");
  provider.addScope("email");
  provider.setCustomParameters({ prompt: "select_account" });
  return provider;
}

export function createPhoneAuthProvider(targetAuth: Auth = auth): PhoneAuthProvider {
  return new PhoneAuthProvider(targetAuth);
}

export const REGISTERED_AUTH_PROVIDERS = {
  emailPassword: {
    id: ProviderId.PASSWORD,
    Provider: EmailAuthProvider,
  },
  google: {
    id: ProviderId.GOOGLE,
    Provider: GoogleAuthProvider,
    create: createGoogleAuthProvider,
  },
  phone: {
    id: ProviderId.PHONE,
    Provider: PhoneAuthProvider,
    create: createPhoneAuthProvider,
  },
} as const;

export enum OperationType {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  LIST = "list",
  GET = "get",
  WRITE = "write",
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | null;
    email: string | null;
    emailVerified: boolean | null;
    isAnonymous: boolean | null;
    tenantId: string | null;
    providerInfo: {
      providerId: string | null;
      email: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null,
): never {
  const currentUser = auth.currentUser;
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: currentUser?.uid ?? null,
      email: currentUser?.email ?? null,
      emailVerified: currentUser?.emailVerified ?? null,
      isAnonymous: currentUser?.isAnonymous ?? null,
      tenantId: currentUser?.tenantId ?? null,
      providerInfo:
        currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId ?? null,
          email: provider.email ?? null,
        })) ?? [],
    },
    operationType,
    path,
  };
  console.error("Firestore Error: ", JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export async function testFirestoreConnection(): Promise<boolean> {
  if (typeof window === "undefined") return true;
  if (_connectionProbed) return true;
  _connectionProbed = true;
  try {
    await getDocFromServer(doc(db, "test", "connection"));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes("the client is offline")) {
      console.error("Please check your Firebase configuration.");
    }
    return false;
  }
}

if (typeof window !== "undefined" && isFirebaseConfigured) {
  void testFirestoreConnection();
}

const REMEMBER_SESSION_KEY = "nexora_remember_session";

export function setSessionRememberPreference(remember: boolean) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(REMEMBER_SESSION_KEY, remember ? "true" : "false");
  } catch {
    // ignore storage quota errors
  }
}

export function getSessionRememberPreference(): boolean {
  if (typeof window === "undefined") return true;
  try {
    return localStorage.getItem(REMEMBER_SESSION_KEY) !== "false";
  } catch {
    return true;
  }
}

export async function applyAuthPersistence(remember: boolean): Promise<void> {
  if (typeof window === "undefined") return;
  setSessionRememberPreference(remember);
  const candidates = remember
    ? [
        indexedDBLocalPersistence,
        browserLocalPersistence,
        browserSessionPersistence,
        inMemoryPersistence,
      ]
    : [browserSessionPersistence, inMemoryPersistence];

  for (const persistence of candidates) {
    try {
      await setPersistence(auth, persistence);
      return;
    } catch {
      // Fall through to next persistence backend if storage is restricted
    }
  }
}
