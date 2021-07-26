'use babel';

import TreeItem from '../dataModel/tree-item';
import ItemAction from '../dataModel/item-action';
import pascalCase from '../helper/pascal-case';
import {default as ResultSet, TYPE} from '../dataModel/result-set';
import SqlPrettier from 'sql-prettier';

export class Routine {
  get type() {
    return 'UNDEFINED';
  }

  get iconClass() {
    return 'mysql-function'
  }

  getAll(connection, database, onDone, logger) {
    let query = `
SELECT ROUTINE_SCHEMA, ROUTINE_NAME
  FROM INFORMATION_SCHEMA.ROUTINES
 WHERE ROUTINE_TYPE = '${this.type}' AND ROUTINE_SCHEMA='${database}'
`;

    logger.log(query);

    connection.query(query, (err, results, fields) => {
      if (err) {
        console.log("query failed", err)
        console.log("error code", err.code)
        onDone(err);
        return;
      }

      let functions = [];

      results.forEach((record)=>{
        functions.push(new TreeItem({
          label: record.ROUTINE_NAME,
          name: record.ROUTINE_SCHEMA + "." + record.ROUTINE_NAME,
          icon: this.iconClass,
          details: "",
          collapsed: true,
          datasets: {
            routine: record.ROUTINE_NAME,
            schema: record.ROUTINE_SCHEMA,
            routineType: this.type
          },
          actions: [
            new ItemAction({name:"structure", icon:"icon-struct", description:"Show structure"}),
          ]
        }));
      });

      onDone(functions);
    });
  }

  getContent(connection, routineName, routineSchema, onDone, logger) {
    let query = `
SELECT *
  FROM INFORMATION_SCHEMA.ROUTINES
 WHERE ROUTINE_NAME='${routineName}' AND ROUTINE_SCHEMA='${routineSchema}'
`;

    logger.log(query);

    connection.query(query, (err, results, fields) => {
      if (err) {
        onDone(err);
        return;
      }

      let resultSet = new ResultSet({
        columns: [
          {name: 'Key', type: TYPE.text},
          {name: 'Value', type: TYPE.text},
        ],
        data: Object.keys(results[0]).map((key)=>[
          pascalCase(key),
          results[0][key]
        ])
      });

      onDone(resultSet);
    });
  }

  getStructure(routineName, connection, onDone, logger) {
    let query = `SHOW CREATE ${this.type} ${routineName}`;

    logger.log(query);

    connection.query(query, (err, results, fields) => {
      if (err) {
        onDone(err);
        return;
      }

      onDone(
        new ResultSet({
          query: SqlPrettier.format(
            results[0][pascalCase(`Create ${this.type}`, ' ')]
          )
        })
      );

      return;
    });
  }
}

export default new Routine();
