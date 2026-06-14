import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | null | undefined
}

let prismaInstance: PrismaClient | null | undefined

function getPrismaClient(): PrismaClient | null {
  if (prismaInstance !== undefined) {
    return prismaInstance
  }
  
  if (!process.env.DATABASE_URL) {
    console.warn('DATABASE_URL not set, Prisma client will not be available')
    prismaInstance = null
    return null
  }
  
  try {
    prismaInstance = new PrismaClient()
    return prismaInstance
  } catch (error) {
    console.error('Failed to initialize PrismaClient:', error)
    prismaInstance = null
    return null
  }
}

export const prisma = new Proxy({} as PrismaClient, {
  get(target, prop) {
    const client = getPrismaClient()
    if (!client) return undefined
    return (client as any)[prop]
  }
}) as PrismaClient | null
