/** Static export so GitHub Pages can serve real HTML for all 46 store pages. */
const repo = "/bestwireless1-site";
const isCI = process.env.DEPLOY_TARGET === "pages";

export default {
  output: "export",
  trailingSlash: true,
  basePath: isCI ? repo : "",
  assetPrefix: isCI ? repo : "",
  images: { unoptimized: true },
  env: { BASE_PATH: isCI ? repo : "" },
};
