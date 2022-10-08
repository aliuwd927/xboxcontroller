const dgram = require("dgram");
const fastify = require("fastify")();
const telloIp = "192.168.10.1";
const selfIp = "0.0.0.0";
const udp = 8889;
const stateOfTelloUDPPort = 8890;
const telloStreamUDP = 11111;
const djiTello = dgram.createSocket("udp4");
const djiTelloState = dgram.createSocket("udp4");
const djiTelloVideo = dgram.createSocket("udp4");

//Global Varibale only for the drone

fastify.register(require("@fastify/websocket"));
fastify.register(async function (fast) {
  fast.get(
    "/",
    { websocket: true },
    (connection /* SocketStream */, req /* FastifyRequest */) => {
      djiTello
        .on("listening", () => {
          console.log(
            "Server IP: " + djiTello.address().address,
            " Port: " + djiTello.address().port
          );
        })
        .bind(udp);
      //let videoFeed;
      // djiTelloVideo
      //   .on("message", (msg) => {
      //     //console.log(msg);
      //     //videoFeed = new Blob([msg]);
      //   })
      //   .bind(telloStreamUDP, selfIp);

      let droneState;
      djiTelloState
        .on("message", (msg) => {
          console.log(msg.toString().split(";"));
          droneState = msg.toString().split(";");
        })
        .bind(stateOfTelloUDPPort, selfIp);

      connection.socket.on("message", (message) => {
        // message.toString() === 'hi from client'

        //Takes message from the front end when controll input
        //console.log(JSON.parse(message));
        const controllerObj = JSON.parse(message);
        const cmd = Buffer.from("command");
        let telloStreamOnService = Number(
          controllerObj.localControllerArray[16]
        );
        let takeOffBtn = Number(controllerObj.localControllerArray[8]);
        let landingBtn = Number(controllerObj.localControllerArray[9]);
        //Note TODO: Input Emergency
        //let emergency;
        if (telloStreamOnService === 1) {
          //do something
          console.log("text sent");
          djiTelloStreamVideo(Buffer.from("streamon"));
        }
        if (takeOffBtn === 1) {
          sendFlightCommand(Buffer.from("takeoff"));
        }
        if (landingBtn === 1) {
          sendFlightCommand(Buffer.from("land"));
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

        let leftXaxis =
          Number(controllerObj.localControllerAxes[0].toFixed(1)) * 100;
        let leftYaxis =
          Number(controllerObj.localControllerAxes[1].toFixed(1)) * -100;
        let rightXaxis =
          Number(controllerObj.localControllerAxes[2].toFixed(1)) * 100;
        let rightYaxis =
          Number(controllerObj.localControllerAxes[3].toFixed(1)) * 100;

        //Must follow rc a b c d
        //if all axes = 0
        // rc 0 0 0 0
        //THIS WORKS! We lost a propellor though :(
        let rcCmd = Buffer.from(
          `rc ${leftXaxis} ${leftYaxis} ${rightYaxis} ${rightXaxis}`
        );

        djiTello.send(rcCmd, 0, rcCmd.length, udp, telloIp, (err) => {
          console.log(err);
        });
        //If all axes = 0, do nothing
        //else sendFlightCommand(rcCmd)

        function sendFlightCommand(flightCmd) {
          djiTello.send(cmd, 0, cmd.length, udp, telloIp, (err) => {
            console.log(err);
          });
          djiTello.send(flightCmd, 0, flightCmd.length, udp, telloIp, (err) => {
            console.log(err);
          });
        }

        function djiTelloStreamVideo(streamcmd) {
          djiTello.send(cmd, 0, cmd.length, udp, telloIp, (err) => {
            console.log(err);
          });
          djiTello.send(streamcmd, 0, streamcmd.length, udp, telloIp, (err) => {
            console.log(err);
          });
        }

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

        //implement lodash throttle
        connection.socket.send(JSON.stringify(droneState));

        /*
        
        lodash throttle??

        djiTelloState
        .on("message", throttle(msg) => {
          console.log(msg.toString().split(";"));
         const droneState = msg.toString().split(";");
          connection.socket.send(JSON.stringify({ droneState: droneState }));
        },100)
        .bind(stateOfTelloUDPPort, selfIp);
        */
        //connection.socket.send(JSON.stringify({ video: videoFeed }));
      });
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

/*
  [
  'pitch:0',  'roll:0',
  'yaw:-9',   'vgx:0',
  'vgy:0',    'vgz:0',
  'templ:88', 'temph:89',
  'tof:10',   'h:0',
  'bat:90',   'baro:35.67',
  'time:0',   'agx:-14.00',
  'agy:0.00', 'agz:-1001.00',
  '\r\n'
]
 */

/*

xmetrix: you should setup a deadzone
xmetrix: for the controller axes
xmetrix: and send stop() command if its in the deadzone



(node:1296) MaxListenersExceededWarning: Possible EventEmitter memory leak detected. 
11 listening listeners added to [Socket]. Use emitter.setMaxListeners() to increase limit   
(Use `node --trace-warnings ...` to show where the warning 
was created)


ffmpeg -probesize 32 -analyzeduration 0 -fflags nobuffer -flags low_delay -strict experimental -f h264 -i udp://@0.0.0.0:11111 -f sdl "Tello"
*/
