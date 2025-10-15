module.exports = {
  apps: [
    {
      name: "gittogether",
      script: "npm",
      args: "start",
      env_production: {
        NODE_ENV: "production",
      },
    },
  ],
};
