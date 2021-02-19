const STS = require('qcloud-cos-sts');
const ossConfig = require('../../config/ossConfig');

const file = `shop/image`; // 存入地址
// 配置参数
const config = {
  secretId: ossConfig.secretId,   // 固定密钥
  secretKey: ossConfig.secretKey,  // 固定密钥
  proxy: '',
  durationSeconds: 1800,  // 密钥有效期 
  // 放行判断相关参数
  bucket: ossConfig.bucket,
  region: ossConfig.region, // 换成 bucket 所在地区
  allowPrefix: file
};

//  牛逼 🐂
const getCredential = (query = {}) => {
  return new Promise((resovle, reject) => {
    const shortBucketName = config.bucket.substr(0, config.bucket.lastIndexOf('-'));
    const appId = config.bucket.substr(1 + config.bucket.lastIndexOf('-'));
    const policy = {
      'version': '2.0',
      'statement': [{
        'action': [
          // 简单上传
          'name/cos:PutObject',
          'name/cos:PostObject',
          // 分片上传
          'name/cos:InitiateMultipartUpload',
          'name/cos:ListMultipartUploads',
          'name/cos:ListParts',
          'name/cos:UploadPart',
          'name/cos:CompleteMultipartUpload',
        ],
        'effect': 'allow',
        'principal': { 'qcs': ['*'] },
        'resource': [
          'qcs::cos:' + config.region + ':uid/' + appId + ':prefix//' + appId + '/' + shortBucketName + '/' + config.allowPrefix,
        ],
      }],
    };

    STS.getCredential({
      secretId: config.secretId,
      secretKey: config.secretKey,
      proxy: config.proxy,
      durationSeconds: config.durationSeconds,
      region: config.region,
      policy: policy,
    }, (err, data) => {
      err ? reject(err) : resovle(data);
    });
  })

}

// 获取临时密钥
module.exports = {
  getCredential
}

