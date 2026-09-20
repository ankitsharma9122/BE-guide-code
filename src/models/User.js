const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    age: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
userSchema.index({ name: 1, age: 1 });

module.exports = mongoose.model("User", userSchema);