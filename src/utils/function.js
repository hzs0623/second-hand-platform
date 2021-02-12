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

module.exports = {
  formatDate
}
