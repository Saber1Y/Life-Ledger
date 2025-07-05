// next.config.js
webpack: (config) => {
  config.module.rules.push({
    test: /HeartbeatWorker\.js$/,
    use: "null-loader",
  });
  return config;
};
