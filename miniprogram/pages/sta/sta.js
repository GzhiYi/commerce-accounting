// pages/sta/sta.js
let wxCharts = require('../../utils/wxcharts-min.js');
let app = getApp();
let lineChart = null;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    currentTab: 'tab1',
    todayStartStamp: Date.parse(new Date(new Date(new Date().toLocaleDateString()).getTime())),
    todayEndStamp: Date.parse(new Date(new Date(new Date().toLocaleDateString()).getTime() + 24 * 60 * 60 * 1000 - 1))
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const todayStartStamp = Date.parse(new Date(new Date(new Date().toLocaleDateString()).getTime()))
    const todayEndStamp = Date.parse(new Date(new Date(new Date().toLocaleDateString()).getTime() + 24 * 60 * 60 * 1000 - 1))
    this.getChartData(todayStartStamp - 24 * 60 * 60 * 1000, todayEndStamp - 24 * 60 * 60 * 1000)

    let windowWidth = 320;
    try {
      let res = wx.getSystemInfoSync();
      windowWidth = res.windowWidth;
    } catch (e) {
      console.error('getSystemInfoSync failed!');
    }

    let simulationData = this.createSimulationData();
    console.log('an', simulationData)
    lineChart = new wxCharts({
      canvasId: 'lineCanvas',
      type: 'line',
      categories: ["2016-1", "2016-2", "2016-3", "2016-4", "2016-5", "2016-6", "2016-7", "2016-8", "2016-9", "2016-10"], // 横坐标
      animation: true,
      // background: '#f5f5f5',
      series: [{
        name: '成交量1',
        data: [13, 32, 43,22, 33,233,23,2,1,33],
        format: function (val, name) {
          return val.toFixed(2) + '万';
        }
      }, {
        name: '成交量2',
        data: [2, 0, 0, 3, null, 4, 0, 0, 2, 0],
        format: function (val, name) {
          return val.toFixed(2) + '万';
        }
      }],
      xAxis: {
        disableGrid: true
      },
      yAxis: {
        title: '成交金额 (万元)',
        format: function (val) {
          return val.toFixed(2);
        },
        min: 0
      },
      width: windowWidth,
      height: 200,
      dataLabel: false,
      dataPointShape: true,
      extra: {
        lineStyle: 'curve'
      }
    });
  },

  getChartData(start, end) {
    console.log(start, end)
    wx.cloud.callFunction({
      name: 'profit',
      data: {
        rangeTimeStart: start,
        rangeTimeEnd: end
      },
      success(res) {
        console.log(res)
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
  handleTabChange(event) {
    this.setData({
      currentTab: event.detail.key
    })
  },
  touchHandler: function (e) {
    console.log(lineChart.getCurrentDataIndex(e));
    lineChart.showToolTip(e, {
      // background: '#7cb5ec',
      format: function (item, category) {
        return category + ' ' + item.name + ':' + item.data
      }
    });
  },
  createSimulationData: function () {
    let categories = [];
    let data = [];
    for (let i = 0; i < 10; i++) {
      categories.push('2016-' + (i + 1));
      data.push(Math.random() * (20 - 10) + 10);
    }
    // data[4] = null;
    return {
      categories: categories,
      data: data
    }
  },
})