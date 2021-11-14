"use babel"

import {CompositeDisposable} from 'atom';
import {TableStruct, TableColumn, TableFk, dataTypes, eventActions} from '../dataModel/table-struct';

export default class CreateTable {
  constructor() {
    this._fieldCounter = 0;
    this._fkCounter = 0;
    this._onSave = ()=>false;
    // this._customValues = {};
    this.disposables = new CompositeDisposable();
    this.destroyables = [];

    this.element = this.render();
    this._addFieldLine();
    this._setEvents();
  }

  _setEvents() {
    this.element.querySelector('.fields-container .add-new-field').addEventListener(
      'click',
      () => this._addFieldLine()
    );
    this.element.querySelector('.fields-container .remove-field').addEventListener(
      'click',
      () => {
        let rowSelected = this.element.querySelector('.fields-container tr.selected');

        if (rowSelected) {
          rowSelected.remove();
        }
      }
    );
    this.element.querySelector('.fks-container .add-new-field').addEventListener(
      'click',
      () => this._addFkLine()
    );
    this.element.querySelector('.fks-container .remove-field').addEventListener(
      'click',
      () => {
        let rowSelected = this.element.querySelector('.fks-container tr.selected');

        if (rowSelected) {
          rowSelected.remove();
        }
      }
    );
    this.element.getElementsByClassName('btn-cancel')[0].addEventListener(
      'click',
      () => this.close()
    );
    this.element.getElementsByClassName('btn-save')[0].addEventListener(
      'click',
      () => this._onSave(this.formData)
    );
  }

  render() {
    let dialogElement = document.createElement('div');
    dialogElement.id = 'mysql-create-table';

    dialogElement.innerHTML = `
      <section class='dbex dialog'>
        <div class='heading section-heading'>Table Info</div>
        <section class="row row-centered content">
          <div class="control-group">
            <div class="controls table-base-info">
            </div>
            <div class="attributes">
              <input class="tab" type="radio" name="tabs" id="tab-fields" checked /><label for="tab-fields">Fields</label>
              <input class="tab" type="radio" name="tabs" id="tab-foreign-keys" /><label for="tab-foreign-keys">Foreign keys</label>
              <div class="tab content-fields controls fields-container">
                  <div class='heading section-heading inner-section-header'>
                    <span>&nbsp;</span>
                    <span class="remove-field button pull-right" data-original-title="" title="Remove selected field"><i class="fa fa-minus clickable"></i></span>
                    <span class="add-new-field button pull-right" data-original-title="" title="Add new field"><i class="fa fa-plus clickable"></i></span>
                  </div>

                  <table class="table-create-fields">
                    <thead>
                      <tr>
                        <th> </th>
                        <th style="width:150px;">Name</th>
                        <th style="width:150px;">Data Type</th>
                        <th>Length</th>
                        <th class="align-center"><span title="Primary Key">PK</span></th>
                        <th class="align-center"><span title="Not NULL">NN</span></th>
                        <th class="align-center"><span title="Auto Increment">AI</span></th>
                        <th class="align-center"><span title="Unique Key">UN</span></th>
                        <th>Default</th>
                      </tr>
                    </thead>
                    <tbody>
                    </tbody>
                  </table>
              </div>
              <div class="tab content-foreign-keys controls fks-container">
                  <div class='heading section-heading inner-section-header'>
                    <span>&nbsp;</span>
                    <span class="remove-field button pull-right" data-original-title="" title="Remove selected FK"><i class="fa fa-minus clickable"></i></span>
                    <span class="add-new-field button pull-right" data-original-title="" title="Add new FK"><i class="fa fa-plus clickable"></i></span>
                  </div>

                  <table class="table-create-fks">
                    <thead>
                      <tr>
                        <th> </th>
                        <th style="width:150px;"><span title="Field in this table">Field</span></th>
                        <th style="width:150px;"><span title="Field in the other table (example: product.id)">References</span></th>
                        <th>On Delete</th>
                        <th>On Update</th>
                      </tr>
                    </thead>
                    <tbody>
                    </tbody>
                  </table>
              </div>

            </div>
          </div>
        </section>

        <div class='footer'>
          <button type="button" class='btn-save btn btn-default selected pull-right'>Save</button>
          <button type="button" class='btn-cancel btn btn-default pull-left'>Cancel</button>
        </div>
      </section>
    `;

    let baseInfoArea = dialogElement.querySelector('.table-base-info');
    baseInfoArea.appendChild(this._createSelector(`create-table-schema`, 1, [], {label: 'Schema'}));
    baseInfoArea.appendChild(this._createEditor('create-table-name', 2, {label: 'Table Name'}))

    return dialogElement;
  }

