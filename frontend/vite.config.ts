import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// GitHub Pages de projeto serve em usuario.github.io/<repo>/, então o build
// de produção precisa desse prefixo no "base" — só o workflow de deploy seta
// GITHUB_PAGES=true (ver .github/workflows/deploy.yml). Em dev fica '/'.
export default defineConfig({
  base: process.env.GITHUB_PAGES ? '/barbearia-agendamento/' : '/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/icon.svg'],
      manifest: {
        name: 'Barbearia - Agendamento',
        short_name: 'Barbearia',
        description: 'Agende seu horário na barbearia',
        theme_color: '#111111',
        background_color: '#111111',
        display: 'standalone',
        start_url: '.',
        // TODO: trocar por PNG 192/512 reais (esse SVG é só placeholder)
        icons: [
          { src: 'icons/icon.svg', sizes: '512x512', type: 'image/svg+xml', purpose: 'any' },
        ],
      },
    }),
  ],
})
