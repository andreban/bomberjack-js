const SHADER_CODE = `
  @stage(vertex)
  fn v_main(@builtin(vertex_index) VertexIndex : u32)
      -> @builtin(position) vec4<f32> {
    var pos = array<vec2<f32>, 3>(
        vec2<f32>(0.0, 0.5),
        vec2<f32>(-0.5, -0.5),
        vec2<f32>(0.5, -0.5));

    return vec4<f32>(pos[VertexIndex], 0.0, 1.0);
  }

  @stage(fragment)
  fn f_main() -> @location(0) vec4<f32> {
    return vec4<f32>(1.0, 0.0, 0.0, 1.0);
  }
`;

export class TrianglePipeline {
  constructor(private pipeline: GPURenderPipeline) {

  }

  static async create(device: GPUDevice, configuration: GPUCanvasConfiguration): Promise<TrianglePipeline> {
    const shader = device.createShaderModule({
      code: SHADER_CODE,
    });

    const pipeline = device.createRenderPipeline({
      layout: 'auto',
      vertex: {
        module: shader,
        entryPoint: 'v_main',
      },
      fragment: {
        module: shader,
        entryPoint: 'f_main',
        targets: [
          {
            format: configuration.format,
          },
        ],
      },
      primitive: {
        topology: 'triangle-list',
      },
    });
    return new TrianglePipeline(pipeline);
  }
  
  render(renderPass: GPURenderPassEncoder, queue: GPUQueue) {
    renderPass.setPipeline(this.pipeline);
    renderPass.draw(3, 1, 0, 0);
  }
}