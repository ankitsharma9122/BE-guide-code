const typeDefs = `#graphql

  type Post {
    id: ID!
    title: String!
    content: String!
    userId: ID!
    createdAt: String
    updatedAt: String
  }

  type Query {
    posts: [Post!]!
    postsByUser(userId: ID!): [Post!]!
  }

`;

module.exports = typeDefs;