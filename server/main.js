const dgram = require("dgram");
const fastify = require("fastify")();
const telloIp = "192.168.10.1";
const udp = 8889;
const udpTelloStatePort = 8890;
const djiTello = dgram.createSocket("udp4"),
  djiTelloState = dgram.createSocket("udp4");

//Global Varibale only for the drone

fastify.register(require("@fastify/websocket"));
fastify.register(async function (fast) {
  fast.get(
    "/",
    { websocket: true },
    (connection /* SocketStream */, req /* FastifyRequest */) => {
      djiTello
        .on("listening", () => {
          console.log("I am live");
        })
        .bind(udp);

      connection.socket.on("message", (message) => {
        // message.toString() === 'hi from client'

        const takeOffCmd = ["command", "takeoff"];
        const landingCmd = ["Command", "land"];

        //Takes message from the front end when controll input
        //console.log(JSON.parse(message));
        const controllerObj = JSON.parse(message);
        let takeOffBtn = Number(controllerObj.localControllerArray[8]);
        let landingBtn = controllerObj.localControllerArray[9];

        if (takeOffBtn === 1) {
          console.log("test");
          for (const command of takeOffCmd) {
            djiTello.send(command, 0, command.length, udp, telloIp, (err) => {
              console.log(err);
            });
          }
        }

        /**
         * Notes For Drone Operation:
         * Left Axis:
         * On the X Plane (going left and right), Left = -1 Right = 1
         * On the Y Plane (going up and down), Up = -1 Down = 1
         *
         * Right Axis:
         * On the X Plane (going left and right), Left = -1 Right = 1
         * On the Y Plane (going up and down), Up = -1 Down = 1
         */

        //DEADZONE MUST BE SET TO A NEW 0 THAT NEW 0 IS 0.2?
        let leftXaxis = Number(controllerObj.localControllerAxes[0].toFixed(1));
        let leftYaxis = Number(controllerObj.localControllerAxes[1].toFixed(1));
        let rightXaxis = Number(
          controllerObj.localControllerAxes[2].toFixed(1)
        );
        let rightYaxis = Number(
          controllerObj.localControllerAxes[3].toFixed(1)
        );

        /**
         * Do we need function that takes code
         * and pass it to the drone?
         *
         * OR
         *
         * Do we keep it all inside fastify?
         *
         *
         * If sideXYAxes value > deadzone
         * then drone moves
         * If sideXYAxes value < deadzone
         * return (returns drone to a idleState)
         */

        //This returns info the frontend
        connection.socket.send(`You have just pressed button: : Value `);
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

/*
This Returns Buttons Pressed
[
  0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0,
  0, 0, 0
]
Notes:
  Do x bc I pressed a button
  Button 8 / 9 will be our only button
  It for landing and take off




This Returns Axes
[
  0.026871085166931152,
  0.022720694541931152,
  0.06974899768829346,
  0.011978328227996826
]

Notes:
 We could use 0.0 as dead zone.
 From SDK, range is -100 thru 100 on all axes
 If SDK is -100 to 100,
 Our controller is -1 to 0.0 to 1

 We believe that, the axes determine the speed
*/
