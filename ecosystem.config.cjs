module.exports = {
	apps: [
		{
			name: "gittogether",
			cwd: "/home/ubuntu/codeflare",
			script: "dist/app.js",
			instances: 1,
			autorestart: true,
			watch: false,
			env: {
				NODE_ENV: "production",
			},
		},
	],
};
