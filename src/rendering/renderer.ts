import { QuadPipeline } from "./pipelines/quad";
import { SpritePipeline } from "./pipelines/sprite";
import { TrianglePipeline } from "./pipelines/triangle";

export class Renderer {
  constructor(
     private adapter: GPUAdapter,
     private device: GPUDevice,
     private queue: GPUQueue,
     private context: GPUCanvasContext,
     private quadPipeline: QuadPipeline,
     private trianglePipeline: TrianglePipeline,
     private spritePipeline: SpritePipeline,
     ) {
  }

  render() {
    const output = this.context.getCurrentTexture();
    const view = output.createView();
    const encoder = this.device.createCommandEncoder({
      label: 'Command Encoder'
    });

    const renderPass = encoder.beginRenderPass({
      label: 'Render Pass',
      colorAttachments: [
        {
          view: view,
          clearValue: { r: 0, g: 1, b: 0, a: 1 },
          loadOp: 'clear',
          storeOp: 'store',
        } as GPURenderPassColorAttachment
      ],
    });
    
    // this.trianglePipeline.render(renderPass, this.queue);
    this.spritePipeline.render(renderPass, this.queue);
    this.quadPipeline.render(renderPass, this.queue);
    renderPass.end();

    this.queue.submit([encoder.finish()]);
  }

  static async create(canvas: HTMLCanvasElement): Promise<Renderer> {
    if (!navigator.gpu) {
      throw new Error('WebGPU is not supported :(');
    }
    const gpuAdapter = await navigator.gpu.requestAdapter();
    const gpuDevice = await gpuAdapter.requestDevice();
    const gpuQueue = gpuDevice.queue;
    const gpuCanvasContext: GPUCanvasContext = canvas.getContext('webgpu');

    const canvasConfig: GPUCanvasConfiguration = {
      device: gpuDevice,
      format: navigator.gpu.getPreferredCanvasFormat(),
      usage: GPUTextureUsage.RENDER_ATTACHMENT,
      compositingAlphaMode: 'opaque',
    };
    gpuCanvasContext.configure(canvasConfig);

    const quadPipeline = await QuadPipeline.create(gpuDevice, canvasConfig);
    const trianglePipeline = await TrianglePipeline.create(gpuDevice, canvasConfig);
    const spritePipeline = await SpritePipeline.create(gpuDevice, gpuQueue, canvasConfig);

    return new Renderer(
      gpuAdapter,
      gpuDevice,
      gpuQueue,
      gpuCanvasContext,
      quadPipeline,
      trianglePipeline,
      spritePipeline,
    );
  }
}
