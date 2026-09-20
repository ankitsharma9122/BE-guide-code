const Post = require("../models/Post");

const resolvers = {
  Query: {

    posts: async () => {
      return await Post.find()
        .sort({ createdAt: -1 })
        .lean();
    },

    postsByUser: async (_, { userId }) => {
      return await Post.find({ userId })
        .sort({ createdAt: -1 })
        .lean();
    },

  },
};

module.exports = resolvers;