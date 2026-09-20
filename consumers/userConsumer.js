const { Kafka } = require("kafkajs");

const kafka = new Kafka({
  clientId: "dummy-consumer",
  brokers: ["localhost:9092"],
});

const consumer = kafka.consumer({
  groupId: "dummy-user-consumer-group",
});

async function startConsumer() {
  await consumer.connect();

  console.log("Kafka consumer connected");

  await consumer.subscribe({
    topic: "user-events",
    fromBeginning: false,
  });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const event = JSON.parse(message.value.toString());

      console.log("=================================");
      console.log("Kafka Event Received");
      console.log("Topic:", topic);
      console.log("Partition:", partition);
      console.log("Event:", event);
      console.log("=================================");
    },
  });
}

module.exports = startConsumer;