import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

// O backend roda em http://localhost:8080. O proxy mantém o front e a API na
// mesma origem durante o desenvolvimento, que é o que faz o cookie de sessão
// (`sessao`) ir e voltar sem CORS.
const API_ALVO = process.env.VITE_API_PROXY ?? 'http://localhost:8080'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': {
        target: API_ALVO,
        changeOrigin: true,
      },
    },
  },
})
