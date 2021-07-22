'use babel';

import ConnectionSettings from './dataModel/connection-settings';
import TreeItem from './dataModel/tree-item';
import ItemAction from './dataModel/item-action';
import FieldConnection from './dataModel/field-connection';
import {default as ResultSet, TYPE} from './dataModel/result-set';
import mysql from 'mysql'

export default class DbexMySQL {
  /**
   * @param {Logger} logger Logger instance from dbex.
   */
  constructor(logger) {
    this.logger = logger;
    this.connections = {};
  }

  /**
   * This method is used when dbex needs to change the scope of logger.
   * Don't worry about how it works, dbex does all the job but this method must be available.
   *
   * @return {Logger}
   */
  getLogger() {
    return this.logger; // leave like this and everything is fine for this method.
  }

  /**
   * Engine name getter.
   *
   * @return {string} a name given to your engine.
   */
  getName() {
    return "mysql-marcelkohl";
  }

  /**
   * Engine icon getter.
   * Must be a css class that represents an icon for the connections created with this engine.
   * Take a look on the styles/style.less for more details.
   *
   * @return {string}
   */
  getIconClass() {
    return "mysql-engine-icon";
  }

  /**
   * Connection settings are used to specify the fields needed to make the connection.
   * All the fields in this list will come later on future requests.
   * @return {ConnectionSettings}
   */
  getConnectionSettings() {
    return new ConnectionSettings({
      name: this.getName(),
      label: "MySQL (until 5.7)",
      custom: [
        new FieldConnection({id: 'host', title: "Host", tip:"Hostname or IP address without port"}),
        new FieldConnection({id: 'port', title: "Port", tip:"Only numbers"}),
        new FieldConnection({id: 'user', title: "User"}),
        new FieldConnection({id: 'password', title: "Password"}),
        new FieldConnection({id: 'database', title: "Database", tip: "Optional"}),
        new FieldConnection({id: 'ssl', title: "Use SSL", tip: "Default is to not use", isBool:true}),
      ]
    });
  }

  /**
   * Called when the user requests to test the connection on the create connection window.
   *
   * @param  {object}   connectionCustomFields  A list of key:value objects containing the fields provided on getConnectionSettings
   * @param  {callable} onConnect               A callable used when the connection works
   * @param  {callable} onFail                  A callable used when the connection failed
   */
  testConnection(connectionCustomFields, onConnect, onFail) {
    let ccf = connectionCustomFields;

    if (ccf.host.length > 0 && ccf.port.length > 0 && ccf.user.length > 0) {
      this._connect(ccf).then(
        (connection)=>{
          onConnect("success");
          this._disconnect(connection);
        },
        (result)=>onFail(result)
      );
    } else {
      onFail("Some necessary fields are not filled. Please check again");
    }
  }

  _disconnect(connection) {
    try {
      connection.release();
    } catch (e) {
      console.log(e);
    }
  }

  _connect(connectionFields) {
    return new Promise((resolve, reject) => {
      let config = {
        host: connectionFields.host,
        user: connectionFields.user,
        password: connectionFields.password,
        port: connectionFields.port,
        database: connectionFields.database || "",
        multipleStatements: false
      }

      mysql.createPool(config).getConnection((err, connection) => {
        if (err || !connection) {
          reject(err || "Failed to connect");
          return;
        }

        resolve(connection);
      });
    });
  }

  /**
   * Resolve double clicks from dbex.
   * This methos is called when the user clicks any element under this engine settings.
   * @param  {string}   connectionName Reference for the user's connection
   * @param  {object}   datasets       A list of key:value objects containing the fields provided on getConnectionSettings
   * @param  {callable} onDone         A callable used when the processing is done. onDone must return one of the following: TreeItem, TreeItem[], ResultSet
   */
  resolveDoubleClick(connectionName, datasets, onDone) {
    console.log("resolving double click", connectionName, datasets);

    let command = undefined;

    if (datasets.database) {
      command = (connection)=>this._getTopicsFromDatabase(connection, datasets.database, onDone);
    } else if (datasets.tables) {
      command = (connection)=>this._getAllTables(connection, datasets.tables, onDone);
    } else if (datasets.host && datasets.user) {
      command = (connection)=>this._getSchemas(connection, onDone);
    } else if (datasets.table) {
      // command = (connection)=>this._getTable(connection, datasets.table, onDone);
    }

    if (command) {
      let connection = this.connections[connectionName] || undefined;
console.log(connection);
      if (connection) {
        command(connection);
      } else {
        this._connect(datasets).then(
          (connectedOn)=>{
            this.connections[connectionName] = connectedOn;
            command(this.connections[connectionName]);
          },
          (errMsg)=>onDone(errMsg)
        );
      }
    } else {
      onDone();
    }
  }

