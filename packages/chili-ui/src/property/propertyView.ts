// Copyright 2022-2023 the Chili authors. All rights reserved. AGPL-3.0 license.

import {
    GeometryNode,
    I18nKeys,
    IConverter,
    IDocument,
    INode,
    IView,
    Node,
    NodeLinkedList,
    ParameterShapeNode,
    Property,
    PubSub,
    VisualNode,
} from "chili-core";
import { Expander, div, label, localize } from "../components";
import { MatrixConverter } from "./matrixConverter";
import style from "./propertyView.module.css";
import { appendProperty } from "./utils";

export class PropertyView extends HTMLElement {
    private readonly panel = div({ className: style.panel });

    constructor(props: { className: string }) {
        super();
        this.classList.add(props.className, style.root);
        this.append(
            label({
                className: style.header,
                textContent: localize("properties.header"),
            }),
            this.panel,
        );
        PubSub.default.sub("showProperties", this.handleShowProperties);
        PubSub.default.sub("activeViewChanged", this.handleActiveViewChanged);
    }

    private readonly handleActiveViewChanged = (view: IView | undefined) => {
        if (view) {
            let nodes = view.document.selection.getSelectedNodes();
            this.handleShowProperties(view.document, nodes);
        }
    };

    private readonly handleShowProperties = (document: IDocument, nodes: INode[]) => {
        this.removeProperties();
        if (nodes.length === 0) return;
        this.addModel(document, nodes);
        this.addGeometry(nodes, document);
    };

    private removeProperties() {
        while (this.panel.lastElementChild) {
            this.panel.removeChild(this.panel.lastElementChild);
        }
    }

    private addModel(document: IDocument, nodes: INode[]) {
        if (nodes.length === 0) return;

        let properties = div({ className: style.rootProperties });
        if (nodes[0] instanceof NodeLinkedList) {
            Property.getProperties(Object.getPrototypeOf(nodes[0])).forEach((x) => {
                appendProperty(properties, document, nodes, x);
            });
        } else if (nodes[0] instanceof Node) {
            Property.getOwnProperties(Node.prototype).forEach((x) => {
                appendProperty(properties, document, nodes, x);
            });
        }

        this.panel.append(properties);
    }

    private addGeometry(nodes: INode[], document: IDocument) {
        let geometries = nodes.filter((x) => x instanceof VisualNode);
        if (geometries.length === 0 || !this.isAllElementsOfTypeFirstElement(geometries)) return;
        this.addTransform(document, geometries);
        this.addParameters(geometries, document);
    }

    private addTransform(document: IDocument, geometries: VisualNode[]) {
        let matrix = new Expander("common.matrix");
        this.panel.append(matrix);

        const addMatrix = (display: I18nKeys, converter: IConverter) => {
            appendProperty(matrix, document, geometries, {
                name: "transform",
                display: display,
                converter,
            });
        };
        // 这部分代码有问题，待完善
        let converters = MatrixConverter.init();
        addMatrix("transform.translation", converters.translation);
        addMatrix("transform.scale", converters.scale);
        addMatrix("transform.rotation", converters.rotate);
    }

    private addParameters(geometries: VisualNode[], document: IDocument) {
        let entities = geometries.filter((x) => x instanceof VisualNode);
        if (entities.length === 0 || !this.isAllElementsOfTypeFirstElement(entities)) return;
        let parameters = new Expander(entities[0].display());
        this.panel.append(parameters);
        Property.getProperties(Object.getPrototypeOf(entities[0]), Node.prototype).forEach((x) => {
            appendProperty(parameters.contenxtPanel, document, entities, x);
        });
    }

    private isAllElementsOfTypeFirstElement(arr: any[]): boolean {
        if (arr.length <= 1) {
            return true;
        }
        const firstElementType = Object.getPrototypeOf(arr[0]).constructor;
        for (let i = 1; i < arr.length; i++) {
            if (Object.getPrototypeOf(arr[i]).constructor !== firstElementType) {
                return false;
            }
        }
        return true;
    }
}

customElements.define("chili-property-view", PropertyView);
