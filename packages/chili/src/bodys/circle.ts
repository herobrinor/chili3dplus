// Copyright 2022-2023 the Chili authors. All rights reserved. AGPL-3.0 license.

import { FacebaseNode, I18nKeys, IDocument, IShape, Property, Result, Serializer, XYZ } from "chili-core";

@Serializer.register(["document", "normal", "center", "radius"])
export class CircleNode extends FacebaseNode {
    override display(): I18nKeys {
        return "body.circle";
    }

    @Serializer.serialze()
    @Property.define("circle.center")
    get center() {
        return this.getPrivateValue("center");
    }
    set center(center: XYZ) {
        this.setProperty("center", center);
    }

    @Serializer.serialze()
    @Property.define("circle.radius")
    get radius() {
        return this.getPrivateValue("radius");
    }
    set radius(radius: number) {
        this.setProperty("radius", radius);
    }

    @Serializer.serialze()
    get normal(): XYZ {
        return this.getPrivateValue("normal");
    }

    constructor(document: IDocument, normal: XYZ, center: XYZ, radius: number) {
        super(document);
        this.setPrivateValue("normal", normal);
        this.setPrivateValue("center", center);
        this.setPrivateValue("radius", radius);
    }

    generateShape(): Result<IShape, string> {
        let circle = this.document.application.shapeFactory.circle(this.normal, this.center, this.radius);
        if (!circle.isOk || !this.isFace) return circle;
        let wire = this.document.application.shapeFactory.wire(circle.value);
        return wire.isOk ? wire.value.toFace() : circle;
    }
}
