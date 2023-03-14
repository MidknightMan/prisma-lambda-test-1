import app from './app';
import { combineRESTGQL } from './db/graphql/apolloServer';
import { initClient } from './rabbitmq';
const port = process.env.PORT || '5000';

const start = async () => {
  await initClient();
  const gqlServer = await combineRESTGQL();
  gqlServer.applyMiddleware({ app });
  app.listen(port, () => {
    return console.log(
      `Server is listening on ${port}, graphQL path = ${gqlServer.graphqlPath}`
    );
  });
};

process.on('uncaughtException', function (err) {
  console.error(err);
});

start();
