const express = require('express');

const app = express();
const PORT = 4000;

// ❌ Intentional memory leak
const cache = [];

// Simulate fetching users from DB/API
const getUsers = async () => {
  const users = [];

  for (let i = 0; i < 10000; i++) {
    users.push({
      id: i,
      name: `User-${i}`,
      email: `user${i}@example.com`,
      address: {
        city: 'Ranchi',
        country: 'India',
      },
      metadata: {
        createdAt: new Date(),
        randomData: 'A'.repeat(100),
      },
    });
  }

  return users;
};

app.get('/users', async (req, res) => {
  const users = await getUsers();

  // ❌ Memory leak:
  // Every request keeps another users array alive.
  cache.push(users);

  console.log(`Cache entries: ${cache.length}`);

  res.json({
    status: 'ok',
    usersCount: users.length,
    cacheEntries: cache.length,
  });
});

// Check memory usage
app.get('/memory', (req, res) => {
  const memory = process.memoryUsage();

  res.json({
    rssMB: (memory.rss / 1024 / 1024).toFixed(2),
    heapTotalMB: (memory.heapTotal / 1024 / 1024).toFixed(2),
    heapUsedMB: (memory.heapUsed / 1024 / 1024).toFixed(2),
    externalMB: (memory.external / 1024 / 1024).toFixed(2),
    arrayBuffersMB: (memory.arrayBuffers / 1024 / 1024).toFixed(2),
    cacheEntries: cache.length,
  });
});

app.listen(PORT, () => {
  console.log(`Memory leak demo running on http://localhost:${PORT}`);
});

//  node --inspect app.js
//  open chrome://inspect -> go to memory tab
//  take heap snapshot
//  compare snapshots to see memory leak