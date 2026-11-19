import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import tailwindcss from '@tailwindcss/vite'

// Para onde o proxy de `/api` aponta no `npm run dev`: por padrão o backend
// local (http://localhost:8080), e VITE_API_PROXY troca por outro — a API
// publicada, por exemplo. O proxy mantém front e API na mesma origem aos olhos
// do navegador, o que dispensa CORS e faz o cookie de sessão (`sessao`) ir e
// voltar sozinho.
//
// loadEnv, e não process.env: os arquivos .env NÃO entram em process.env. No
// código do app quem os lê é `import.meta.env`; aqui na config, loadEnv. Com
// process.env a variável era ignorada em silêncio e o proxy continuava no
// localhost:8080, parecendo que o .env não valia nada.
export default defineConfig(({ mode }) => {
  // '.' é a pasta do projeto: evita o process.cwd(), que o ESLint do front
  // acusa como global de Node inexistente no navegador.
  const env = loadEnv(mode, '.', 'VITE_')

  return {
    plugins: [react(), tailwindcss()],
    server: {
      proxy: {
        '/api': {
          // Vazio cai no padrão, como diz o .env.example.
          target: env.VITE_API_PROXY || 'http://localhost:8080',
          changeOrigin: true,
        },
      },
    },
  }
})