  _getSchemas(connection, resolve) {
    let query = `
  SELECT schema_name AS database_name, COUNT(DISTINCT TABLE_NAME) AS total_tables
    FROM information_schema.schemata
    JOIN INFORMATION_SCHEMA.COLUMNS ON schema_name = TABLE_SCHEMA
GROUP BY schema_name
ORDER BY schema_name
`;

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

  _getTopicsFromDatabase(connection, database, onDone) {
    let query = `
SELECT
  (SELECT COUNT(TABLE_SCHEMA) FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'VIEW' AND TABLE_SCHEMA='${database}') as views,
  (SELECT COUNT(TABLE_SCHEMA) FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE <> 'VIEW' AND TABLE_SCHEMA='${database}') as tables,
  (SELECT COUNT(ROUTINE_SCHEMA) FROM INFORMATION_SCHEMA.ROUTINES WHERE ROUTINE_TYPE = 'FUNCTION' AND ROUTINE_SCHEMA='${database}') as functions,
  (SELECT COUNT(ROUTINE_SCHEMA) FROM INFORMATION_SCHEMA.ROUTINES WHERE ROUTINE_TYPE = 'PROCEDURE' AND ROUTINE_SCHEMA='${database}') as procedures,
  (SELECT COUNT(EVENT_SCHEMA) FROM INFORMATION_SCHEMA.EVENTS WHERE EVENT_SCHEMA='od_bot_dev') as events
`;

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
        result.push(new TreeItem({
          label: 'Tables',
          name: database + ".tables",
          icon: 'icon-table',
          children: [],
          details: record.tables,
          collapsed: true,
          datasets: {
            tables: database,
          },
          actions: []
        }));
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
            functions: database,
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

  _getAllTables(connection, database, resolve) {
    let query = `
   SELECT T.TABLE_TYPE, C.*
     FROM INFORMATION_SCHEMA.COLUMNS C
LEFT JOIN INFORMATION_SCHEMA.TABLES T ON T.TABLE_NAME = C.TABLE_NAME
    WHERE C.TABLE_SCHEMA = '${database}' AND TABLE_TYPE <> 'VIEW'
 ORDER BY C.TABLE_SCHEMA, C.TABLE_NAME, FIELD(C.COLUMN_KEY, 'PRI', 'UNI', 'MUL', '') ASC, C.ORDINAL_POSITION
`;
    this.logger.log(query);

    connection.query(query, (err, results, fields) => {
      if (err) {
        console.log("query failed", err)
        console.log("error code", err.code)
        resolve(err);
        return;
      }

      let tables = [];
      let table = {label:undefined};

      results.forEach((record)=>{
        if (table.label !== record.TABLE_NAME) {
          if (table.name) {
            table.children.push(
              new TreeItem({
                label: 'Triggers',
                name: record.TABLE_SCHEMA + "." + table.name,
                icon: 'mysql-trigger',
                children: [],
                details: "",
                collapsed: true,
                datasets: {
                  triggers: record.TABLE_SCHEMA + "." + table.name,
                },
                actions: []
              })
            );

            tables.push(table);
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

      resolve(tables);
    });
  }

  /**
   * triggered every time that an action on node is clicked
   * @param  {string}   action          The name given to the action (set on ItemAction)
   * @param  {string}   connectionName  Reference for the user's connection
   * @param  {object}   datasets        Node datasets to support the action
   * @param  {callable} onDone          A callable used when the processing is done. onDone must return one of the following: TreeItem, TreeItem[], ResultSet
   */
  resolveActionClick(action, connectionName, datasets, onDone) {
  }

  /**
   * @param {string}   uuid            Can be an empty string (when the user executes a query directly from the editor)
   * @param {string}   query           the query requested by the user
   * @param {string}   connectionName  Reference for the user's connection
   * @param {object}   datasets        Node datasets to support the action
   * @param {callable} onDone          A callable used when the processing is done. onDone must return one of the following: TreeItem, TreeItem[], ResultSet
   */
  executeQuery(uuid, query, connectionName, datasets, onDone) {
    // onDone(
    //   new ResultSet({
    //     recordsAffected: Math.floor((Math.random() * 100) + 1)  // simulate some record affected
    //   })
    // );
  }

  /**
   * If your database supports to stop ongoing queries, this method can be used to do it.
   * @param  {string} uuid a reference to the query's uuid send executeQuery method
   */
  stopQuery(uuid) {
    // ... your code to cancel the query goes here
  }

  /**
   * refresh node is a right-click option for every node. It is up to your implementation to decide if it will return something or not.
   * @param  {string}   connectionName  Reference for the user's connection
   * @param  {object}   datasets        Node datasets to support the refresh
   * @param  {callable} onDone          The onDone callback will just be processed if a TreeItem element is returned
   */
  refreshNode(connectionName, datasets, onDone) {
  }
}
