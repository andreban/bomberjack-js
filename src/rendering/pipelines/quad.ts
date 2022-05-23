import { mat4, vec3, glMatrix} from 'gl-matrix';
import { Camera2d, CAMERA_UNIFORM_SIZE } from '../camera';
import { ColorQuadInstance } from '../instances/quad';
import { Quad } from '../meshes/quad';

export class QuadPipeline {
  constructor(
    private renderPipeline: GPURenderPipeline,
    private cameraBuffer: GPUBuffer,
    private vertexBuffer: GPUBuffer,
    private indexBuffer: GPUBuffer,
    private instanceBuffer: GPUBuffer,
    private cameraGroup: GPUBindGroup,
  ) {
  }

  static async create(device: GPUDevice, configuration: GPUCanvasConfiguration): Promise<QuadPipeline> {
    const quadShader = device.createShaderModule({
      label: 'QuadShader',
      code: QUAD_SHADER_CODE,
    });

    // Setup Camera Uniform
    const cameraBuffer = device.createBuffer({
      label: 'QuadCameraBuffer',
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
      size: CAMERA_UNIFORM_SIZE,
    });

    const cameraBindGroupLayout = device.createBindGroupLayout({
      label: 'QuadCameraBindGroupLayout',
      entries: [{
        binding: 0,
        visibility: GPUShaderStage.VERTEX,
        buffer: {
          hasDynamicOffset: false,
          type: 'uniform'
        },
      } as GPUBindGroupLayoutEntry],
    });

    const cameraBindGroup = device.createBindGroup({
      label: 'QuadcameraBindGroup',
      layout: cameraBindGroupLayout,
      entries: [{
        resource: {
          buffer: cameraBuffer,
        },
        binding: 0,
      }],
    });

    // Setup Render Pipeline
    const renderPipelineLayout = device.createPipelineLayout({
      label: 'QuadRenderPipelineLayout',
      bindGroupLayouts: [
        cameraBindGroupLayout,
      ],
    });

    const renderPipeline = device.createRenderPipeline({
      label: 'QuadRenderPipeline',
      layout: renderPipelineLayout,
      vertex: {
        module: quadShader,
        entryPoint: 'vs_main',
        buffers: [{
          // Definition for Vertex
          arrayStride: 3 * 4, // 3 * f32,
          stepMode: 'vertex',
          attributes: [{
            format: 'float32x3',
            offset: 0,
            shaderLocation: 0,
          }],
        } as GPUVertexBufferLayout, {
          arrayStride: 76, // (f32 * 3) + (4 * (f32 * 4))
          stepMode: 'instance',
          attributes: [
            { // Color
              format: 'float32x3',
              offset: 0,
              shaderLocation: 1,
            },
            {
              // Transform[0]
              format: 'float32x4',
              offset: 12,
              shaderLocation: 2,
            }
            ,
            {
              // Transform[1]
              format: 'float32x4',
              offset: 28,
              shaderLocation: 3,
            }
            ,
            {
              // Transformp[2] 
              format: 'float32x4',
              offset: 44,
              shaderLocation: 4,
            },
            {
              // Transform[3] 
              format: 'float32x4',
              offset: 60,
              shaderLocation: 5,
            }
          ],
        } as GPUVertexBufferLayout],
      },
      fragment: {
        module: quadShader,
        entryPoint: 'fs_main',
        targets: [{
          format: configuration.format,
          writeMask: GPUColorWrite.ALL,
        }],
      },
      primitive: {
        topology: 'triangle-list',
        frontFace: 'ccw',
        cullMode: 'back',
        unclippedDepth: false,
      },
      // multisample: {
      //   count: 1,
      //   mask: 1,
      //   alphaToCoverageEnabled: false,
      // },
    });

    const vertexBuffer = device.createBuffer({
      label: 'Quad Vertex Buffer',
      size: 4 * 3 * 4, // 4 * 3 * f32
      usage: GPUBufferUsage.VERTEX,
      mappedAtCreation: true,
    });
    const vertexPositions = new Float32Array(vertexBuffer.getMappedRange());
    vertexPositions.set(Quad.vertices);
    vertexBuffer.unmap();

    const indexBuffer = device.createBuffer({
      label: 'Quad Index Buffer',
      size: 6 * 2, // 6 * u16
      usage: GPUBufferUsage.INDEX,
      mappedAtCreation: true,
    });
    const indexPositions = new Uint16Array(indexBuffer.getMappedRange());
    indexPositions.set(Quad.indices);
    indexBuffer.unmap();

    const instanceBuffer = device.createBuffer({
      label: 'Quad Instance Buffer',
      // Each instance is color: 3 * f32, transform: 4 * [4 * f32] = 76 bytes.
      size: 1000 * ColorQuadInstance.BYTE_LENGTH, // 1000 instances. 
      usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
      mappedAtCreation: false,
    });

    return new QuadPipeline(
      renderPipeline,
      cameraBuffer,
      vertexBuffer,
      indexBuffer,
      instanceBuffer,
      cameraBindGroup,
    );
  }

  render(renderPass: GPURenderPassEncoder, queue: GPUQueue, camera: Camera2d, instances: ColorQuadInstance[]) {
    // Setup the square instance.
    let offset = 0;
    for (const instance of instances) {
      queue.writeBuffer(this.instanceBuffer, offset, instance.toArray());
      offset += ColorQuadInstance.BYTE_LENGTH;
    }
    
    queue.writeBuffer(this.cameraBuffer, 0, camera.toArray());

    renderPass.setPipeline(this.renderPipeline);
    renderPass.setBindGroup(0, this.cameraGroup);
    renderPass.setVertexBuffer(0, this.vertexBuffer);
    renderPass.setVertexBuffer(1, this.instanceBuffer);
    renderPass.setIndexBuffer(this.indexBuffer, 'uint16');
    renderPass.drawIndexed(Quad.indices.length, instances.length);
  }
}

const QUAD_SHADER_CODE = `

// Vertex shader
struct CameraUniform {
    view_proj: mat4x4<f32>,
};
@group(0) @binding(0)
var<uniform> camera: CameraUniform;

// Vertex shader
struct VertexInput {
    @location(0) position: vec3<f32>,
};

struct InstanceInput {
  @location(1) color: vec3<f32>,
  @location(2) transform_1: vec4<f32>,
  @location(3) transform_2: vec4<f32>,
  @location(4) transform_3: vec4<f32>,
  @location(5) transform_4: vec4<f32>,
};

struct VertexOutput {
    @builtin(position) clip_position: vec4<f32>,
    @location(0) color: vec3<f32>,
};

@stage(vertex)
fn vs_main(
    instance: InstanceInput,
    model: VertexInput,
    @builtin(vertex_index) vindex: u32,
) -> VertexOutput {
    let transform_matrix = mat4x4<f32>(
      instance.transform_1,
      instance.transform_2,
      instance.transform_3,
      instance.transform_4,
    );

    var out: VertexOutput;    
    out.clip_position = camera.view_proj * transform_matrix * vec4(model.position, 1.0);

    out.color = instance.color;
    return out;
}

// Fragment shader
@stage(fragment)
fn fs_main(in: VertexOutput) -> @location(0) vec4<f32> {
    return vec4<f32>(in.color, 1.0);
}
`;
