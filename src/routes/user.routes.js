const express = require("express");
const User = require("../models/User");
const { redisClient } = require("../config/redis");
const { producer } = require("../config/kafka");

const router = express.Router();
const tokenBucket = require("../middleware/rateLimiter");

router.use(tokenBucket);

// Create one user
router.post("/", async (req, res) => {
  try {

    // 1. Save user in MongoDB
    const user = await User.create(req.body);

    // 2. Publish event to Kafka
    await producer.send({
      topic: "user-events",
      messages: [
        {
          key: user._id.toString(),
          value: JSON.stringify({
            event: "USER_CREATED",
            data: {
              id: user._id,
              name: user.name,
              email: user.email,
              age: user.age,
            },
            timestamp: new Date().toISOString(),
          }),
        },
      ],
    });

    // 3. Return response
    res.status(201).json(user);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: error.message,
    });
  }
});

router.get("/search", async (req, res) => {
  try {
    const { name, email, age } = req.query;

    const filter = {};

    if (name) {
      filter.name = name;
    }

    if (email) {
      filter.email = email;
    }

    if (age) {
      const parsedAge = Number(age);

      if (Number.isNaN(parsedAge)) {
        return res.status(400).json({
          message: "Age must be a number",
        });
      }

      filter.age = parsedAge;
    }

    // Create unique Redis key for this search
    const cacheKey = `users:search:${name || ""}:${email || ""}:${age || ""}`;

    // 1. Check Redis
    const cachedUsers = await redisClient.get(cacheKey);

    if (cachedUsers) {
      console.log("Redis HIT");

      return res.json(JSON.parse(cachedUsers));
    }

    console.log("Redis MISS");

    // 2. Search MongoDB
    const users = await User.find(filter)
      .limit(50)
      .lean();

    // 3. Store result in Redis
    await redisClient.set(
      cacheKey,
      JSON.stringify(users),
      {
        EX: 300, // 5 minutes
      }
    );

    // 4. Return result
    res.json(users);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: error.message,
    });
  }
});

// Create 100 users
// router.get("/seed", async (req, res) => {
//   try {
//     const users = await User.insertMany(
//       Array.from({ length: 100000 }, (_, i) => ({
//         name: `User ${i + 200}`,
//         email: `user${i + 200}@example.com`,
//         age: 20 + (i % 31),
//       }))
//     );

//     res.status(201).json(users);
//   } catch (error) {
//     res.status(500).json({
//       message: error.message,
//     });
//   }
// });

// Get all users
router.get("/", async (req, res) => {
  try {
    const users = await User.find();

    res.json(users);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});




module.exports = router;