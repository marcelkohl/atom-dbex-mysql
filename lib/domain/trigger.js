'use babel';

import TreeItem from '../dataModel/tree-item';
import ItemAction from '../dataModel/item-action';
import {default as ResultSet, TYPE} from '../dataModel/result-set';
import pascalCase from '../helper/pascal-case';

class Trigger {
  treeItemFromTriggerNames(triggerNames, tableName, schema) {
    let results = [];

    triggerNames.forEach((trigger)=>{
      results.push(new TreeItem({
        label: trigger,
        name: "trigger." + trigger,
        icon: 'mysql-trigger',
        children: [],
        details: "",
        collapsed: true,
        datasets: {
          triggerSchema: schema,
          trigger: trigger,
          triggerTable: tableName
        },
        actions: [
          new ItemAction({name:"structure", icon:"icon-struct", description:"Show structure"}),
        ]
      }));
    });

    return results;
  }

  getContent(connection, triggerName, triggerSchema, triggerTable, onDone, logger) {
    let query = `
SELECT *
  FROM INFORMATION_SCHEMA.TRIGGERS
 WHERE TRIGGER_NAME='${triggerName}'
   AND TRIGGER_SCHEMA='${triggerSchema}'
   AND EVENT_OBJECT_TABLE = '${triggerTable}'
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
}

export default new Trigger();
