'use babel';

import SampleEngine from './sample-engine';

/**
 * The main file is responsible for initialize and subscribe this plugin to the dbex atom module
 */
export default {
  activate() {
      console.log('sample-engine package activated!');
  },

  /**
   * subscribes to the dbex service
   * @return {callable} a callable instance of the engine
   */
  subscribePlugin() {
    return (logger)=>new SampleEngine(logger);
  },
};
