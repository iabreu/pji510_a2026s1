const webpack = require("webpack");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    config.plugins.push(
      new webpack.DefinePlugin({
        __dirname: JSON.stringify("/"),
      }),
    );
    return config;
  },
};

module.exports = nextConfig;
