[![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg)](https://bitbucket.org/lbesson/ansi-colors)
[![Generic badge](https://img.shields.io/badge/Status-Stable-green.svg)](https://shields.io/)
[![GPLv3 license](https://img.shields.io/badge/License-GPLv3-blue.svg)](http://perso.crans.org/besson/LICENSE.html)
[![Ask Me Anything !](https://img.shields.io/badge/Ask%20me-anything-1abc9c.svg)](https://GitHub.com/Naereen/ama)

# dbex-engine-base
Base engine structure for dbex package

## Purpose
This sample package exemplifies the implementation of an engine for the dbex package. All necessary methods and data models are included.

Dbex package will be informed by Atom about your package and will automatically include it on the list of available engines right after Atom restarts.

## How to
To create your custom engine for the dbex package proceed with the following:
- Clone this repository;
- Fill the mandatory methods with your code;
- Publish your package on [Atom packages](https://flight-manual.atom.io/hacking-atom/sections/publishing/);
- Done.

All the needed information about the mandatory methods, types, parameters and returns are commented in the `sample-engine.js` file. Feel free to send a message if you miss something.

If you want to share your engine, please let me know by sending a message and I will include it on the Dbex engines list github page.

## Don't!
- Don't change the files in `/dataModel` folder. This folder may have updates in the future and you may have to update your branch/fork to comply with the dbex requirements.

## TODO
- engine plugins automatically install dbex core
