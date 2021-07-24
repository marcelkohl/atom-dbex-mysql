'use babel';

import TreeItem from '../dataModel/tree-item';
import ItemAction from '../dataModel/item-action';

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
}

export default new GeneralEvents();
