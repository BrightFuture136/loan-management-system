const {PrismaClient} = require('@prisma/client');

const prisma = new PrismaClient();

const testPrismaConnection = async () =>{
    try {
        await prisma.$connect();
    } catch (error) {
        prisma.$connect();
    }
};

module.exports = {
    prisma, 
    testPrismaConnection
}