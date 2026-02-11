/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/react" />

export type ENVVariables = {
  readonly VITE_PORT: string;
  readonly VITE_FIREBASE_apiKey: string;
  readonly VITE_FIREBASE_authDomain: string;
  readonly VITE_FIREBASE_projectId: string;
  readonly VITE_FIREBASE_storageBucket: string;
  readonly VITE_FIREBASE_messagingSenderId: string;
  readonly VITE_FIREBASE_appId: string;
  readonly VITE_FIREBASE_measurementId: string;
  readonly VITE_NODE_PREFIX: string;
};

type ImportMetaEnv = ENVVariables;

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
