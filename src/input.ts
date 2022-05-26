export type InputType = 'left' | 'right' | 'up' | 'down';

export class InputState {
  private inputState: Map<InputType, boolean> = new Map();

  constructor(document: Document) {
    document.addEventListener('keydown', (ev) => {
      switch (ev.code) {
        case 'ArrowLeft':
          this.inputState.set('left', true);
          break;
        case 'ArrowRight':
          this.inputState.set('right', true);
          break;
        case 'ArrowUp':
          this.inputState.set('up', true);
          break;
        case 'ArrowDown':
          this.inputState.set('down', true);
          break;
      }
    });

    document.addEventListener('keyup', (ev) => {
      switch (ev.code) {
        case 'ArrowLeft':
          this.inputState.set('left', false);
          break;
        case 'ArrowRight':
          this.inputState.set('right', false);
          break;
        case 'ArrowUp':
          this.inputState.set('up', false);
          break;
        case 'ArrowDown':
          this.inputState.set('down', false);
          break;
      }      
    });
  }

  isPressed(inputType: InputType): boolean {
    if (!this.inputState.has(inputType)) {
      return false;
    }
    return this.inputState.get(inputType);
  }
}