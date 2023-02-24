// Copyright 2022-2023 the Chili authors. All rights reserved. MPL-2.0 license.

import { XYZ } from "./xyz";

export class Transform {
    private readonly arr: Float32Array = new Float32Array(16);

    public determinant(): number {
        let [a00, a01, a02, a03] = [this.arr[0], this.arr[1], this.arr[2], this.arr[3]];
        let [a10, a11, a12, a13] = [this.arr[4], this.arr[5], this.arr[6], this.arr[7]];
        let [a20, a21, a22, a23] = [this.arr[8], this.arr[9], this.arr[10], this.arr[11]];
        let [a30, a31, a32, a33] = [this.arr[12], this.arr[13], this.arr[14], this.arr[15]];

        let b0 = a00 * a11 - a01 * a10;
        let b1 = a00 * a12 - a02 * a10;
        let b2 = a01 * a12 - a02 * a11;
        let b3 = a20 * a31 - a21 * a30;
        let b4 = a20 * a32 - a22 * a30;
        let b5 = a21 * a32 - a22 * a31;
        let b6 = a00 * b5 - a01 * b4 + a02 * b3;
        let b7 = a10 * b5 - a11 * b4 + a12 * b3;
        let b8 = a20 * b2 - a21 * b1 + a22 * b0;
        let b9 = a30 * b2 - a31 * b1 + a32 * b0;

        return a13 * b6 - a03 * b7 + a33 * b8 - a23 * b9;
    }

    public toArray(): number[] {
        return [...this.arr];
    }

    public add(other: Transform): Transform {
        var result = new Transform();
        for (var index = 0; index < 16; index++) {
            result.arr[index] = this.arr[index] + other.arr[index];
        }
        return result;
    }

    public invert(): Transform | undefined {
        let [a00, a01, a02, a03] = [this.arr[0], this.arr[1], this.arr[2], this.arr[3]];
        let [a10, a11, a12, a13] = [this.arr[4], this.arr[5], this.arr[6], this.arr[7]];
        let [a20, a21, a22, a23] = [this.arr[8], this.arr[9], this.arr[10], this.arr[11]];
        let [a30, a31, a32, a33] = [this.arr[12], this.arr[13], this.arr[14], this.arr[15]];
        let b00 = a00 * a11 - a01 * a10;
        let b01 = a00 * a12 - a02 * a10;
        let b02 = a00 * a13 - a03 * a10;
        let b03 = a01 * a12 - a02 * a11;
        let b04 = a01 * a13 - a03 * a11;
        let b05 = a02 * a13 - a03 * a12;
        let b06 = a20 * a31 - a21 * a30;
        let b07 = a20 * a32 - a22 * a30;
        let b08 = a20 * a33 - a23 * a30;
        let b09 = a21 * a32 - a22 * a31;
        let b10 = a21 * a33 - a23 * a31;
        let b11 = a22 * a33 - a23 * a32;

        let det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
        if (det === 0) return undefined;
        det = 1.0 / det;

        return Transform.fromValues(
            (a11 * b11 - a12 * b10 + a13 * b09) * det,
            (a02 * b10 - a01 * b11 - a03 * b09) * det,
            (a31 * b05 - a32 * b04 + a33 * b03) * det,
            (a22 * b04 - a21 * b05 - a23 * b03) * det,
            (a12 * b08 - a10 * b11 - a13 * b07) * det,
            (a00 * b11 - a02 * b08 + a03 * b07) * det,
            (a32 * b02 - a30 * b05 - a33 * b01) * det,
            (a20 * b05 - a22 * b02 + a23 * b01) * det,
            (a10 * b10 - a11 * b08 + a13 * b06) * det,
            (a01 * b08 - a00 * b10 - a03 * b06) * det,
            (a30 * b04 - a31 * b02 + a33 * b00) * det,
            (a21 * b02 - a20 * b04 - a23 * b00) * det,
            (a11 * b07 - a10 * b09 - a12 * b06) * det,
            (a00 * b09 - a01 * b07 + a02 * b06) * det,
            (a31 * b01 - a30 * b03 - a32 * b00) * det,
            (a20 * b03 - a21 * b01 + a22 * b00) * det
        );
    }

