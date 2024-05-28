/** @type {import('next').NextConfig} */
const nextConfig = {
    distDir: "build",

    // To mitigate the duplicate rendering of the base component
    // See https://stackoverflow.com/questions/71847778/why-my-nextjs-component-is-rendering-twice
    reactStrictMode: false,

    experimental: {
        missingSuspenseWithCSRBailout: false,
    },

    env: {
        KV_URL: process.env.KV_URL,
        KV_REST_API_URL: process.env.KV_REST_API_URL,
        KV_REST_API_TOKEN: process.env.KV_REST_API_TOKEN,
        KV_REST_API_READ_ONLY_TOKEN: process.env.KV_REST_API_READ_ONLY_TOKEN,
    },
};

export default nextConfig;
