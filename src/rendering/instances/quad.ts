import { glMatrix, mat4, vec3 } from "gl-matrix";

export type ColorQuadInstanceParams = {
    position: {
        x: number,
        y: number,
    },
    size: {
        width: number,
        height: number,
    },
    rotation: number,
    color: {
        r: number,
        g: number,
        b:number,
    }
};
export class ColorQuadInstance {
    private static ARRAY_SIZE: number = 19;
    public static BYTE_LENGTH: number = ColorQuadInstance.ARRAY_SIZE * 4;
    private color: vec3;
    private translation: vec3;
    private scale: vec3;
    private rotation: number;
    
    constructor(config: ColorQuadInstanceParams) {
        this.translation = vec3.fromValues(config.position.x, config.position.y, 0.0);
        this.scale = vec3.fromValues(config.size.width, config.size.height, 0.0);
        this.color = vec3.fromValues(config.color.r, config.color.g, config.color.b);
        this.rotation = config.rotation
    }

    public addRotation(amount: number) {
        this.rotation += amount;
    }

    private transform(): mat4 {
        const identity = mat4.identity(mat4.create());
        const translated = mat4.translate(mat4.create(), identity, this.translation);
        const rotated = mat4.rotateZ(mat4.create(), translated, glMatrix.toRadian(this.rotation));
        const scaled = mat4.scale(mat4.create(), rotated, this.scale);
        return scaled;
    }

    public toArray(): Float32Array {
        const array = new Float32Array(ColorQuadInstance.BYTE_LENGTH);
        array.set(this.color, 0);
        array.set(this.transform(), 3);
        return array;
    }
}