  _addFieldLine() {
    let fieldsPerLine = 8;
    let tableColEl = ()=>document.createElement('td');
    let indexTab = (sequence)=>this.fieldCounter * fieldsPerLine + sequence;
    let typesList = []
    typesList.push(...dataTypes.commons)
    typesList.push({divider:"true"}, ...dataTypes.strings)
    typesList.push({divider:"true"}, ...dataTypes.numbers)
    typesList.push({divider:"true"}, ...dataTypes.dates)

    let drag = tableColEl();
    drag.classList.add('align-center');
    drag.title = 'Drag row by clicking here';
    drag.innerHTML = '<span><i class="fa fa-ellipsis-v" aria-hidden="true"></i></span>';

    let customLine = document.createElement('tr');
    customLine.classList.add('controls', 'custom-field-line')
    customLine.addEventListener(
      'click',
      (row) => {
        let lastSelected = row.target.closest('tbody').querySelector('.selected');
        if (lastSelected) {
          lastSelected.classList.remove('selected');
        }
        row.target.closest('tr').classList.add('selected');
      }
    );

    this.fieldCounter++;

    customLine.appendChild(drag);
    customLine.appendChild(this._createEditor(`name-${this.fieldCounter}`, indexTab(1), {targetEl: tableColEl(), dataset:{colitem:"name"}}));
    customLine.appendChild(this._createSelector(`type-${this.fieldCounter}`, indexTab(2), typesList, {targetEl: tableColEl(), dataset:{colitem: "type"}}));
    customLine.appendChild(this._createEditor(`length-${this.fieldCounter}`, indexTab(3), {targetEl: tableColEl(), dataset:{colitem: "length"}}));
    customLine.appendChild(this.createColCheckbox(`pk-${this.fieldCounter}`, indexTab(4), false, {dataset:{colitem: "priKey"}}));
    customLine.appendChild(this.createColCheckbox(`nn-${this.fieldCounter}`, indexTab(5), false, {dataset:{colitem: "notNull"}}));
    customLine.appendChild(this.createColCheckbox(`ai-${this.fieldCounter}`, indexTab(6), false, {dataset:{colitem: "autoInc"}}));
    customLine.appendChild(this.createColCheckbox(`un-${this.fieldCounter}`, indexTab(7), false, {dataset:{colitem: "uniqKey"}}));
    customLine.appendChild(this._createEditor(`default-${this.fieldCounter}`, indexTab(8), {targetEl: tableColEl(), dataset:{colitem: "default"}}));

    this.element.querySelector(".table-create-fields tbody").appendChild(customLine);
  }

  _addFkLine() {
    let fieldsPerLine = 4;
    let tableColEl = ()=>document.createElement('td');
    let indexTab = (sequence)=>this.fkCounter * fieldsPerLine + sequence;
    let drag = document.createElement('td');
    drag.classList.add('align-center');
    drag.title = 'Drag row by clicking here';
    drag.innerHTML = '<span><i class="fa fa-ellipsis-v" aria-hidden="true"></i></span>';

    let customLine = document.createElement('tr');
    customLine.classList.add('controls', 'custom-field-line')
    customLine.addEventListener(
      'click',
      (row) => {
        let lastSelected = row.target.closest('tbody').querySelector('.selected');
        if (lastSelected) {
          lastSelected.classList.remove('selected');
        }
        row.target.closest('tr').classList.add('selected');
      }
    );

    this.fkCounter++;

    customLine.appendChild(drag);
    customLine.appendChild(this._createEditor(`table-field-${this.fkCounter}`, indexTab(1), {targetEl: tableColEl(), dataset:{colitem: "tabField"}}));
    customLine.appendChild(this._createEditor(`reference-${this.fkCounter}`, indexTab(2), {targetEl: tableColEl(), dataset:{colitem: "reference"}}));
    customLine.appendChild(this._createSelector(`on-delete-${this.fkCounter}`, indexTab(3), eventActions.list, {targetEl: tableColEl(), selectedValue:'NO ACTION', dataset:{colitem: "onDelete"}}));
    customLine.appendChild(this._createSelector(`on-update-${this.fkCounter}`, indexTab(4), eventActions.list, {targetEl: tableColEl(), selectedValue:'NO ACTION', dataset:{colitem: "onUpdate"}}));

    this.element.querySelector(".table-create-fks tbody").appendChild(customLine);
  }

