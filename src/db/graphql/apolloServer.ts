import 'reflect-metadata';
import { resolvers } from '../db/prisma/node_modules/@generated/type-graphql'; // to be generated
import { PrismaClient } from '@prisma/client';
import path from 'path';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';

interface Context {
  prisma: PrismaClient;
}

export async function main() {
  const schema = await buildSchema({
    resolvers,
    emitSchemaFile: path.resolve(__dirname, './generated-schema.graphql'),
    validate: false,
  });

  const prisma = new PrismaClient();
  await prisma.$connect();

  const server = new ApolloServer({
    schema,
    context: (): Context => ({ prisma }),
  });

  return server;
}

export const combineRESTGQL = async () => {
  const gqlServer = await main();
  await gqlServer.start();
  return gqlServer;
};
