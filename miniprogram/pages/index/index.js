// pages/index/index.js
import { parseTime } from '../../utils/parseTime'
const { $Message } = require('../dist/base/index');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 一笔帐的数据
    billName: '',
    buyPrice: '',
    sellPrice: '',
    amount: 1,
    postage: 0,
    sellDate: '',
    sellTime: '',
    remark: '',
    currentProfit: '', // 当前所记帐的利润
    loading: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.cloud.callFunction({
      name: 'extend',
      success(res) {
        console.log(res)
      },
      fail(err) {
        console.log(err)
      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    // 每次onShow都更新默认时间
    this.setData({
      sellDate: parseTime(new Date(), '{y}-{m}-{d}'),
      sellTime: parseTime(new Date(), '{h}:{i}')
    })
    this.getBill()
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  onShippingChange(event) {
    this.setData({
      isShipping: event.detail.value
    })
  },
  // 记一笔
  bookOne() {
    let content = ''
    const { billName, buyPrice, sellPrice, amount, sellDate, sellTime, postage, remark, currentProfit } = this.data
    const self = this
    if (!billName) {
      content = '不知道你卖了啥'
    } else if (!buyPrice) {
      content = '进货价忘记填啦～'
    } else if (!sellPrice) {
      content = '售价忘记填啦～'
    } else if (!postage) {
      content = '邮费是多少？'
    } else if (!amount) {
      content = '忘记填数量！'
    } else if (!sellDate) {
      content = '什么时候卖出的？'
    } else if (!sellTime) {
      content = '具体时间没填哦'
    }
    if (content) {
      $Message({
        content,
        type: 'error'
      });
    } else {
      // 这里调接口
      self.setData({
        loading: true
      })
      wx.cloud.callFunction({
        name: 'bill',
        data: {
          type: 'create',
          billName,
          buyPrice,
          sellPrice,
          amount,
          postage,
          sellDate,
          sellTime,
          remark,
          profit: currentProfit,
          createTime: Date.parse(new Date())
        },
        success(res) {
          $Message({
            content: '成功',
            type: 'success'
          });
          self.setData({
            billName: '',
            buyPrice: '',
            sellPrice: '',
            amount: 1,
            postage: 0,
            sellDate: parseTime(new Date(), '{y}-{m}-{d}'),
            sellTime: parseTime(new Date(), '{h}:{i}'),
            remark: '',
            currentProfit: '' // 当前所记帐的利润
          })
        },
        fail(error) {
          $Message({
            content: '记账失败，请稍后再试！',
            type: 'error'
          });
        },
        complete() {
          self.setData({
            loading: false
          })
        }
      })
    }
  },

  onBillDataChange(event) {
    this.setData({
      [`${event.currentTarget.dataset.item}`]: event.detail.detail.value
    })
    // 计算单笔利润
    const { buyPrice, sellPrice, amount, postage } = this.data
    if (buyPrice && sellPrice && amount) {
      this.setData({
        currentProfit: (sellPrice - buyPrice) * amount - postage || 0
      })
    }
  },
  getBill() {
    const todayBeginTimeStamp = Date.parse(new Date(new Date(new Date().toLocaleDateString()).getTime()))
    const todayEndTimeStamp = Date.parse(new Date(new Date(new Date().toLocaleDateString()).getTime() + 24 * 60 * 60 * 1000 - 1))
    wx.cloud.callFunction({
      name: 'bill',
      data: {
        type: 'get',
        todayBeginTimeStamp,
        todayEndTimeStamp
      },
      success(res) {
        console.log(res)
      }
    })
  }
})