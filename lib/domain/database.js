'use babel';

import TreeItem from '../dataModel/tree-item';
import table from './table';

class Database {
  getTopics(connection, database, onDone, logger) {
    let query = `
SELECT
  (SELECT COUNT(TABLE_SCHEMA) FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'VIEW' AND TABLE_SCHEMA='${database}') as views,
  (SELECT COUNT(TABLE_SCHEMA) FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE <> 'VIEW' AND TABLE_SCHEMA='${database}') as tables,
  (SELECT COUNT(ROUTINE_SCHEMA) FROM INFORMATION_SCHEMA.ROUTINES WHERE ROUTINE_TYPE = 'FUNCTION' AND ROUTINE_SCHEMA='${database}') as functions,
  (SELECT COUNT(ROUTINE_SCHEMA) FROM INFORMATION_SCHEMA.ROUTINES WHERE ROUTINE_TYPE = 'PROCEDURE' AND ROUTINE_SCHEMA='${database}') as procedures,
  (SELECT COUNT(EVENT_SCHEMA) FROM INFORMATION_SCHEMA.EVENTS WHERE EVENT_SCHEMA='od_bot_dev') as events
`;

    logger.log(query);

    connection.query(query, (err, results, fields) => {
      if (err) {
        console.log("query failed", err)
        console.log("error code", err.code)
        onDone(err);
        return;
      }

      let record = results[0];
      let result = [];

      if (record.tables > 0) {
        let tablesNode = table.getTablesNode(database, []);
        tablesNode.details = record.tables;

        result.push(tablesNode);
      }

      if (record.views > 0) {
        result.push(new TreeItem({
          label: 'Views',
          name: database + ".views",
          icon: 'mysql-view',
          children: [],
          details: record.views,
          collapsed: true,
          datasets: {
            views: database,
          },
          actions: []
        }));
      }

      if (record.functions > 0) {
        result.push(new TreeItem({
          label: 'Functions',
          name: database + ".functions",
          icon: 'mysql-function',
          children: [],
          details: record.functions,
          collapsed: true,
          datasets: {
            functions: database,
          },
          actions: []
        }));
      }

      if (record.procedures > 0) {
        result.push(new TreeItem({
          label: 'Procedures',
          name: database + ".procedures",
          icon: 'mysql-procedure',
          children: [],
          details: record.procedures,
          collapsed: true,
          datasets: {
            procedures: database,
          },
          actions: []
        }));
      }

      if (record.events) {
        result.push(new TreeItem({
          label: 'Events',
          name: database + ".events",
          icon: 'mysql-event',
          children: [],
          details: record.events,
          collapsed: true,
          datasets: {
            events: database,
          },
          actions: []
        }));
      }

      onDone(result);
    });
  }

  getSchemas(connection, resolve, logger) {
    let query = `
  SELECT schema_name AS database_name, COUNT(DISTINCT TABLE_NAME) AS total_tables
    FROM information_schema.schemata
    JOIN INFORMATION_SCHEMA.COLUMNS ON schema_name = TABLE_SCHEMA
GROUP BY schema_name
ORDER BY schema_name
`;

    logger.log(query);

    connection.query(query, (err, results, fields) => {
      if (err) {
        console.log("query failed", err)
        console.log("error code", err.code)
        resolve(err);
        return;
      }

      let databases = [];
      let database = {label:undefined};

      results.forEach((record)=>{
        if (database.label !== record.database_name) {
          if (database.name) {
            databases.push(database);
          }

          database = new TreeItem({
            label: record.database_name,
            name: record.database_name,
            icon: 'icon-database',
            details: record.total_tables,
            collapsed: false,
            datasets: {
              database: record.database_name,
            },
            classes: ['mysql-table-counter-detail'],
            actions: []
          });
        }
      });

      if (database.name) {
        databases.push(database);
      }

      resolve(databases);
    });
  }
}

export default new Database();
