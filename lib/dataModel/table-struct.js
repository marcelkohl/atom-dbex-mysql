'use babel';

class TableStruct {
  constructor(name, columns, fks) {
    this.name = name || ""
    this.columns = columns || {}
    this.fks = fks || {}
  }
}

class TableColumn {
  constructor(values) {
    this.name = ""
    this.dataType = ""
    this.length = 0
    this.isPk = false
    this.isNotNull = false
    this.isAutoInc = false
    this.isUniqKey = false
    this.defaultValue = ""

    Object.assign(this, values)
  }
}

class TableFk {
  constructor(values) {
    this.field = ""
    this.references = ""
    this.onDelete = ""
    this.onUpdate = ""

    Object.assign(this, values)
  }
}

//https://www.tutorialspoint.com/mysql/mysql-data-types.htm
class DataType {
  get commons() {
    return [
      {title:'INT', value:'int'},
      {title:'VARCHAR', value:'varchar'},
      {title:'TINYINT (boolean)', value:'tinyint'},
      {title:'DECIMAL', value:'decimal'},
      {title:'DATETIME', value:'datetime'},
    ]
  }

  get dates() {
    return [
      {title:'DATE', value:'date'},
      {title:'DATETIME', value:'datetime'},
      {title:'TIMESTAMP', value:'timestamp'},
      {title:'TIME', value:'time'},
      {title:'YEAR', value:'year'},
    ]
  }

  get numbers() {
    return [
      {title:'INT', value:'int'},
      {title:'TINYINT (boolean)', value:'tinyint'},
      {title:'SMALLINT', value:'smallint'},
      {title:'MEDIUMINT', value:'mediumint'},
      {title:'BIGINT', value:'bigint'},
      {title:'FLOAT', value:'float'},
      {title:'DOUBLE', value:'double'},
      {title:'DECIMAL', value:'decimal'},
    ]
  }

  get strings() {
    return [
      {title:'CHAR', value:'char'},
      {title:'VARCHAR', value:'varchar'},
      {title:'BLOB', value:'blob'},
      {title:'TINYBLOB', value:'tinyblob'},
      {title:'MEDIUMBLOB', value:'mediumblob'},
      {title:'LONGBLOB', value:'longblob'},
      {title:'ENUM', value:'enum'},
    ]
  }
}

class EventAction {
  get list() {
    return [
      {title:'RESTRICT', value:'RESTRICT'},
      {title:'CASCADE', value:'CASCADE'},
      {title:'SET NULL', value:'SET NULL'},
      {title:'NO ACTION', value:'NO ACTION'},
      {title:'SET DEAULT', value:'SET DEAULT'},
    ]
  }
}

const dataTypes = new DataType()
const eventActions = new EventAction()

export default {TableStruct, TableColumn, TableFk, dataTypes, eventActions}
