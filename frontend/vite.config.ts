import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// Ajuste "base" pro nome do repositório quando publicar no GitHub Pages
// (ex: '/barbearia/' se o repo se chamar "barbearia"). '/' funciona em dev.
export default defineConfig({
  base: '/',
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
        start_url: '/',
        // TODO: trocar por PNG 192/512 reais (esse SVG é só placeholder)
        icons: [
          { src: 'icons/icon.svg', sizes: '512x512', type: 'image/svg+xml', purpose: 'any' },
        ],
      },
    }),
  ],
})
