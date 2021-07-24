'use babel';

import TreeItem from '../dataModel/tree-item';
import ItemAction from '../dataModel/item-action';

class Trigger {
  treeItemFromTriggerNames(triggerNames, tableName) {
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
}

export default new Trigger();
