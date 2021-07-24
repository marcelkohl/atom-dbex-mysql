'use babel';

import {Routine as RoutineClass} from './routine';

class Proc extends RoutineClass {
  get type() {
    return 'PROCEDURE';
  }

  get iconClass() {
    return 'mysql-procedure';
  }
}

export default new Proc();
