const nextConfig = {
  webpack: (config) => {
    config.externals = config.externals || [];
    config.externals.push({ 'pg-native': 'commonjs pg-native' });
    return config;
  },
  // Keep Node-only DB drivers out of the Edge middleware bundle
  experimental: {
    serverComponentsExternalPackages: ['pg', 'pg-native', 'pgpass'],
  },
};

module.exports = nextConfig;
