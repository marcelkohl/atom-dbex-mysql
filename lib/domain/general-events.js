'use babel';

import TreeItem from '../dataModel/tree-item';
import ItemAction from '../dataModel/item-action';
import {default as ResultSet, TYPE} from '../dataModel/result-set';
import SqlPrettier from 'sql-prettier';
import pascalCase from '../helper/pascal-case';

class GeneralEvents {
  getAll(connection, database, onDone, logger) {
    let query = `
SELECT EVENT_SCHEMA, EVENT_NAME
  FROM INFORMATION_SCHEMA.EVENTS
 WHERE EVENT_SCHEMA='${database}'
`;

    logger.log(query);

    connection.query(query, (err, results, fields) => {
      if (err) {
        console.log("query failed", err)
        console.log("error code", err.code)
        onDone(err);
        return;
      }

      let events = [];

      results.forEach((record)=>{
        events.push(new TreeItem({
          label: record.EVENT_NAME,
          name: record.EVENT_SCHEMA + "." + record.EVENT_NAME,
          icon: "mysql-event",
          details: "",
          collapsed: true,
          datasets: {
            event: record.EVENT_NAME,
            schema: record.EVENT_SCHEMA,
          },
          actions: [
            new ItemAction({name:"structure", icon:"icon-struct", description:"Show structure"}),
          ]
        }));
      });

      onDone(events);
    });
  }

  getStructure(eventName, connection, onDone, logger) {
    let query = `SHOW CREATE EVENT ${eventName}`;

    logger.log(query);

    connection.query(query, (err, results, fields) => {
      if (err) {
        onDone(err);
        return;
      }

      onDone(
        new ResultSet({
          query: SqlPrettier.format(
            results[0][`Create Event`]
          )
        })
      );

      return;
    });
  }

  getContent(connection, eventName, onDone, logger) {
    let query = `
SELECT *
  FROM INFORMATION_SCHEMA.EVENTS
 WHERE EVENT_NAME='${eventName}'
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

export default new GeneralEvents();
