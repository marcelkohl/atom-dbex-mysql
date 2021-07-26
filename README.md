# atom-dbex-mysql
Dbex MySQL engine for Atom Editor

## TODO
- add ssl to connection
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
  ```
    show create table GetAllAssets
    show create table assets
    show create function default_limit
  ```
