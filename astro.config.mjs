// @ts-check
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import tailwindcss from "@tailwindcss/vite";
import react from '@astrojs/react';



// https://astro.build/config
export default defineConfig({
  integrations: [react()],
  adapter: node({
    mode: 'standalone' // Mode stannpmdalone untuk API endpoint
  }),
  vite: {
    plugins:[
      tailwindcss(),
    ],
  },
  
});