const { Tips, functions } = require('../../utils');
const { bashUrl, upload_url } = require('../../utils/var');
const path = require('path');

module.exports = {
  // 上传图片
  async uploadImg(ctx) {
    try {
      const { file = {} } = ctx.request.files;
      const { path: imgUrl } = file;
      const i = imgUrl.indexOf(upload_url) + upload_url.length;
      const image = imgUrl.substring(i);

      const image_url = bashUrl + upload_url + image;

      ctx.body = {
        ...Tips[1001],
        data: {
          ...file,
          path: image_url
        }
      };
    } catch (e) {
      ctx.body = Tips[1002];
    }
  },
}