    public setTranslation(vector: XYZ): Transform {
        let transform = this.clone();
        transform.setTranslationInplace(vector);
        return transform;
    }

    public setTranslationInplace(vector: XYZ) {
        this.arr[12] = vector.x;
        this.arr[13] = vector.y;
        this.arr[14] = vector.z;
    }

    public getTranslation(): XYZ {
        return new XYZ(this.arr[12], this.arr[13], this.arr[14]);
    }

    public multiply(other: Transform): Transform {
        let result = new Transform();

        let [a00, a01, a02, a03] = [this.arr[0], this.arr[1], this.arr[2], this.arr[3]];
        let [a10, a11, a12, a13] = [this.arr[4], this.arr[5], this.arr[6], this.arr[7]];
        let [a20, a21, a22, a23] = [this.arr[8], this.arr[9], this.arr[10], this.arr[11]];
        let [a30, a31, a32, a33] = [this.arr[12], this.arr[13], this.arr[14], this.arr[15]];

        let [b0, b1, b2, b3] = [other.arr[0], other.arr[1], other.arr[2], other.arr[3]];
        result.arr[0] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
        result.arr[1] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
        result.arr[2] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
        result.arr[3] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

        [b0, b1, b2, b3] = [other.arr[4], other.arr[5], other.arr[6], other.arr[7]];
        result.arr[4] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
        result.arr[5] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
        result.arr[6] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
        result.arr[7] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

        [b0, b1, b2, b3] = [other.arr[8], other.arr[9], other.arr[10], other.arr[11]];
        result.arr[8] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
        result.arr[9] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
        result.arr[10] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
        result.arr[11] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

        [b0, b1, b2, b3] = [other.arr[12], other.arr[13], other.arr[14], other.arr[15]];
        result.arr[12] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
        result.arr[13] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
        result.arr[14] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
        result.arr[15] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

        return result;
    }

    public equals(value: Transform): boolean {
        for (let i = 0; i < 16; i++) {
            if (this.arr[i] !== value.arr[i]) return false;
        }
        return true;
    }

    public clone(): Transform {
        return Transform.fromArray(this.toArray());
    }

    public static fromArray(array: ArrayLike<number>): Transform {
        var result = new Transform();
        for (var index = 0; index < 16; index++) {
            result.arr[index] = array[index];
        }
        return result;
    }

    public static fromValues(
        m11: number,
        m12: number,
        m13: number,
        m14: number,
        m21: number,
        m22: number,
        m23: number,
        m24: number,
        m31: number,
        m32: number,
        m33: number,
        m34: number,
        m41: number,
        m42: number,
        m43: number,
        m44: number
    ): Transform {
        var result = new Transform();

        result.arr[0] = m11;
        result.arr[1] = m12;
        result.arr[2] = m13;
        result.arr[3] = m14;
        result.arr[4] = m21;
        result.arr[5] = m22;
        result.arr[6] = m23;
        result.arr[7] = m24;
        result.arr[8] = m31;
        result.arr[9] = m32;
        result.arr[10] = m33;
        result.arr[11] = m34;
        result.arr[12] = m41;
        result.arr[13] = m42;
        result.arr[14] = m43;
        result.arr[15] = m44;

        return result;
    }

    public static identity(): Transform {
        return Transform.fromValues(1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0);
    }

    public static zero(): Transform {
        return Transform.fromValues(0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0);
    }

    public static rotationXTransform(angle: number): Transform {
        var result = new Transform();
        var s = Math.sin(angle);
        var c = Math.cos(angle);
        result.arr[0] = 1.0;
        result.arr[15] = 1.0;
        result.arr[5] = c;
        result.arr[10] = c;
        result.arr[9] = -s;
        result.arr[6] = s;
        return result;
    }

