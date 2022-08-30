const dgram = require("dgram");
const fastify = require("fastify")();
const telloIp = "192.168.10.1";
const udp = 8889;
const udpTelloStatePort = 8890;
const djiTello = dgram.createSocket("udp4"),
  djiTelloState = dgram.createSocket("udp4");

fastify.register(require("@fastify/websocket"));
fastify.register(async function (fast) {
  fast.get(
    "/hello-ws",
    { websocket: true },
    (connection /* SocketStream */, req /* FastifyRequest */) => {
      connection.socket.on("message", (message) => {
        // message.toString() === 'hi from client'
        // djiTello.send(message, 0, message.length, udp, telloIp);
        //Takes message from the front end when controll input
        let msgObj = JSON.parse(message);
        let buttonPressed = msgObj.buttons;
        let triggerValue = msgObj.buttonValue;
        console.log(triggerValue);

        connection.socket.send(
          `You have just pressed button:${buttonPressed} : Value ${triggerValue}`
        );
      });

      // djiTelloState
      //   .on("message", (message) => {
      //     console.log(`${message}`);
      //   })
      //   .bind(udpTelloStatePort);
    }
  );
});

fastify.listen({ port: 4000 }, (err) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
});
