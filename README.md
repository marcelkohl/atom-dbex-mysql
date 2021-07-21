[![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg)](https://bitbucket.org/lbesson/ansi-colors)
[![Generic badge](https://img.shields.io/badge/Status-Not_ready-red.svg)](https://shields.io/)
[![GPLv3 license](https://img.shields.io/badge/License-GPLv3-blue.svg)](http://perso.crans.org/besson/LICENSE.html)
[![Ask Me Anything !](https://img.shields.io/badge/Ask%20me-anything-1abc9c.svg)](https://GitHub.com/Naereen/ama)

A dbex engine implementation to handle MySQL.

## TODO
- same connection node name + same database name conflicts to update node (probably same table name will have the same issue);
- detect server disconnection and reconnect (err code: PROTOCOL_ENQUEUE_AFTER_FATAL_ERROR)
- check fix/lib for newer versions of mysql
- cover "DELIMITER" on queries;
- multiple lines are not working
  `SET FOREIGN_KEY_CHECKS=0;
  UPDATE `store` SET store_id = 0 WHERE code='admin';
  UPDATE `store_group` SET group_id = 0 WHERE name='Default';
  UPDATE `store_website` SET website_id = 0 WHERE code='admin';
  UPDATE `customer_group` SET customer_group_id = 0 WHERE customer_group_code='NOT LOGGED IN';
  SET FOREIGN_KEY_CHECKS=1;`

## Nice to have
- export/import data/structure (dump/restore)
- tables, views, procedures, packages, triggers, events
- list views
  ```
    SHOW FULL TABLES IN od_bot_dev WHERE TABLE_TYPE LIKE 'VIEW'

    SELECT TABLE_SCHEMA, TABLE_NAME
    FROM information_schema.TABLES
    WHERE TABLE_TYPE LIKE 'VIEW' AND TABLE_SCHEMA LIKE 'od_bot_dev'
    order by table_name

    SELECT TABLE_SCHEMA, TABLE_NAME
    FROM information_schema.TABLES
    WHERE TABLE_TYPE LIKE 'VIEW' AND TABLE_SCHEMA LIKE 'od_bot_dev'
    order by table_name

    SELECT * --TABLE_SCHEMA, TABLE_NAME
        FROM information_schema.ROUTINES
        -- WHERE TABLE_TYPE LIKE 'VIEW' AND
    WHERE ROUTINE_SCHEMA LIKE 'od_bot_dev'
    --    order by table_name

    select * from information_schema.TRIGGERS
    select * from information_schema.EVENTS
  ```
- list stored procedures
  ```
    SHOW PROCEDURE STATUS
  ```
- list functions
  ```
    SHOW FUNCTION STATUS
  ```
- return table, function, procedure code
  ```
    show create table GetAllAssets
    show create table assets
    show create function default_limit
  ```
