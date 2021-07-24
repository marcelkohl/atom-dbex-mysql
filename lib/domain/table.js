'use babel';

import TreeItem from '../dataModel/tree-item';
import ItemAction from '../dataModel/item-action';
import Trigger from './trigger';
import {default as ResultSet, TYPE} from '../dataModel/result-set';
import SqlPrettier from 'sql-prettier';

export class Table {
  get structType() {
    return 'Table';
  }

  getAll(connection, database, onDone, logger) {
    let query = `
SELECT T.TABLE_TYPE, T.TABLE_SCHEMA, GROUP_CONCAT(DISTINCT TG.TRIGGER_NAME) as TABLE_TRIGGERS, C.TABLE_NAME, C.COLUMN_NAME, C.ORDINAL_POSITION, C.DATA_TYPE, C.COLUMN_TYPE, C.COLUMN_KEY, C.COLUMN_COMMENT
  FROM INFORMATION_SCHEMA.COLUMNS C
LEFT JOIN INFORMATION_SCHEMA.TABLES T ON T.TABLE_NAME = C.TABLE_NAME
LEFT JOIN INFORMATION_SCHEMA.TRIGGERS TG ON TG.EVENT_OBJECT_TABLE = C.TABLE_NAME
 WHERE C.TABLE_SCHEMA = '${database}' AND TABLE_TYPE <> 'VIEW'
GROUP BY T.TABLE_TYPE, T.TABLE_SCHEMA, C.TABLE_NAME, C.COLUMN_NAME, C.ORDINAL_POSITION, C.DATA_TYPE, C.COLUMN_TYPE, C.COLUMN_KEY, C.COLUMN_COMMENT
ORDER BY C.TABLE_SCHEMA, C.TABLE_NAME, FIELD(C.COLUMN_KEY, 'PRI', 'UNI', 'MUL', '') ASC, C.ORDINAL_POSITION
`;

    logger.log(query);

    connection.query(query, (err, results, fields) => {
      if (err) {
        onDone(err);
        return;
      }

      let tables = [];
      let table = {label:undefined};
      let tableTriggers = [];

      results.forEach((record)=>{
        if (table.label !== record.TABLE_NAME) {
          if (table.name) {
            if (tableTriggers.length > 0) {
              table.children.push(
                new TreeItem({
                  label: 'Triggers',
                  name: record.TABLE_SCHEMA + "." + table.name,
                  icon: 'mysql-trigger',
                  children: Trigger.treeItemFromTriggerNames(tableTriggers, table.name),
                  details: tableTriggers.length,
                  collapsed: true,
                  datasets: {
                    triggers: record.TABLE_SCHEMA + "." + table.name,
                  },
                  actions: []
                })
              );
            }

            tables.push(table);
            tableTriggers = record.TABLE_TRIGGERS ? record.TABLE_TRIGGERS.split(',') : [];
          }

          table = new TreeItem({
            label: record.TABLE_NAME,
            name: record.TABLE_SCHEMA + "." + record.TABLE_NAME,
            icon: 'icon-table',
            children: [],
            details: "",
            collapsed: true,
            datasets: {
              table: record.TABLE_SCHEMA + "." + record.TABLE_NAME,
            },
            actions: [
              new ItemAction({name:"structure", icon:"icon-struct", description:"Show structure"}),
              // new ItemAction({name:"refresh", icon:"icon-refresh", description:"Refresh element"}),
            ]
          });
        }

        table.children.push(new TreeItem({
          label: record.COLUMN_NAME,
          name: record.TABLE_SCHEMA + "." + record.TABLE_NAME + "." + record.COLUMN_NAME,
          icon: record.COLUMN_KEY === "PRI" ? "icon-pk" : (record.COLUMN_KEY === "MUL" ? "icon-fk" : (record.COLUMN_KEY === "UNI" ? "icon-uk" : "icon-field")),
          details: record.COLUMN_TYPE,
          collapsed: true,
          datasets: {
            field: record.TABLE_SCHEMA + "." + record.TABLE_NAME + "." + record.COLUMN_NAME
          },
          actions: [
            // new ItemAction({name:"edit", icon:"icon-edit"}),
            // new ItemAction({name:"delete", icon:"icon-delete"}),
          ]
        }));
      });

      if (table.name) {
        tables.push(table);
      }

      onDone(tables);
    });
  }

  getContent(connection, table, onDone, logger) {
    let query = `
SELECT *
  FROM ${table}
 LIMIT 100
`;

    logger.log(query);

    connection.query(query, (err, results, fields) => {
      if (err) {
        onDone(err);
        return;
      }

      let resultSet = new ResultSet({
        columns: fields.map((f)=>{
          return {
            name: f.name,
            type: this._fieldType(f.type)
          };
        }),
        data: results.map((r)=>Object.values(r)),
        query: query
      });

      onDone(resultSet);
    });
  }

  getDataStructure(structureName, connection, onDone, logger) {
    let query = `SHOW CREATE ${this.structType} ${structureName}`;

    logger.log(query);

    connection.query(query, (err, results, fields) => {
      if (err) {
        onDone(err);
        return;
      }

      onDone(
        new ResultSet({
          query: SqlPrettier.format(
            results[0][`Create ${this.structType}`]
          )
        })
      );

      return;
    });
  }

  /**
   * @see http://mysql-python.sourceforge.net/MySQLdb-1.2.2/public/MySQLdb.constants.FIELD_TYPE-module.html
   */
  _fieldType(typeCode) {
    let number = [16, 0, 5, 247, 4, 9, 3, 8, 246, 11, 13];
    let text = [252, 255, 247, 251, 250, 254, 253, 15, 7];
    let boolean = [1];
    let date = [10, 12, 14];

    let result = TYPE.undefined;

    result = number.indexOf(typeCode) >= 0 ? TYPE.number : result;
    result = text.indexOf(typeCode) >= 0 ? TYPE.text : result;
    result = boolean.indexOf(typeCode) >= 0 ? TYPE.boolean : result;
    result = date.indexOf(typeCode) >= 0 ? TYPE.date : result;

    return result;
  }
}

export default new Table();
