'use babel';

import {Routine as RoutineClass} from './routine';

class Func extends RoutineClass {
  get type() {
    return 'FUNCTION';
  }

  get iconClass() {
    return 'mysql-function';
  }
}

export default new Func();
