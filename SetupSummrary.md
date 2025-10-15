# MERN Backend Production Setup Summary

## 1. Environment Variable Management
- Environment variables are stored in `.env.production` for production and `.env.development` for local development.
- `config.ts` loads and validates variables using Zod or TypeScript type checks.
- Ensures all required variables (DB credentials, JWT secret, API keys, PORT, etc.) are present before app starts.

## 2. TypeScript + ESM Backend
- Backend code uses ES Modules (`import/export`).
- TypeScript is compiled to `dist/app.js`.
- PM2 runs the compiled code via `npm start`.

## 3. npm Scripts
- **dev**: For local development, sets `NODE_ENV=development` using `cross-env`.
- **build**: Compiles TypeScript code.
- **start**: Runs the app in production mode. `NODE_ENV` is set by PM2, no `cross-env` needed.

## 4. PM2 Process Management
- PM2 manages the production app, ensuring proper environment variables, automatic restarts, and logging.
- Ecosystem file (`ecosystem.config.js`) contains `env_production` with `NODE_ENV=production`.

### PM2 Commands
- **Start the app in production mode**:  
    ```bash
  pm2 start ecosystem.config.js --env production
    ```

- **Reload app after changes (zero downtime)**:
    ```bash
    pm2 reload ecosystem.config.js --env production
    ```

- **View logs**:
    ```bash
    pm2 logs myapp
    ```

- **Stop the app**:
    ```bash
    pm2 stop myapp
    ```

- **Restart the app**:
    ```bash
    pm2 restart myapp
    ```

- **View process status**:
    ```bash
    pm2 status
    ```
## - 5. Key Benefits

- Environment variables are validated and type-safe.

- No need to manually export NODE_ENV or PORT on the server.

- Clean separation between dev and production environments.

- PM2 handles process management, logging, and automatic restarts.

- Minimal duplication: .env.production contains all production variables; PM2 sets NODE_ENV only.