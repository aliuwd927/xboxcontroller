import { useEffect, useState } from "react";
import "./App.css";

function App() {
  //State
  const [xboxController, setxboxController] = useState<{
    [key: string]: number;
  }>({});

  let gamepadObj: Gamepad[] = [];

  window.addEventListener(
    "gamepadconnected",
    (ev: GamepadEvent) => {
      gamepadHandler(ev, true);
    },
    false
  );

  function gamepadHandler(event: GamepadEvent, connecting: boolean): void {
    const gamePad: Gamepad = event.gamepad;

    if (connecting) {
      gamepadObj[gamePad.index] = gamePad;
    }
  }

  //constant data stream

  useEffect(() => {
    const interval = setInterval(() => {
      const gamePads: Gamepad | null = navigator.getGamepads()[0];
      let someVar: any = [];
      if (gamePads !== null) {
        for (let i = 0; i < gamePads?.buttons.length; i++) {
          someVar.push(gamePads.buttons[i].value);
        }
        setxboxController({
          buttonsPressed: someVar,
        });
      }
      return () => clearInterval(interval);
    }, 100);
  }, []);

  return (
    <div className="App">
      <div className="Buttons">{`${xboxController.buttonsPressed}`}</div>
    </div>
  );
}

export default App;
