export type InputType = 'left' | 'right' | 'up' | 'down';

// TODO: I guess those IDs are not stable across different controllers brands?
// (seems stable across PS4 controllers). Likely need to map controller brand => Mapping.
const GamePadInputMap = {
  'left': 14,
  'right': 15,
  'up': 0, // Maps to X button, not up on the PS4 gamepad.
  'down': 13,
}

export class InputState {
  // Record<InputType, boolean> is a shortcut to {[key in InputType]: boolean}
  private inputState: Record<InputType, boolean>;
  
  // private inputState: Map<InputType, boolean> = new Map();
  constructor(document: Document) {
    this.inputState = {
      left: false,
      right: false,
      up: false,
      down: false,
    };

    document.addEventListener('keydown', (ev) => {
      switch (ev.code) {
        case 'ArrowLeft':
          this.inputState['left'] = true;
          break;
        case 'ArrowRight':
          this.inputState['right'] = true;
          break;
        case 'ArrowUp':
          this.inputState['up'] = true;
          break;
        case 'ArrowDown':
          this.inputState['down'] = true;
          break;
      }
    });

    document.addEventListener('keyup', (ev) => {
      switch (ev.code) {
        case 'ArrowLeft':
          this.inputState['left'] = false;
          break;
        case 'ArrowRight':
          this.inputState['right'] = false;
          break;
        case 'ArrowUp':
          this.inputState['up'] = false;
          break;
        case 'ArrowDown':
          this.inputState['down'] = false;
          break;
      }      
    });
  }

  isPressed(inputType: InputType): boolean {
    return this.inputState[inputType] ||
        navigator.getGamepads()[0] && navigator.getGamepads()[0].buttons[GamePadInputMap[inputType]].pressed;
  }
}