import { useEffect, useState } from "react";
import "./App.css";

function App() {
  //State
  const [xboxController, setxboxController] = useState<{
    [key: string]: number;
  }>({});

  window.addEventListener("gamepadconnected", (ev: GamepadEvent) => {
    console.log(ev);
  });

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
    }, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="App">
      <h1 className="Buttons">{`${xboxController.buttonsPressed}`}</h1>
    </div>
  );
}

export default App;
