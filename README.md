[![Maintenance](https://img.shields.io/badge/Maintained%3F-no-red.svg)](#)
[![Generic badge](https://img.shields.io/badge/Status-Stable-green.svg)](#)
[![GPLv3 license](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0.en.html)
[![Ask Me Anything !](https://img.shields.io/badge/Ask%20me-anything-1abc9c.svg)](https://github.com/marcelkohl)

# atom-dbex-mysql
[Dbex](https://github.com/marcelkohl/dbex) MySQL engine for Atom Editor.

This engine supports most of the basic aspects of a MySQL connection including:

- Listing schemas, tables, views, functions, procedures and table triggers
- Distinction about Primary/Foreign keys, and normal fields;
- Double click on Table and Views shows a limited query;
- Actions to show structures for tables, views, functions, procedures and table triggers;

![Dbex MySQL engine for Atom Editor](https://raw.githubusercontent.com/marcelkohl/atom-dbex-mysql/master/samples/atom-mysql-engine.png)

## TODO
- window to create/alter table structure
  - foreign keys association;
    - https://ubiq.co/database-blog/mysql-add-foreign-key/
  - engine, charset and collation options (`ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci`);
- install MySQL language support if not installed;
- cover "DELIMITER" on queries;
- multiple lines are not working
    - example:  `SET FOREIGN_KEY_CHECKS=0;
    UPDATE `store` SET store_id = 0 WHERE code='admin';
    UPDATE `store_group` SET group_id = 0 WHERE name='Default';
    UPDATE `store_website` SET website_id = 0 WHERE code='admin';
    UPDATE `customer_group` SET customer_group_id = 0 WHERE customer_group_code='NOT LOGGED IN';
    SET FOREIGN_KEY_CHECKS=1;`
- implement ssl connection
- export/import data/structure (dump/restore)

## Warranty Disclaimer
The following disclaimer was written thinking in all professionals that works with data and know how important data is.

**All work here is provided ​“AS IS” AND I CANNOT MAKE ANY EXPRESS OR IMPLIED WARRANTY OF ANY KIND. As this is a side project from myself and a non-commercial product, I cannot give any warranties about the correct and full functional product. I hereby declare to not be liable for any damages arising in use of or inability to use this software.**

**USE IT BY YOUR OWN RISK.**

**KEEP BACKUPS UPDATED.**
