// Copyright 2022-2023 the Chili authors. All rights reserved. AGPL-3.0 license.

import { IDisposable } from "../foundation";
import { IModel } from "../model";
import { ShapeMeshData } from "../shape";
import { IVisualObject } from "./visualObject";
import { IVisualGeometry } from "./visualShape";

export interface IVisualContext extends IDisposable {
    get shapeCount(): number;
    addMesh(meshData: ShapeMeshData): IVisualObject;
    addVisualObject(object: IVisualObject): void;
    removeVisualObject(object: IVisualObject): void;
    addModel(models: IModel[]): void;
    removeModel(models: IModel[]): void;
    getShape(model: IModel): IVisualGeometry | undefined;
    getModel(shape: IVisualGeometry): IModel | undefined;
    redrawModel(models: IModel[]): void;
    setVisible(model: IModel, visible: boolean): void;
    shapes(): IVisualGeometry[];
    displayShapeMesh(...datas: ShapeMeshData[]): number;
    removeShapeMesh(id: number): void;
}
