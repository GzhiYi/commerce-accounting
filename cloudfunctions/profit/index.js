// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()
const _ = db.command
// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { rangeTimeStart, rangeTimeEnd, tab } = event // 这个range是指筛选的时间范围
  console.log('dayinfanwei', rangeTimeStart, rangeTimeEnd)
  const res = await db.collection('bill').where({
    createBy: wxContext.OPENID,
    isDelete: false,
    createTime: _.gte(rangeTimeStart).and(_.lt(rangeTimeEnd))
  })
  .get()
  console.log('see', res)
  if (res.data.length > 0) {
    switch (tab) {
      case '昨天':
        break;
      case '最近七天':
        break;
      case '最近一个月':
        break;
      case '最近一年':
        break;
    }
  }
  return res
}