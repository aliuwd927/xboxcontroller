import { useEffect, useState, useRef } from "react";
import "./App.css";

function App() {
  //State
  const [xboxController, setxboxController] = useState({});

  let gamepadObj: Gamepad[] = [];

  useEffect(() => {
    window.addEventListener(
      "gamepadconnected",
      (ev: GamepadEvent) => {
        gamepadHandler(ev, true);
      },
      false
    );

    return () => {
      window.removeEventListener(
        "gamepadconnected",
        (ev: GamepadEvent) => {
          gamepadHandler(ev, true);
        },
        false
      );
    };
  });

  let haveEvents = "gamepadconnected" in window;

  function gamepadHandler(event: GamepadEvent, connecting: boolean): void {
    const gamePad: Gamepad = event.gamepad;

    if (connecting) {
      gamepadObj[gamePad.index] = gamePad;
    }
  }

  //constant data stream
  useEffect(() => {
    const gamePads: Gamepad | null = navigator.getGamepads()[0];

    if (gamePads !== null) {
      for (let i = 0; i < gamePads?.buttons.length; i++) {
        let buttons = gamePads?.buttons[i];
        setxboxController({
          ...xboxController,
          gameButton: buttons,
        });
      }
      //console.log(xboxController);
    }
  }, [xboxController]);

  setInterval(() => {
    if (!haveEvents) navigator.getGamepads()[0];
  }, 1000);
  return (
    <div className="App">
      <div className="Buttons"></div>
    </div>
  );
}

export default App;
