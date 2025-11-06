// next.config.js
module.exports = {

  eslint: {
    ignoreDuringBuilds: true, // ✅ Allow build even if ESLint finds errors
  },

  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8080/:path*', // Replace with your backend API URL
      },
    ];
  },
};