import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.js";
import { DATABASE_URL } from "./env.js";

const pool = new PrismaPg({ connectionString: DATABASE_URL! });

const prisma = new PrismaClient({ adapter: pool });

export default prisma;
