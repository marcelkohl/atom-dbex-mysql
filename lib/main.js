'use babel';

import DbexMySQL from './atom-dbex-mysql';

/**
 * The main file is responsible for initialize and subscribe this plugin to the dbex atom module
 */
export default {
  activate() {
  },

  /**
   * subscribes to the dbex service
   * @return {callable} a callable instance of the engine
   */
  subscribePlugin() {
    return (logger)=>new DbexMySQL(logger);
  },
};