  _createEditor(id, index = 0, options = {}) {
    let el = options.targetEl || document.createElement('span');
    let label = options.label ? `<label class="control-label"><div class="title">${options.label}</div></label>` : '';

    el.innerHTML = `
      ${label}
      <div class="controls">
        <div class="editor-container">
        </div>
      </div>
    `;

    let editElement = atom.workspace.buildTextEditor({mini:true});
    editElement.element.id = id;
    editElement.element.tabIndex = index;
    editElement.setText(options.customValue || "");
    this.destroyables.push(editElement);

    if (options.dataset) {
      Object.assign(editElement.element.dataset, options.dataset);
    }

    el.getElementsByClassName("editor-container")[0].appendChild(editElement.element);

    return el;
  }

  _createSelector(id, index=0, selOptions=[], options={}) {
    let el = options.targetEl || document.createElement('span');
    let label = options.label ? `<label class="control-label"><div class="title">${options.label}</div></label>` : '';
    let selOptionsEl = "";

    selOptions.forEach(selOption => {
      let isSelected = selOption.value === options.selectedValue ? "selected" : "";

      if (selOption.divider) {
        selOptionsEl += `
          <option style="font-size: 0.5pt; background-color: #d9dbde3d;" disabled>&nbsp;</option>
        `;
      } else {
        selOptionsEl += `
          <option value='${selOption.value}' ${isSelected}>${selOption.title}</option>
        `;
      }
    });

    el.innerHTML = `
      ${label}
      <div class="controls">
        <select tabindex="${index}" id="${id}" class="form-control" data-original-title="" title="">
          ${selOptionsEl}
        </select>
      </div>
    `;

    if (options.dataset) {
      Object.assign(el.querySelector(`#${id}`).dataset, options.dataset);
    }

    return el;
  }

  createColCheckbox(id, index = 0, isChecked = false, options={}) {
    let el = document.createElement('td');

    el.innerHTML = `
      <div class="align-center">
        <input id="${id}" tabIndex=${index} type="checkbox" class="input-checkbox" data-original-title="" title="" ${isChecked ? "checked" : ""}>
      </div>
    `;

    if (options.dataset) {
      Object.assign(el.querySelector(`#${id}`).dataset, options.dataset);
    }

    return el;
  }

  set fkCounter(counter) {
    this._fkCounter = counter;
  }

  get fkCounter() {
    return this._fkCounter;
  }

  set fieldCounter(counter) {
    this._fieldCounter = counter;
  }

  get fieldCounter() {
    return this._fieldCounter;
  }

  get formData() {
    let content = this.element;
    let columns = [];
    let fks = [];

    content.querySelectorAll('.table-create-fields .custom-field-line').forEach((item) => {
      columns.push(new TableColumn({
        name: item.querySelector('[data-colitem="name"]').innerText,
        dataType: item.querySelector('[data-colitem="type"]').value,
        length: item.querySelector('[data-colitem="length"]').innerText,
        isPk: item.querySelector('[data-colitem="priKey"]').checked,
        isNotNull: item.querySelector('[data-colitem="notNull"]').checked,
        isAutoInc: item.querySelector('[data-colitem="autoInc"]').checked,
        isUniqKey: item.querySelector('[data-colitem="uniqKey"]').checked,
        defaultValue: item.querySelector('[data-colitem="default"]').innerText,
      }))
    });

    content.querySelectorAll('.table-create-fks tbody .custom-field-line').forEach((item) => {
      console.log('fk', item)
      fks.push(new TableFk({
        field: item.querySelector('[data-colitem="tabField"]').innerText,
        references: item.querySelector('[data-colitem="reference"]').innerText,
        onDelete: item.querySelector('[data-colitem="onDelete"]').value,
        onUpdate: item.querySelector('[data-colitem="onUpdate"]').value,
      }))
    })

    return new TableStruct(
      content.querySelector('#create-table-name').innerText,
      columns,
      fks
    );
  }

  /**
   * @param {TreeItem[]} schemas
   * @param {string} defaultName
   */
  show(schemas, defaultName) {
    console.log(schemas)
    if (!this.dialogPanel) {
      let options = '';

      schemas.forEach((schema) => {
        let isSelected = schema.name === defaultName ? "selected" : "";
        options += `<option value="${schema.name}" ${isSelected}>${schema.name}</option>`;
      });

      let schemasSelector = this.element.querySelector('#create-table-schema');
      schemasSelector.innerHTML = '<option value="">Select...</option>' + options;

      this.dialogPanel = atom.workspace.addModalPanel({item:this.element});
    }
  }

  close() {
    if (this.dialogPanel) {
      this.dispose();
    }
  }

  set onSave(onSave) {
    this._onSave = (formData)=>{
      if (onSave(formData) === true) {
        this.close();
      }
    };
  }

  dispose() {
    this.dialogPanel.hide()
    this.element.remove()
    this.dialogPanel.destroy()
    this.dialogPanel = null
    this.disposables.dispose();

    this.destroyables.forEach((item) => {
      item.destroy();
    });
  }
}
