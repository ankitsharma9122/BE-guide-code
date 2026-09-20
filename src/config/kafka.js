const { Kafka } = require("kafkajs");

const kafka = new Kafka({
  clientId: "user-service",
  brokers: ["localhost:9092"],
});

const producer = kafka.producer();

const consumer = kafka.consumer({
  groupId: "user-service-group",
});

module.exports = {
  kafka,
  producer,
  consumer,
};