import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(() => {
  const repository = process.env.GITHUB_REPOSITORY || ''
  const repositoryName = repository.split('/')[1] || ''
  const ghPagesBase = repositoryName ? `/${repositoryName}/` : '/'

  return {
    plugins: [react()],
    base: process.env.GITHUB_ACTIONS === 'true' ? ghPagesBase : '/',
  }
})
