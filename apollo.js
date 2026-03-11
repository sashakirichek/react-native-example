// apollo.js
import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";

export const graphqlApiLink = "https://rickandmortyapi.com/graphql";
const httpLink = new HttpLink({
  uri: graphqlApiLink,
});

export const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
});
