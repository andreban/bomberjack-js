import { Camera2d } from './rendering/camera';
import { ColorQuadInstance } from './rendering/instances/quad';
import {Renderer} from './rendering/renderer';

const colorQuads: ColorQuadInstance[] = [
  new ColorQuadInstance({
    position: {x: -290, y: 0},
    size: {width: 100, height: 100},
    rotation: 45,
    color: {r: 1.0, g: 0.0, b: 0.0},
  }),
  new ColorQuadInstance({
    position: {x: -290, y: 0},
    size: {width: 100, height: 100},
    rotation: 45,
    color: {r: 1.0, g: 0.0, b: 0.0},
  }),
];

(async () => {
  const camera = new Camera2d(600, 650);
  const canvas = document.querySelector('#game-canvas') as HTMLCanvasElement;
  const renderer = await Renderer.create(canvas);
  const render = () => {
    renderer.render(camera, colorQuads);
    colorQuads[0].addRotation(1);
    requestAnimationFrame(render);
  };
  render();
})();
