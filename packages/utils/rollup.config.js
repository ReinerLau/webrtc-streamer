const typescript = require("@rollup/plugin-typescript");
const terser = require("@rollup/plugin-terser");

module.exports = {
  input: "index.ts",
  output: {
    dir: "lib",
    format: "es",
  },
  plugins: [terser(), typescript()],
};
