import dotenv from "dotenv"

// Load environment variables from .env file
dotenv.config()

//Ensure required Environemt Variables are set
const requiredEnvVariables = [
    "DB_USERNAME",
    "DB_PASSWORD",
    "PORT",
    "JWT_SECRET_KEY",
]

requiredEnvVariables.forEach(key => {
    if (!process.env[key]) {
        throw new Error(`Missing required Environment variable; ${key}`)
    }
})
//Export config oobject
export const config = {
    DB_USERNAME: process.env.DB_USERNAME as string,
    DB_PASSWORD: process.env.DB_PASSWORD as string,
    JWT_SECRET_KEY: process.env.JWT_SECRET_KEY as string,
    PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 3000
}