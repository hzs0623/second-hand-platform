//职责： 数据库

const mysql = require('mysql');

const config = {
  host: '121.4.113.48',
  user: 'daes',
  password: 'Hzs980623',
  database: 'daes', // 数据库
  port: 8899,
  multipleStatements: true//允许多条sql同时执行
}
const pool = mysql.createPool(config);

/**
 * sql: 语句
 * value: 查询值
*/
const query = (sql, values) => {
  if (Object.prototype.toString.call(values) === '[object Object]') {
    values = Object.values(values);
  }
  return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) return reject(err);
      connection.query(sql, values, (err, res) => {
        if (err) {
          reject(err);
        } else {
          resolve(res);
        }
      })
      connection.release();
    })
  })
};
module.exports = {
  query
}
