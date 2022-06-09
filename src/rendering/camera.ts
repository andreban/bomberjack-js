import { mat4, vec2, vec3 } from 'gl-matrix';

const OPENGL_TO_WGPU_MATRIX = mat4.fromValues(
  1.0, 0.0, 0.0, 0.0,
  0.0, 1.0, 0.0, 0.0,
  0.0, 0.0, 0.5, 0.0,
  0.0, 0.0, 0.5, 1.0,
);

export const CAMERA_UNIFORM_SIZE = 16 * 4; // 4x4 matrix of 32 bit floats.

export class Camera2d {
  private position: vec2;
  private size: vec2;

  constructor(width: number, height: number) {
    this.position = vec2.fromValues(0, 0);
    this.size = vec2.fromValues(width, height);
  }

  buildViewMatrix(): mat4 {
    const view = mat4.lookAt(
      mat4.create(),
      vec3.fromValues(this.position[0], this.position[1], 1.0),
      vec3.fromValues(this.position[0], this.position[1], 0.0),
      vec3.fromValues(0.0, 1.0, 0.0),
    );
    const proj = mat4.orthoNO(
      mat4.create(),
      0.0,
      this.size[0],
      0.0,
      this.size[1],
      0.1,
      100.0);
    return mat4.multiply(mat4.create(), proj, view);
  }

  toArray(): Float32Array {
    const viewProjectionMatrix = this.buildViewMatrix();
    const result = mat4.multiply(mat4.create(), OPENGL_TO_WGPU_MATRIX, viewProjectionMatrix);
    return new Float32Array(result);
  }
}