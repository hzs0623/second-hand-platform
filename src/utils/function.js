
// 2021-02-12 12:52:49 获取时间
function formatDate() {
  function time(date) {
    return date < 10 ? `0${date}` : date;
  }
  const date = new Date();
  const yy = time(date.getFullYear());
  const mm = time(date.getMonth() + 1);
  const dd = time(date.getDate());
  const h = time(date.getHours());
  const m = time(date.getMinutes());
  const s = time(date.getSeconds());

  return `${yy}-${mm}-${dd} ${h}:${m}:${s}`;
}

/**
 * 去除不要的字段
 * origins []
 * params []
 * */
function splitData(params, origins) {
  if (!origins && origins.length === 0) return;
  params = params[0];
  origins.forEach(key => {
    if (key in params) {
      // 删除属性
      delete params[key]
    }
  })
  return params;
}
module.exports = {
  formatDate,
  splitData
}
