"use babel"

// import ColorPicker from "../component/color-picker";
import {CompositeDisposable} from 'atom';

export default class CreateTable {
  constructor() {
    this._fieldCounter = 0;
    this._fkCounter = 0;
    this._onSave = ()=>false;
    // this._customValues = {};
    // this._tabIndexStart = 3;
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
    baseInfoArea.appendChild(this._createSelector(`create-table-schema`, 1, [
      {title:'Schema 01', value:''},
      {title:'Database Test', value:'RESTRICT'},
    ], {label: 'Schema'}));
    baseInfoArea.appendChild(this._createEditor('create-table-name', 2, {label: 'Table Name'}))

    return dialogElement;
  }

  _addFieldLine() {
    let fieldsPerLine = 8;
    let tableColEl = ()=>document.createElement('td');
    let indexTab = (sequence)=>this.fieldCounter * fieldsPerLine + sequence;
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
    customLine.appendChild(this._createEditor(`name-${this.fieldCounter}`, indexTab(1), {targetEl: tableColEl()}));
    customLine.appendChild(this._createSelector(`type-${this.fieldCounter}`, indexTab(2), [ //https://www.tutorialspoint.com/mysql/mysql-data-types.htm
      {title:'INT', value:'int'},
      {title:'VARCHAR', value:'varchar'},
      {title:'TINYINT (boolean)', value:'tinyint'},
      {title:'DECIMAL', value:'decimal'},
      {title:'DATETIME', value:'datetime'},
      {divider: true},
      {title:'INT', value:'int'},
      {title:'TINYINT (boolean)', value:'tinyint'},
      {title:'SMALLINT', value:'smallint'},
      {title:'MEDIUMINT', value:'mediumint'},
      {title:'BIGINT', value:'bigint'},
      {title:'FLOAT', value:'float'},
      {title:'DOUBLE', value:'double'},
      {title:'DECIMAL', value:'decimal'},
      {divider: true},
      {title:'DATE', value:'date'},
      {title:'DATETIME', value:'datetime'},
      {title:'TIMESTAMP', value:'timestamp'},
      {title:'TIME', value:'time'},
      {title:'YEAR', value:'year'},
      {divider: true},
      {title:'CHAR', value:'char'},
      {title:'VARCHAR', value:'varchar'},
      {title:'BLOB', value:'blob'},
      {title:'TINYBLOB', value:'tinyblob'},
      {title:'MEDIUMBLOB', value:'mediumblob'},
      {title:'LONGBLOB', value:'longblob'},
      {title:'ENUM', value:'enum'},
    ], {targetEl: tableColEl()}));
    customLine.appendChild(this._createEditor(`length-${this.fieldCounter}`, indexTab(3), {targetEl: tableColEl()}));
    customLine.appendChild(this.createColCheckbox(`pk-${this.fieldCounter}`, indexTab(4)));
    customLine.appendChild(this.createColCheckbox(`nn-${this.fieldCounter}`, indexTab(5)));
    customLine.appendChild(this.createColCheckbox(`ai-${this.fieldCounter}`, indexTab(6)));
    customLine.appendChild(this.createColCheckbox(`un-${this.fieldCounter}`, indexTab(7)));
    customLine.appendChild(this._createEditor(`default-${this.fieldCounter}`, indexTab(8), {targetEl: tableColEl()}));

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
    customLine.appendChild(this._createEditor(`table-field-${this.fkCounter}`, indexTab(1), {targetEl: tableColEl()}));
    customLine.appendChild(this._createEditor(`reference-${this.fkCounter}`, indexTab(2), {targetEl: tableColEl()}));
    customLine.appendChild(this._createSelector(`on-delete-${this.fkCounter}`, indexTab(3), [
      {title:'', value:''},
      {title:'RESTRICT', value:'RESTRICT'},
      {title:'CASCADE', value:'CASCADE'},
      {title:'SET NULL', value:'SET NULL'},
      {title:'NO ACTION', value:'NO ACTION'},
      {title:'SET DEAULT', value:'SET DEAULT'},
    ], {targetEl: tableColEl()}));
    customLine.appendChild(this._createSelector(`on-update-${this.fkCounter}`, indexTab(4), [
      {title:'', value:''},
      {title:'RESTRICT', value:'RESTRICT'},
      {title:'CASCADE', value:'CASCADE'},
      {title:'SET NULL', value:'SET NULL'},
      {title:'NO ACTION', value:'NO ACTION'},
      {title:'SET DEAULT', value:'SET DEAULT'},
    ], {targetEl: tableColEl()}));

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

    el.getElementsByClassName("editor-container")[0].appendChild(editElement.element);

    return el;
  }

  _createSelector(id, index=0, selOptions=[], options={}) {
    let el = options.targetEl || document.createElement('span');
    let label = options.label ? `<label class="control-label"><div class="title">${options.label}</div></label>` : '';
    let selOptionsEl = "";

    selOptions.forEach(selOption => {
      if (selOption.divider) {
        selOptionsEl += `
          <option style="font-size: 0.5pt; background-color: #d9dbde3d;" disabled>&nbsp;</option>
        `;
      } else {
        selOptionsEl += `
          <option value='${selOption.value}'>${selOption.title}</option>
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

    return el;
  }

  createColCheckbox(id, index = 0, isChecked = false) {
    let el = document.createElement('td');

    el.innerHTML = `
      <div class="align-center">
        <input id="${id}" tabIndex=${index} type="checkbox" class="input-checkbox" data-original-title="" title="" ${isChecked ? "checked" : ""}>
      </div>
    `;

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

  // set connectionName(name) {
  //   this._connNameEditor.setText(name);
  // }

  get formData() {
  //   let content = this.element;
  //   let fields = {};
  //
  //   Array.from(content.getElementsByTagName('atom-text-editor')).forEach((item) => {
  //     fields[item.id] = item.getElementsByClassName('lines')[0].innerText.trim();
  //   });
  //
  //   Array.from(content.getElementsByClassName('input-checkbox')).forEach((item) => {
  //     fields[item.id] = item.checked;
  //   });
  //
  //   fields.color = this._colorPicker.getSelectedColor();
  //
  //   return Object.assign(
  //     {engine: content.getElementsByClassName("connection-engine")[0].value},
  //     fields,
  //     {customValues: this._customValues}
  //   );
    console.log("not implemented yet"); //TODO: implement get form data
    return {};
  }

  /**
   * @param Object[]    engine instances loaded from atom plugins
   * @param String      default value selected on show window
   */
  show(engines, defaultName) {
    if (!this.dialogPanel) {
  //     let options = '';
  //
  //     Object.entries(engines).forEach((engine) => {
  //       let [name, obj] = engine;
  //       let info = obj.getConnectionSettings();
  //       let isSelected = name === defaultName ? "selected" : "";
  //
  //       options += `<option value="${name}" ${isSelected}>${info.label}</option>`;
  //     });
  //
  //     this.element.getElementsByClassName("connection-engine")[0].innerHTML = '<option value="">Select...</option>' + options;
  //
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
