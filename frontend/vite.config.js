import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// O backend Express roda em http://localhost:3000 e expõe as rotas sob /api.
// O proxy evita CORS e permite chamar "/api/..." direto do front em desenvolvimento.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
});
