import { useCallback, useEffect, useState } from "react";
import useWebSocket from "react-use-websocket";
import "./App.css";

function App() {
  //State
  const [isPressed, setIsPressed] = useState<{
    [key: string]: number[];
  }>({});

  const [controllerAxes, setControllerAxes] = useState<{
    [key: string]: number[];
  }>({});
  // In functional React component

  // This can also be an async getter function. See notes below on Async Urls.
  const socketUrl = "ws://localhost:4000/hello-ws";

  const {
    sendMessage,
    sendJsonMessage,
    lastMessage,
    lastJsonMessage,
    readyState,
    getWebSocket,
  } = useWebSocket(socketUrl, {
    onOpen: () => console.log("opened"),
    //Will attempt to reconnect on all close events, such as server shutting down
    shouldReconnect: (closeEvent) => true,
  });

  const sendToBackEnd = useCallback(() => {
    // console.log(isPressed.buttonsPressed?.[0]);
    //Have a for loop that checks every value of buttons
    //If value is true sendMsg()
    //false , do nothing
    // console.log(button);
    // if (Number(button) === 0) {
    //   return;
    // } else {
    //   sendMessage(button.toString());
    // }
    //Issue:
    //When button is depress, A button still read undefined.
  }, [sendMessage]);

  window.addEventListener("gamepadconnected", () => {
    //console.log(ev.gamepad?.buttons?.[8]);
  });

  //constant data stream

  useEffect(() => {
    const interval = setInterval(() => {
      //Controller Buttons Pressed Below
      const gamePads = navigator.getGamepads()[0];
      let someControllerButtons: number[] = [];
      if (gamePads !== null) {
        for (let i = 0; i < gamePads?.buttons.length; i++) {
          someControllerButtons.push(gamePads.buttons[i].value);
        }
        setIsPressed({
          buttonsPressed: someControllerButtons,
        });
        //Controller Axes Joystick Below
        let someControllerAxes: number[] = [];
        for (let j = 0; j < gamePads?.axes.length; j++) {
          someControllerAxes.push(gamePads?.axes[j]);
        }
        setControllerAxes({
          controllerAxes: someControllerAxes,
        });
      }
    }, 100);
    return () => clearInterval(interval);
  }, []);

  //Iterate thru the obect
  //if object.property value > 1 return t / f
  //sendMessage (boolean)

  return (
    <div className="App">
      <div className="previous_sent">
        <h1>{`${lastMessage?.data}`}</h1>
      </div>

      <div className="_Left_Analog_Stick_Container">
        <h3 className="_Left_Analog_Stick_X">
          Left Analog Stick X Values:{"  "}{" "}
          {`${controllerAxes.controllerAxes?.[0]}`}
        </h3>
        <h3 className="_Left_Analog_Stick_Y">
          Left Analog Stick Y Values:{"  "}{" "}
          {`${controllerAxes.controllerAxes?.[1]}`}
        </h3>
      </div>

      <div className="_Right_Analog_Stick_Container">
        <h3 className="_Right_Analog_Stick_X">
          Right Analog Stick X Values:{"  "}{" "}
          {`${controllerAxes.controllerAxes?.[2]}`}
        </h3>
        <h3 className="_Right_Analog_Stick_Y">
          Right Analog Stick Y Values:{"  "}{" "}
          {`${controllerAxes.controllerAxes?.[3]}`}
        </h3>
      </div>

      <div className="_Main_Aux_Button_Container">
        <h3 className="_Main_Aux_View">
          View: {`${isPressed.buttonsPressed?.[8]}`}
        </h3>
        <h3 className="_Main_Aux_Menu">
          Menu: {`${isPressed.buttonsPressed?.[9]}`}
        </h3>
      </div>

      <div className="_Main_Pad_Container">
        <h3 className="_Main_Pad_A">A: {`${isPressed.buttonsPressed?.[0]}`}</h3>
        <h3 className="_Main_Pad_B">B: {`${isPressed.buttonsPressed?.[1]}`}</h3>
        <h3 className="_Main_Pad_X">X: {`${isPressed.buttonsPressed?.[2]}`}</h3>
        <h3 className="_Main_Pad_Y">Y: {`${isPressed.buttonsPressed?.[3]}`}</h3>
      </div>

      <div className="_Main_DPad_Container">
        <h3 className="_Main_DPad_A">
          D_Pad U: {`${isPressed.buttonsPressed?.[12]}`}
        </h3>
        <h3 className="_Main_DPad_B">
          D_Pad D: {`${isPressed.buttonsPressed?.[13]}`}
        </h3>
        <h3 className="_Main_DPad_X">
          D_Pad L: {`${isPressed.buttonsPressed?.[14]}`}
        </h3>
        <h3 className="_Main_DPad_Y">
          D_Pad R: {`${isPressed.buttonsPressed?.[15]}`}
        </h3>
      </div>

      <div className="_Controller_Bumpers_Container">
        <h3 className="_Controller_Bumper_L">
          Bumper L: {`${isPressed.buttonsPressed?.[4]}`}
        </h3>
        <h3 className="_Controller_Bumper_R">
          Bumper R: {`${isPressed.buttonsPressed?.[5]}`}
        </h3>
        <h3 className="_Controller_Bumper_Trigger_L">
          Trigger L: {`${isPressed.buttonsPressed?.[6]}`}
        </h3>
        <h3 className="_Controller_Bumper_Trigger_R">
          Trigger R: {`${isPressed.buttonsPressed?.[7]}`}
        </h3>
      </div>
    </div>
  );
}

export default App;

/*

micheaaa: Also If you are going to send constant messages (controller commands) to the server (via express).
          It would be helpful to look into websockets (socketio)
micheaaa: socket io can be used with express

*/

/*
22:39 xmetrix: so you need a "state machine" of sorts that fires events ;) 

22:41 xmetrix: personally i'd create a controller object 
               and define all axis and buttons, then use that polling to deterministically set their values 
               and when im changing the value, fire off an event for each 

22:41 xmetrix: so when you have a stream of 1's on pressing the Button A, you can be like 
               if (button.a == 1) and mycontroller.a == 0 then... Ok we have a change.. mycontroller.a = 1 
               (fireEvent(buttonApressed) .... and likewise.. if button.a == 0 && mycontroller.a ==1 ok 
               we have release button fireEvent(buttona_released) mycontroller.a = 0 

22:43 xmetrix: that way .. the next time through if button.a == 1 and mycontroller.a == 0 will be false so 
               it wont fire off the change ;) 
*/

/*

Known:
gamePads.buttons has your polled button states (this already ready 0 / false)

Need to do:
need to compare someControllerButtons with the prior value
and only call setIsPressed if some button changed
it would be better not to even create someControllerButtons array unless something changed
when you iterate through each button rather than pushing to the array you could compare the 
value with the old value at the same index
if/when one changed, then create a copy of the old value and set the new one in the copy
then after the loop, only setIsPressed if someControllerButtons isn't undefined




so you'd poll.. get all the values.. 
then check each value of your controller object against the polled values
starting with buttona.. check polled value if it changed. update your buttona.. 
fire an event for buttona if it was pressed or released


so ideally you poll the controller to get an array of all the values
then for each of those values you have an object that has all those values

 */
