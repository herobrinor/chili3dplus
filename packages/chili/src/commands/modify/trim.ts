// Copyright 2022-2023 the Chili authors. All rights reserved. AGPL-3.0 license.

import {
    AsyncController,
    CancelableCommand,
    EditableGeometryEntity,
    GeometryModel,
    I18n,
    ICurve,
    IDocument,
    IEdge,
    IShape,
    IShapeFilter,
    ITrimmedCurve,
    IView,
    ShapeType,
    Transaction,
    VisualShapeData,
    command,
} from "chili-core";
import { GeoUtils } from "chili-geo";
import { SelectionHandler } from "chili-vis";

@command({
    name: "modify.trim",
    display: "command.trim",
    icon: "icon-trim",
})
export class Trim extends CancelableCommand {
    protected override async executeAsync() {
        let transaction = new Transaction(
            this.document,
            this.document.history,
            I18n.translate("command.trim"),
        );
        transaction.start();
        try {
            while (!this.isCompleted) {
                this.controller = new AsyncController();
                let handler = new PickTrimEdgeEventHandler(this.document, this.controller);
                await this.document.selection.pickAsync(
                    handler,
                    "prompt.select.edges",
                    this.controller,
                    false,
                    "select.default",
                );
                if (this.controller.result?.status !== "success") {
                    break;
                }
                if (handler.selected) {
                    this.trimEdge(handler.selected);
                }
            }
        } catch (e) {
            transaction.rollback();
            throw e;
        }
        transaction.commit();
    }

    private trimEdge(selected: TrimEdge) {
        let model = this.document.visual.context.getModel(selected.edge.owner);
        selected.segments.retainSegments.forEach((segment) => {
            let newEdge = selected.curve.trim(segment.start, segment.end).makeEdge();
            let newEntity = new EditableGeometryEntity(this.document, newEdge);
            model?.parent?.add(new GeometryModel(this.document, model.name, newEntity));
        });

        model?.parent?.remove(model);
    }
}

export class EdgeFilter implements IShapeFilter {
    allow(shape: IShape): boolean {
        return shape.shapeType === ShapeType.Edge;
    }
}

interface TrimEdge {
    edge: VisualShapeData;
    curve: ICurve;
    segments: {
        deleteSegment: {
            start: number;
            end: number;
        };
        retainSegments: {
            start: number;
            end: number;
        }[];
    };
}

export class PickTrimEdgeEventHandler extends SelectionHandler {
    selected: TrimEdge | undefined;
    private highlightedEdge: number | undefined;
    private highlight: undefined | TrimEdge;

    constructor(document: IDocument, controller: AsyncController) {
        super(document, ShapeType.Shape, false, controller, new EdgeFilter());
    }

    protected override setHighlight(view: IView, detecteds: VisualShapeData[]): void {
        this.cleanHighlights();
        if (detecteds.length !== 1 || detecteds[0].shape.shapeType !== ShapeType.Edge) return;
        let otherEdges = findEdges(detecteds, view);
        let edge = detecteds[0].shape as IEdge;
        let curve = edge.curve();
        let segments = findSegments(curve, edge, otherEdges, detecteds);
        let mesh = edge.trim(segments.deleteSegment.start, segments.deleteSegment.end).mesh.edges!;
        mesh.color = 0xff0000;
        this.highlightedEdge = view.document.visual.context.displayMesh(mesh);
        this.highlight = {
            edge: detecteds[0],
            segments,
            curve,
        };

        view.update();
    }

    protected override cleanHighlights(): void {
        if (this.highlightedEdge !== undefined) {
            this.document.visual.context.removeMesh(this.highlightedEdge);
            this.highlightedEdge = undefined;
            this.highlight = undefined;
            this.document.application.activeView?.update();
        }
    }

    protected override clearSelected(document: IDocument): void {
        this.selected = undefined;
    }

    protected override select(view: IView, shapes: VisualShapeData[], event: PointerEvent): number {
        this.selected = this.highlight;
        return this.selected ? 1 : 0;
    }
}

function findEdges(detecteds: VisualShapeData[], view: IView) {
    let boundingBox = detecteds[0].owner.boundingBox();
    let otherEdges = view.document.visual.context
        .boundingBoxIntersectFilter(boundingBox, new EdgeFilter())
        .filter((d) => d.geometryEngity.shape.value!.id !== detecteds[0].shape.id)
        .map((x) => x.geometryEngity.shape.value as IEdge);
    return otherEdges;
}

function findSegments(curve: ITrimmedCurve, edge: IEdge, otherEdges: IEdge[], detecteds: VisualShapeData[]) {
    let intersections = GeoUtils.intersects(edge, otherEdges).map((x) => x.parameter);
    intersections.push(curve.firstParameter(), curve.lastParameter());
    intersections = [...new Set(intersections)].sort((a, b) => a - b);

    if (intersections.length === 2) return allSegment(intersections);

    let parameter = curve.parameter(detecteds[0].point!, 1e-3)!;
    for (let i = 1; i < intersections.length; i++) {
        if (parameter < intersections[i]) {
            if (i === 1) {
                return startSegment(intersections);
            } else if (i === intersections.length - 1) {
                return lastSegment(intersections);
            } else {
                return centerSegment(intersections, i);
            }
        }
    }

    return allSegment(intersections);
}

function allSegment(intersections: number[]) {
    return {
        deleteSegment: {
            start: intersections[0],
            end: intersections.at(-1)!,
        },
        retainSegments: [],
    };
}

function centerSegment(intersections: number[], i: number) {
    return {
        deleteSegment: {
            start: intersections.at(i - 1)!,
            end: intersections.at(i)!,
        },
        retainSegments: [
            {
                start: intersections[0],
                end: intersections[i - 1],
            },
            {
                start: intersections[i],
                end: intersections.at(-1)!,
            },
        ],
    };
}

function lastSegment(intersections: number[]) {
    return {
        deleteSegment: {
            start: intersections.at(-2)!,
            end: intersections.at(-1)!,
        },
        retainSegments: [
            {
                start: intersections[0],
                end: intersections.at(-2)!,
            },
        ],
    };
}

function startSegment(intersections: number[]) {
    return {
        deleteSegment: {
            start: intersections[0],
            end: intersections[1],
        },
        retainSegments: [
            {
                start: intersections[1],
                end: intersections.at(-1)!,
            },
        ],
    };
}
