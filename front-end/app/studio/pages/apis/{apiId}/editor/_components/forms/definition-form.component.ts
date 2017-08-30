/**
 * @license
 * Copyright 2017 JBoss Inc
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import {Component, EventEmitter, Input, Output, ViewChild, ViewEncapsulation} from "@angular/core";
import {Oas20Definitions, Oas20PropertySchema, Oas20SchemaDefinition} from "oai-ts-core";
import {
    createChangePropertyCommand,
    createChangePropertyTypeCommand,
    createDeletePropertyCommand,
    createNewSchemaPropertyCommand,
    createDeleteAllPropertiesCommand,
    createReplaceSchemaDefinitionCommand,
    createDeleteSchemaDefinitionCommand,
    createAddSchemaDefinitionCommand
} from "oai-ts-commands";
import {ICommand} from "../../_services/commands.manager";

import "brace/theme/eclipse";
import "brace/mode/json";
import {SourceFormComponent} from "./source-form.base";
import {SimplifiedType} from "../../_models/simplified-type.model";
import {AddSchemaPropertyDialogComponent} from "../dialogs/add-schema-property.component";
import {CloneDefinitionDialogComponent} from "../dialogs/clone-definition.component";


@Component({
    moduleId: module.id,
    selector: "definition-form",
    templateUrl: "definition-form.component.html",
    encapsulation: ViewEncapsulation.None
})
export class DefinitionFormComponent extends SourceFormComponent<Oas20SchemaDefinition> {

    private _definition: Oas20SchemaDefinition;
    @Input()
    set definition(definition: Oas20SchemaDefinition) {
        this._definition = definition;
        this.sourceNode = definition;
    }

    get definition(): Oas20SchemaDefinition {
        return this._definition;
    }

    @Output() onDeselect: EventEmitter<boolean> = new EventEmitter<boolean>();

    @ViewChild("addSchemaPropertyDialog") public addSchemaPropertyDialog: AddSchemaPropertyDialogComponent;
    @ViewChild("cloneDefinitionDialog") cloneDefinitionDialog: CloneDefinitionDialogComponent;

    protected createEmptyNodeForSource(): Oas20SchemaDefinition {
        return (<Oas20Definitions>this.definition.parent()).createSchemaDefinition(this.definition.definitionName());
    }

    protected createReplaceNodeCommand(node: Oas20SchemaDefinition): ICommand {
        return createReplaceSchemaDefinitionCommand(node.ownerDocument(), this.definition, node);
    }

    public openAddSchemaPropertyModal(): void {
        this.addSchemaPropertyDialog.open();
    }

    public hasProperties(): boolean {
        return this.properties().length > 0;
    }

    public properties(): Oas20PropertySchema[] {
        let rval: Oas20PropertySchema[] = [];
        this.definition.propertyNames().sort((left, right) => {
            return left.localeCompare(right);
        }).forEach(name => rval.push(<Oas20PropertySchema>this.definition.property(name)));

        return rval;
    }

    public changePropertyDescription(property: Oas20PropertySchema, newDescription: string): void {
        let command: ICommand = createChangePropertyCommand<string>(property.ownerDocument(), property, "description", newDescription);
        this.onCommand.emit(command);
    }

    public changePropertyType(property: Oas20PropertySchema, newType: SimplifiedType): void {
        let command: ICommand = createChangePropertyTypeCommand(property.ownerDocument(), property, newType);
        this.onCommand.emit(command);
    }

    public deleteProperty(property: Oas20PropertySchema): void {
        let command: ICommand = createDeletePropertyCommand(property.ownerDocument(), property);
        this.onCommand.emit(command);
    }

    public addSchemaProperty(name: string): void {
        let command: ICommand = createNewSchemaPropertyCommand(this.definition.ownerDocument(), this.definition, name);
        this.onCommand.emit(command);
    }

    public deleteAllSchemaProperties(): void {
        let command: ICommand = createDeleteAllPropertiesCommand(this.definition.ownerDocument(), this.definition);
        this.onCommand.emit(command);
    }

    public delete(): void {
        let command: ICommand = createDeleteSchemaDefinitionCommand(this.definition.ownerDocument(), this.definition.definitionName());
        this.onCommand.emit(command);
        this.onDeselect.emit(true);
    }

    public clone(modalData?: any): void {
        if (undefined === modalData || modalData === null) {
            this.cloneDefinitionDialog.open(this.definition);
        } else {
            let definition: Oas20SchemaDefinition = modalData.definition;
            console.info("[DefinitionFormComponent] Clone definition: %s", modalData.name);
            let cloneSrcObj: any = this.oasLibrary().writeNode(definition);
            let command: ICommand = createAddSchemaDefinitionCommand(this.definition.ownerDocument(), modalData.name, cloneSrcObj);
            this.onCommand.emit(command);
        }
    }

    public formType(): string {
        return "definition";
    }

    public enableSourceMode(): void {
        this.sourceNode = this.definition;
        super.enableSourceMode();
    }
}
