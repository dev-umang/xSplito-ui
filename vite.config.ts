import { VitePWA } from "vite-plugin-pwa";
import { defineConfig, loadEnv, type PluginOption } from "vite";
import react from "@vitejs/plugin-react";
import { type ENVVariables } from "./src/vite-env";
// import tailwindcss from "@tailwindcss/vite";
import paths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";

const plugins: PluginOption[] = [
  react(),
  tailwindcss() as PluginOption,
  paths(),
  VitePWA({
    registerType: "autoUpdate",
    injectRegister: false,

    pwaAssets: {
      disabled: false,
      config: true,
    },

    manifest: {
      name: "xSplito",
      short_name: "xSplito",
      description: "xSplito",
      theme_color: "#ffffff",
    },

    workbox: {
      globPatterns: ["**/*.{js,css,html,svg,png,ico}"],
      cleanupOutdatedCaches: true,
      clientsClaim: true,
    },

    devOptions: {
      enabled: false,
      navigateFallback: "index.html",
      suppressWarnings: true,
      type: "module",
    },
  }),
];

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd()) as unknown as ENVVariables;
  console.log(env.VITE_PORT);

  return {
    plugins,
    server: {
      host: true,
      port: parseInt(env.VITE_PORT, 10) || 3000,
    },
  };
});
