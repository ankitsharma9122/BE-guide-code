require("dotenv").config();
const express = require("express");
const connectDB = require("./config/db");
const { connectRedis } = require("./config/redis");
const { producer } = require("./config/kafka");
const startConsumer = require("../consumers/userConsumer");
const userRoutes = require("./routes/user.routes");
const postRoutes = require("./routes/post.routes");

const app = express();

app.use(express.json());

app.get("/health", (req, res) => {
  res.json({
    status: "UP",
  });
});

app.use("/users", userRoutes);
app.use("/posts", postRoutes);

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    // Start Kafka consumer
    await startConsumer();
    // Connect MongoDB
    await connectDB();

    // Connect Redis
    await connectRedis();

    await producer.connect();

    // Start server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error);
    process.exit(1);
  }
}

startServer();