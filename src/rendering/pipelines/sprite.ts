import { Texture } from "../texture";
// @ts-ignore
import textureUrl = require('../../assets/texture.png');
import { Camera2d, CAMERA_UNIFORM_SIZE } from "../camera";
import { glMatrix, mat4, vec3 } from "gl-matrix";

export class SpritePipeline {
    constructor(
        private renderPipeline: GPURenderPipeline,
        private cameraBuffer: GPUBuffer,
        private vertexBuffer: GPUBuffer,
        private indexBuffer: GPUBuffer,
        private instanceBuffer: GPUBuffer,
        private cameraGroup: GPUBindGroup,
        private textureGroup: GPUBindGroup,
    ) {

    }

    render(renderPass: GPURenderPassEncoder, queue: GPUQueue) {
        const camera = new Camera2d(600, 650);

        // Setup the square instance.
        const translation = vec3.fromValues(0, 0, 0.0);
        const scale = vec3.fromValues(600, 650, 1.0);
    
        const identity = mat4.identity(mat4.create());
        const translated = mat4.translate(mat4.create(), identity, translation);
        const rotated = mat4.rotateZ(mat4.create(), translated, glMatrix.toRadian(0));
        const scaled = mat4.scale(mat4.create(), rotated, scale);
        
        const tex_coords = [0.0, 0.0, 600.0 / 1162.0, 650.0 / 650.0];
        const instanceData = new Float32Array(20);
        instanceData.set(scaled, 0);
        instanceData.set(tex_coords, 16);
    
        queue.writeBuffer(this.instanceBuffer, 0, instanceData);
        
        // queue.writeBuffer(this.cameraBuffer, 0, new Float32Array(mat4.identity(mat4.create())));
        queue.writeBuffer(this.cameraBuffer, 0, camera.toArray());
    
        renderPass.setPipeline(this.renderPipeline);
        renderPass.setBindGroup(0, this.cameraGroup);
        renderPass.setBindGroup(1, this.textureGroup);
        renderPass.setVertexBuffer(0, this.vertexBuffer);
        renderPass.setVertexBuffer(1, this.instanceBuffer);
        renderPass.setIndexBuffer(this.indexBuffer, 'uint16');
        renderPass.drawIndexed(6, 1);
    }

    static async create(device: GPUDevice, queue: GPUQueue, configuration: GPUCanvasConfiguration)
            : Promise<SpritePipeline> {
        const spriteShader = device.createShaderModule({
            label: 'SpriteShader',
            code: SHADER_CODE,
        });
                
        // Create Texture.
        const texture = await Texture.fromUrl(device, queue, textureUrl);
        const textureBindgroupLayout = device.createBindGroupLayout({
            label: 'textureBindgroupLayout',
            entries: [
                {
                    binding: 0,
                    visibility: GPUShaderStage.FRAGMENT,
                    texture: {
                        multisampled: false,
                        sampleType: 'float',
                        viewDimension: '2d',
                    },
                } as GPUBindGroupLayoutEntry,
                {
                    binding: 1,
                    visibility: GPUShaderStage.FRAGMENT,
                    sampler: {type: 'filtering'} 
                } as GPUBindGroupLayoutEntry,
            ],
        });
        
        const diffuseBindGroup = device.createBindGroup({
            label: 'diffuseBindGroup',
            layout: textureBindgroupLayout,
            entries: [
                {
                    binding: 0,
                    resource: texture.gpuTexture.createView(),
                } as GPUBindGroupEntry,
                {
                    binding: 1,
                    resource: texture.gpuSampler,
                } as GPUBindGroupEntry,
            ],
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
                textureBindgroupLayout,
            ],
        });

