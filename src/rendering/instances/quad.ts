import { glMatrix, mat4, vec2, vec3, vec4 } from "gl-matrix";

export type QuadInstanceParams = {
    position: {
        x: number,
        y: number,
    },
    size: {
        width: number,
        height: number,
    },
    rotation: number,
}

export type SpriteQuadInstanceParams = QuadInstanceParams & {
    texture: {
        x: number,
        y: number,
        w: number,
        h: number,
    }
};

export type ColorQuadInstanceParams = QuadInstanceParams & {
    color: {
        r: number,
        g: number,
        b: number,
    }
};

export abstract class QuadInstance {
    protected translation: vec3;
    protected scale: vec3;
    protected rotation: number;

    constructor(config: QuadInstanceParams) {
        this.translation = vec3.fromValues(config.position.x, config.position.y, 0.0);
        this.scale = vec3.fromValues(config.size.width, config.size.height, 0.0);
        this.rotation = config.rotation
    }

    public addRotation(amount: number) {
        this.rotation += amount;
    }

    protected transform(): mat4 {
        const identity = mat4.identity(mat4.create());
        const translated = mat4.translate(mat4.create(), identity, this.translation);
        const rotated = mat4.rotateZ(mat4.create(), translated, glMatrix.toRadian(this.rotation));
        const scaled = mat4.scale(mat4.create(), rotated, this.scale);
        return scaled;
    }
}

export class ColorQuadInstance extends QuadInstance {
    private static ARRAY_SIZE: number = 19;
    public static BYTE_LENGTH: number = ColorQuadInstance.ARRAY_SIZE * 4;
    private color: vec3;
    
    constructor(config: ColorQuadInstanceParams) {
        super(config);
        this.color = vec3.fromValues(config.color.r, config.color.g, config.color.b);
    }

    public toArray(): Float32Array {
        const array = new Float32Array(ColorQuadInstance.ARRAY_SIZE);
        array.set(this.color, 0);
        array.set(this.transform(), 3);
        return array;
    }
}

export class SpriteQuadInstance extends QuadInstance {
    private static ARRAY_SIZE: number = 20;
    public static BYTE_LENGTH: number = SpriteQuadInstance.ARRAY_SIZE * 4;

    private texture: vec4;

    constructor(config: SpriteQuadInstanceParams) {
        super(config);
        this.texture = vec4.fromValues(
            config.texture.x, config.texture.y, config.texture.w, config.texture.h);
    }

    public toArray(): Float32Array {
        const array = new Float32Array(SpriteQuadInstance.ARRAY_SIZE);
        array.set(this.transform(), 0);
        array.set(this.texture, 16);
        return array;
    }
}
