// Copyright 2022-2023 the Chili authors. All rights reserved. MPL-2.0 license.

import {
    Container,
    Id,
    IDocument,
    IHistory,
    IModelManager,
    ISelection,
    IViewer,
    IVisualization,
    Observable,
    Token,
} from "chili-core";
import { IVisualizationFactory } from "chili-vis";
import { Application } from "./application";

import { History } from "./history";
import { ModelManager } from "./modelManager";
import { Viewer } from "./viewer";

export class Document extends Observable implements IDocument {
    private static readonly _documentMap: Map<string, IDocument> = new Map();

    readonly models: IModelManager;
    readonly viewer: IViewer;
    readonly selection: ISelection;
    readonly visualization: IVisualization;
    readonly history: IHistory;

    private constructor(name: string, readonly id: string) {
        super();
        this._name = name;
        this.models = new ModelManager(this);
        this.history = new History();
        this.viewer = new Viewer(this);
        this.visualization = this.getRender();
        this.selection = this.visualization.selection;
    }

    static create(app: Application, name: string) {
        let doc = new Document(name, Id.new());
        this.cacheDocument(doc);
        app.activeDocument = doc;
        return doc;
    }

    static get(id: string): IDocument | undefined {
        return this._documentMap.get(id);
    }

    private static cacheDocument(document: IDocument) {
        if (this._documentMap.has(document.id)) return;
        this._documentMap.set(document.id, document);
    }

    private getRender(): IVisualization {
        let renderFactory = Container.default.resolve<IVisualizationFactory>(Token.VisulizationFactory);
        return renderFactory!.create(this);
    }

    private _name: string;

    get name(): string {
        return this._name;
    }

    set name(name: string) {
        this.setProperty("name", name);
    }

    toJson() {
        return {
            id: this.id,
            name: this._name,
        };
    }

    static fromJson(data: any) {
        let document = new Document(data.name, data.id);
        // data.models.forEach(x => document.addModel(x))
        return document;
    }
}
