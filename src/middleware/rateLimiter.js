const { redisClient } = require("../config/redis");

const CAPACITY = 5;       // Maximum tokens
const REFILL_RATE = 1;    // 1 token per second

const tokenBucketScript = `
local key = KEYS[1]

local capacity = tonumber(ARGV[1])
local refillRate = tonumber(ARGV[2])
local now = tonumber(ARGV[3])

local data = redis.call("HMGET", key, "tokens", "lastRefill")

local tokens = tonumber(data[1])
local lastRefill = tonumber(data[2])

-- First request
if tokens == nil then
    tokens = capacity
    lastRefill = now
end

-- Calculate how much time has passed
local elapsed = now - lastRefill

-- Add new tokens
local newTokens = elapsed * refillRate

tokens = math.min(capacity, tokens + newTokens)

-- Try to consume one token
if tokens >= 1 then
    tokens = tokens - 1

    redis.call(
        "HMSET",
        key,
        "tokens", tokens,
        "lastRefill", now
    )

    redis.call("EXPIRE", key, 60)

    return {1, tokens}
else

    redis.call(
        "HMSET",
        key,
        "tokens", tokens,
        "lastRefill", now
    )

    redis.call("EXPIRE", key, 60)

    return {0, tokens}
end
`;

async function tokenBucket(req, res, next) {
  try {
    const ip = req.ip;

    const key = `token-bucket:${ip}`;

    const now = Date.now() / 1000;

    const result = await redisClient.eval(tokenBucketScript, {
      keys: [key],
      arguments: [
        CAPACITY.toString(),
        REFILL_RATE.toString(),
        now.toString()
      ]
    });

    const allowed = Number(result[0]);
    const remaining = Number(result[1]);

    console.log({
      ip,
      allowed,
      remaining
    });

    res.setHeader(
      "X-RateLimit-Limit",
      CAPACITY
    );

    res.setHeader(
      "X-RateLimit-Remaining",
      Math.floor(remaining)
    );

    if (allowed === 0) {
      return res.status(429).json({
        message: "Too many requests"
      });
    }

    next();

  } catch (error) {
    console.error("Token bucket error:", error);

    // Redis failure -> allow request
    next();
  }
}

module.exports = tokenBucket;