    public static rotationYTransform(angle: number): Transform {
        var result = new Transform();
        var s = Math.sin(angle);
        var c = Math.cos(angle);
        result.arr[5] = 1.0;
        result.arr[15] = 1.0;
        result.arr[0] = c;
        result.arr[2] = -s;
        result.arr[8] = s;
        result.arr[10] = c;
        return result;
    }

    public static rotationZTransform(angle: number): Transform {
        var result = new Transform();
        var s = Math.sin(angle);
        var c = Math.cos(angle);
        result.arr[10] = 1.0;
        result.arr[15] = 1.0;
        result.arr[0] = c;
        result.arr[1] = s;
        result.arr[4] = -s;
        result.arr[5] = c;
        return result;
    }

    public static rotationAxis(vector: XYZ, angle: number): Transform {
        let axis = vector.normalize();
        if (axis === undefined) throw "invalid vector";

        var result = Transform.zero();
        var s = Math.sin(-angle);
        var c = Math.cos(-angle);
        var c1 = 1 - c;

        result.arr[0] = axis.x * axis.x * c1 + c;
        result.arr[1] = axis.x * axis.y * c1 - axis.z * s;
        result.arr[2] = axis.x * axis.z * c1 + axis.y * s;
        result.arr[3] = 0.0;

        result.arr[4] = axis.y * axis.x * c1 + axis.z * s;
        result.arr[5] = axis.y * axis.y * c1 + c;
        result.arr[6] = axis.y * axis.z * c1 - axis.x * s;
        result.arr[7] = 0.0;

        result.arr[8] = axis.z * axis.x * c1 - axis.y * s;
        result.arr[9] = axis.z * axis.y * c1 + axis.x * s;
        result.arr[10] = axis.z * axis.z * c1 + c;
        result.arr[11] = 0.0;

        result.arr[15] = 1.0;
        return result;
    }

    public static scalingTransform(x: number, y: number, z: number): Transform {
        return Transform.fromValues(x, 0.0, 0.0, 0.0, 0.0, y, 0.0, 0.0, 0.0, 0.0, z, 0.0, 0.0, 0.0, 0.0, 1.0);
    }

    public static translationTransform(x: number, y: number, z: number): Transform {
        return Transform.fromValues(1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, x, y, z, 1.0);
    }

    public transpose(): Transform {
        var result = new Transform();
        result.arr[0] = this.arr[0];
        result.arr[1] = this.arr[4];
        result.arr[2] = this.arr[8];
        result.arr[3] = this.arr[12];

        result.arr[4] = this.arr[1];
        result.arr[5] = this.arr[5];
        result.arr[6] = this.arr[9];
        result.arr[7] = this.arr[13];

        result.arr[8] = this.arr[2];
        result.arr[9] = this.arr[6];
        result.arr[10] = this.arr[10];
        result.arr[11] = this.arr[14];

        result.arr[12] = this.arr[3];
        result.arr[13] = this.arr[7];
        result.arr[14] = this.arr[11];
        result.arr[15] = this.arr[15];

        return result;
    }

    public ofPoint(point: XYZ): XYZ {
        var x = point.x * this.arr[0] + point.y * this.arr[4] + point.z * this.arr[8] + this.arr[12];
        var y = point.x * this.arr[1] + point.y * this.arr[5] + point.z * this.arr[9] + this.arr[13];
        var z = point.x * this.arr[2] + point.y * this.arr[6] + point.z * this.arr[10] + this.arr[14];
        var w = point.x * this.arr[3] + point.y * this.arr[7] + point.z * this.arr[11] + this.arr[15];

        return new XYZ(x / w, y / w, z / w);
    }

    public ofVector(vector: XYZ): XYZ {
        var x = vector.x * this.arr[0] + vector.y * this.arr[4] + vector.z * this.arr[8];
        var y = vector.x * this.arr[1] + vector.y * this.arr[5] + vector.z * this.arr[9];
        var z = vector.x * this.arr[2] + vector.y * this.arr[6] + vector.z * this.arr[10];
        return new XYZ(x, y, z);
    }
}
