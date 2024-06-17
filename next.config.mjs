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
        DYNAMODB_ACCESS_KEY_ID: process.env.DYNAMODB_ACCESS_KEY_ID,
        DYNAMODB_SECRET_ACCESS_KEY: process.env.DYNAMODB_SECRET_ACCESS_KEY,
        AWS_REGION: process.env.AWS_REGION,
        TABLE_NAME: process.env.TABLE_NAME,
        MAP_HASH: process.env.MAP_HASH,
    },
};

export default nextConfig;
