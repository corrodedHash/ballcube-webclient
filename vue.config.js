module.exports = {
  publicPath: ".",
  chainWebpack: (config) => {
    config.module
      .rule("loadGLB")
      .test(/\.glb$/)
      .type("asset/resource");
  },
};
