/** @type {import('next').NextConfig} */
import { version } from './package.json' with { type: "json" };
const nextConfig = {
    distDir: "build",

    // To mitigate the duplicate rendering of the base component
    // See https://stackoverflow.com/questions/71847778/why-my-nextjs-component-is-rendering-twice
    reactStrictMode: false,
};

module.exports = {
  publicRuntimeConfig: {
    version,
  },
};

export default nextConfig;
