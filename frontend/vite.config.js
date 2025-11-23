import fs from 'node:fs'
import path from 'node:path'

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const frontendCertPath = path.resolve(__dirname, '../certs/frontend/frontend.crt.pem')
const frontendKeyPath = path.resolve(__dirname, '../certs/frontend/frontend.key.pem')
const caCertPath = path.resolve(__dirname, '../certs/ca/cacert.pem')
const frontendKeyPassphrase = '1234'

const httpsOptions = (() => {
  const options = {
    cert: fs.readFileSync(frontendCertPath),
    key: fs.readFileSync(frontendKeyPath),
    ca: fs.readFileSync(caCertPath)
  }

  if (frontendKeyPassphrase) {
    options.passphrase = frontendKeyPassphrase
  }

  return options
})()

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    https: httpsOptions,
    proxy: {
      '/api': {
        target: 'https://localhost:8000',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
