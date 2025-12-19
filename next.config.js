/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 'canvas.iiit.ac.in'],
  },
  env: {
    BHASHINI_API_KEY: process.env.BHASHINI_API_KEY,
    BHASHINI_BASE_URL: process.env.BHASHINI_BASE_URL || 'https://canvas.iiit.ac.in',
  },
}

module.exports = nextConfig
