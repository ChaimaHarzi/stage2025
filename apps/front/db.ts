import { PrismaClient } from "@prisma/client";/*Imports the PrismaClient class so you can create an instance to interact with your database. */
/**This tells TypeScript that you want to add a global variable named prisma to the global namespace*/
declare global{
    // allow global `var` declarations
    // eslint-disable-next-line no-var
    var prisma:PrismaClient | undefined ;
}
export const db = globalThis.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") globalThis.prisma = db;