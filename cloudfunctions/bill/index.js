// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()
const _ = db.command
// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()

  if (event.type === 'create') {
    const {
      billName,
      buyPrice,
      sellPrice,
      amount,
      postage,
      sellDate,
      sellTime,
      remark,
      profit,
      createTime
    } = event 
    await db.collection('bill').add({
      data: {
        billName,
        buyPrice,
        sellPrice,
        amount,
        postage,
        sellDate,
        sellDate,
        remark,
        profit,
        createBy: wxContext.OPENID,
        createTime
      }
    })
    return {
      event
    }
  } else if (event.type === 'get') {
    const range = event.range || '今天'
    switch(range) {
      case '今天':
        const res = await db.collection('bill').where({
          createBy: wxContext.OPENID,
          createTime: _.lte(event.todayEndTimeStamp),
          createTime: _.gte(event.todayBeginTimeStamp)
        })
        .get()
        console.log('开始', event.todayEndTimeStamp)
        console.log('开始2', event.todayBeginTimeStamp)
        console.log('开始3', res)
        return res
        break;          
    }
    
  }
}