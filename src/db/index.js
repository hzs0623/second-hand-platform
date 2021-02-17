//职责： 数据库

const mysql = require('mysql');
const config = require('../../config/dbConfig');

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
