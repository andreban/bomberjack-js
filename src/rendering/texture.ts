export class Texture {
    constructor(public gpuTexture: GPUTexture, public gpuSampler: GPUSampler) {

    }

    static async fromImageBitmap(device: GPUDevice, queue: GPUQueue, imageBitmap: ImageBitmap): Promise<Texture> {
        // Create texture.
        const textureDescriptor = {
            label: 'textureDescriptor',
            format: 'rgba8unorm',
            size: { 
                width: imageBitmap.width,
                height: imageBitmap.height
            },
            usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT
        } as GPUTextureDescriptor;

        const texture = device.createTexture(textureDescriptor);
        queue.copyExternalImageToTexture({source: imageBitmap}, {texture: texture}, textureDescriptor.size) 

        const sampler = device.createSampler({
            addressModeU: 'clamp-to-edge',
            addressModeV: 'clamp-to-edge',
            addressModeW: 'clamp-to-edge',
            magFilter: 'linear',
            minFilter: 'nearest',
            mipmapFilter: 'nearest',
        });

        // Create shader.
        return new Texture(texture, sampler);
    }

    static async fromUrl(device: GPUDevice, queue: GPUQueue, url: string): Promise<Texture> {
        const response = await fetch(url);
        const blob = await response.blob();
        const imageBitmap = await createImageBitmap(blob);
        return Texture.fromImageBitmap(device, queue, imageBitmap);
    }
}
