const path = require('path');

// 端口
const port = 3333;

// 服务器地址
const bashUrl = `http://127.0.0.1:${port}`; // 默认地址

// 上传地址
const upload_url = `/public/upload/`;

// ossConfig
const ossConfig = {
  Bucket: 'daes-1251985304',// 存储桶的名称
  Region: 'ap-shanghai',  /* 存储桶所在地域，必须字段 */
  secretId: 'AKIDd4F7nC6AolTuUptjhSzHJ5ZrugdLnymM', // key
  secretKey: 'jdTpa5MRL5f1Qu86n7Reklx0sMCuZEpb', // 腾讯云 key
};

module.exports = {
  port,
  bashUrl,
  upload_url,
  ossConfig
}