        const renderPipeline = device.createRenderPipeline({
            label: 'QuadRenderPipeline',
            layout: renderPipelineLayout,
            vertex: {
                module: spriteShader,
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
                arrayStride: 80, // (4 * (f32 * 4)) + (f32 * 4)
                stepMode: 'instance',
                attributes: [
                    {
                    // Transform[0]
                    format: 'float32x4',
                    offset: 0,
                    shaderLocation: 1,
                    }
                    ,
                    {
                    // Transform[1]
                    format: 'float32x4',
                    offset: 16,
                    shaderLocation: 2,
                    }
                    ,
                    {
                    // Transformp[2] 
                    format: 'float32x4',
                    offset: 32,
                    shaderLocation: 3,
                    },
                    {
                    // Transform[3] 
                    format: 'float32x4',
                    offset: 48,
                    shaderLocation: 4,
                    },
                    {
                    // Texture coords
                    format: 'float32x4',
                    offset: 64,
                    shaderLocation: 5,
                    }
                ],
                } as GPUVertexBufferLayout],
            },
            fragment: {
                module: spriteShader,
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
            vertexPositions.set([
            -1.0, 1.0, 0.0,
            -1.0, -1.0, 0.0,
            1.0, 1.0, 0.0,
            1.0, -1.0, 0.0,
        ]);
        vertexBuffer.unmap();
        
        const indexBuffer = device.createBuffer({
            label: 'Quad Index Buffer',
            size: 6 * 2, // 6 * u16
            usage: GPUBufferUsage.INDEX,
            mappedAtCreation: true,
        });
        const indexPositions = new Uint16Array(indexBuffer.getMappedRange());
        indexPositions.set([0, 1, 2, 2, 1, 3]);
        indexBuffer.unmap();
        
        const instanceBuffer = device.createBuffer({
            label: 'Quad Instance Buffer',
            // Each instance is color: 3 * f32, transform: 4 * [4 * f32] = 76 bytes.
            size: 1000 * 80, // 1000 instances. 
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
            mappedAtCreation: false,
        });

        return new SpritePipeline(
            renderPipeline,
            cameraBuffer,
            vertexBuffer,
            indexBuffer,
            instanceBuffer,
            cameraBindGroup,
            diffuseBindGroup,
        );
    }
}

const SHADER_CODE = `
// Vertex shader
struct CameraUniform {
    view_proj: mat4x4<f32>,
};
@group(0) @binding(0)
var<uniform> camera: CameraUniform;

struct VertexInput {
    @location(0) position: vec3<f32>,
};

struct InstanceInput {
    @location(1) transform_1: vec4<f32>,
    @location(2) transform_2: vec4<f32>,
    @location(3) transform_3: vec4<f32>,
    @location(4) transform_4: vec4<f32>,
    @location(5) texture_info: vec4<f32>,
};

struct VertexOutput {
    @builtin(position) clip_position: vec4<f32>,
    @location(0) color: vec3<f32>,
    @location(1) tex_coords: vec2<f32>,
};

@stage(vertex)
fn vs_main(
    @builtin(vertex_index) in_vertex_index: u32,
    model: VertexInput,
    instance: InstanceInput,
) -> VertexOutput {
    let transform_matrix = mat4x4<f32>(
        instance.transform_1,
        instance.transform_2,
        instance.transform_3,
        instance.transform_4,
    );

    var out: VertexOutput;

    switch (i32(in_vertex_index)) {
        case 0 {
            out.tex_coords = vec2<f32>(instance.texture_info[0], instance.texture_info[1]);
        }
        case 1 {
            out.tex_coords = vec2<f32>(instance.texture_info[0], instance.texture_info[3]);
        }
        case 2 {
            out.tex_coords = vec2<f32>(instance.texture_info[2], instance.texture_info[1]);
        }
        default {
            out.tex_coords = vec2<f32>(instance.texture_info[2], instance.texture_info[3]);
        }
    }

    out.clip_position = camera.view_proj * transform_matrix * vec4<f32>(model.position, 1.0);
    return out;
}

@group(1) @binding(0)
var t_diffuse: texture_2d<f32>;

@group(1) @binding(1)
var s_diffuse: sampler;

// Fragment shader
@stage(fragment)
fn fs_main(in: VertexOutput) -> @location(0) vec4<f32> {
    return textureSample(t_diffuse, s_diffuse, in.tex_coords);
    // return vec4<f32>(1.0, 0.0, 1.0, 1.0);
}
`;
