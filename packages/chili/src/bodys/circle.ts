// Copyright 2022-2023 the Chili authors. All rights reserved. AGPL-3.0 license.

import { FacebaseNode, I18nKeys, IDocument, IShape, Property, Result, Serializer, XYZ } from "chili-core";

@Serializer.register(["document", "normal", "center", "radius"])
export class CircleNode extends FacebaseNode {
    override display(): I18nKeys {
        return "body.circle";
    }

    private _center: XYZ;

    @Serializer.serialze()
    @Property.define("circle.center")
    get center() {
        return this._center;
    }
    set center(center: XYZ) {
        this.setProperty("center", center);
    }

    private _radius: number;

    @Serializer.serialze()
    @Property.define("circle.radius")
    get radius() {
        return this._radius;
    }
    set radius(radius: number) {
        this.setProperty("radius", radius);
    }

    private _normal: XYZ;

    @Serializer.serialze()
    get normal() {
        return this._normal;
    }

    constructor(document: IDocument, normal: XYZ, center: XYZ, radius: number) {
        super(document);
        this._normal = normal;
        this._center = center;
        this._radius = radius;
    }

    generateShape(): Result<IShape, string> {
        let circle = this.document.application.shapeFactory.circle(this.normal, this._center, this._radius);
        if (!circle.isOk || !this.isFace) return circle;
        let wire = this.document.application.shapeFactory.wire(circle.ok());
        return wire.isOk ? wire.ok().toFace() : circle;
    }
}
