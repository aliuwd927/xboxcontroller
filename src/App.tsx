import "./App.css";

function App() {
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
      pollGamepads();
    }
  }

  function pollGamepads(): void {
    //constant data stream
    setInterval(() => {
      const gamePads: Gamepad | null = navigator.getGamepads()[0];

      if (gamePads !== null) {
        for (let i = 0; i < gamePads?.buttons.length; i++) {
          let buttons = gamePads?.buttons[i];
          console.log(buttons);
        }
      }
    }, 100);
  }

  return <div className="App"></div>;
}

export default App;
