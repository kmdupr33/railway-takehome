import express from "express";
import { createHandler } from "graphql-http/lib/use/express";
import { buildSchema } from "graphql";
import path from "path";
import auth_middleware from "./auth_middleware";
import { createProxyMiddleware } from "http-proxy-middleware";

// Construct a schema, using GraphQL schema language
const schema = buildSchema(`
  type Query {
    hello: String
  }
`);

// The root provides a resolver function for each API endpoint
const root = {
  hello() {
    return "Hello world!";
  },
};

const app = express();
app.use(express.static(path.resolve(__dirname, "react")));
app.use("/auth", createProxyMiddleware({ target: process.env.AUTHORIZER_URL }));
app.post(
  "/graphql",
  auth_middleware,
  createHandler({
    schema: schema,
    rootValue: root,
  })
);

// Start the server at port
app.listen(process.env.PORT ?? 4000);
console.log("Running a GraphQL API server at http://localhost:4000/graphql");
