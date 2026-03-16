const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["mongoose"],
  outputFileTracingRoot: path.join(__dirname),
};

module.exports = nextConfig;
