export type InputType = 'left' | 'right' | 'up' | 'down';

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
    return this.inputState[inputType];
  }
}