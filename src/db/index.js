//职责： 数据库

const mysql = require('mysql');

const config = {
  host: 'localhost',
  user: 'root',
  password: 'hzs980623',
  database: 'node', // 数据库
  port: 3306,
  multipleStatements: true//允许多条sql同时执行
}
const pool = mysql.createPool(config);

/**
 * sql: 语句
 * value: 查询值
*/
const query = (sql, values) => {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) return reject(err);
      connection.query(sql, values, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
        connection.end(); // 关闭数据库
      })
    })
  })
};
module.exports = {
  query
}
