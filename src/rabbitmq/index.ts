import amqlib, { Connection } from "amqplib";
import { v4 as uuidv4 } from "uuid";

let client: Connection | null = null;

export const initClient = async () => {
	client = await amqlib
		.connect(
			process.env.NODE_ENV === "production"
				? `amqp://${process.env.RABBIT_MQ_SERVICE_USER}:${process.env.RABBIT_MQ_SERVICE_PASSWORD}@${process.env.RABBIT_MQ_SERVICE_HOST}:5672`
				: "amqp://localhost"
		)
		.catch((err) => {
			console.error("Error connecting to RabbitMQ", err);
			return null;
		});
};

export const getClient = async () => {
	if (client) {
		return client;
	}
	throw new Error("RabbitMQ Client has not been initialised");
};

export const sendMessage = async (queue: string, data: any) => {
	if (!client) {
		throw new Error("RabbitMQ Client has not been initialised");
	}
	const channel = await client.createChannel();
	channel.assertQueue("", {
		durable: true
	});
	const msg = JSON.stringify(data);
	channel.sendToQueue(queue, Buffer.from(msg));
	console.log(" [x] Sent '%s'", data);
};
export const sendMessageForReply = async (
	queue: string,
	data: any,
	handleResponse: (response: any) => void
) => {
	if (!client) {
		throw new Error("RabbitMQ Client has not been initialised");
	}
	const channel = await client.createChannel();
	const channelAsserted = await channel.assertQueue(queue, {
		durable: true
	});
	channel.prefetch(1);
	await channel.consume(
		channelAsserted.queue,
		async (msg) => {
			console.log("message");
			if (msg && msg?.properties.correlationId == correlationId) {
				console.log(" [.] Got %s", msg.content.toString());
				handleResponse(JSON.parse(msg.content.toString()));
				setTimeout(async function () {
					await channel.close();
				}, 500);
			}
		},
		{ noAck: true }
	);
	const correlationId = uuidv4();
	const msg = JSON.stringify(data);
	channel.sendToQueue(queue, Buffer.from(msg), {
		correlationId,
		replyTo: channelAsserted.queue
	});
	console.log(" [x] Sent '%s'", data);
};

export const consumeMessage = async (queue: string) => {
	let returnedMsg: amqlib.ConsumeMessage | null = null;
	if (!client) {
		throw new Error("RabbitMQ Client has not been initialised");
	}
	const channel = await client.createChannel();
	channel.assertQueue(queue, {
		durable: true
	});
	const message = await channel.consume(queue, (msg) => {
		console.log(" [x] Received %s", msg && msg.content.toString());
		returnedMsg = msg;
		return msg;
	});
	return returnedMsg;
};

export const clientClose = async () => {
	if (client) {
		console.log("bye bye, closing the client");
		await client.close();
	}
};
