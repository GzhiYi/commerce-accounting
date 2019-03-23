// pages/index/index.js
import { parseTime } from '../../utils/parseTime'
const { $Message } = require('../dist/base/index');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 一笔帐的数据
    editId: null,
    billName: '',
    buyPrice: '',
    sellPrice: '',
    amount: 1,
    postage: 0,
    sellDate: '',
    sellTime: '',
    remark: '',
    currentProfit: '', // 当前所记帐的利润
    loading: false,
    todayBillList: [],

    deleteAction: [
      {
        name: '删除',
        color: '#ed3f14'
      }
    ],
    deleteVisible: false, // 控制action显示隐藏
    targetBill: {},
    isEdit: false,
    scrollTop: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
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
    const { billName, buyPrice, sellPrice, amount, sellDate, sellTime, postage, remark, currentProfit, isEdit, editId } = this.data
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
          type: isEdit ? 'edit' : 'create',
          billId: editId,
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
          self.getBill()
          self.cancleEdit()
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
    if (buyPrice && sellPrice && amount > 0) {
      this.setData({
        currentProfit: (sellPrice - buyPrice) * amount - postage || 0
      })
    }
  },
  getBill() {
    const self = this
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
        self.setData({
          todayBillList: res.result.data.reverse()
        })
      }
    })
  },
  editItem(event) {
    console.log(event)
    const target = event.currentTarget.dataset.item
    this.setData({
      billName: target.billName,
      buyPrice: target.buyPrice,
      sellPrice: target.sellPrice,
      amount: target.amount,
      postage: target.postage,
      sellDate: target.sellDate,
      sellTime: target.sellTime || parseTime(new Date(), '{h}:{i}'),
      remark: target.remark,
      currentProfit: target.profit, // 当前所记帐的利润
      isEdit: true,
      scrollTop: event.changedTouches[0].clientY,
      editId: target._id
    })
    wx.pageScrollTo({
      scrollTop: 0,
      duration: 800
    })
  },
  deleteItem(event) {
    const target = event.currentTarget.dataset.item
    this.setData({
      deleteVisible: true,
      targetBill: target
    })
  },
  handleTrueDelete() {
    const action = [...this.data.deleteAction];
    const self = this
    action[0].loading = true;

    self.setData({
      deleteAction: action
    });

    wx.cloud.callFunction({
      name: 'bill',
      data: {
        type: 'delete',
        billId: this.data.targetBill._id
      },
      success() {
        action[0].loading = false;
        self.setData({
          deleteVisible: false,
          deleteAction: action
        });
        $Message({
          content: '删除成功！',
          type: 'success'
        });
        self.getBill()
      }
    })
  },
  handleActionCancle() {
    this.setData({
      deleteVisible: false
    })
  },
  cancleEdit() {
    wx.pageScrollTo({
      scrollTop: this.data.scrollTop,
      duration: 800
    })
    this.setData({
      isEdit: false,
      billName: '',
      buyPrice: '',
      sellPrice: '',
      amount: 1,
      postage: 0,
      sellDate: parseTime(new Date(), '{y}-{m}-{d}'),
      sellTime: parseTime(new Date(), '{h}:{i}'),
      remark: '',
      currentProfit: '',
      scrollTop: 0,
    })
  }
})