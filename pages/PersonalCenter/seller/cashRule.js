// pages/PersonalCenter/seller/cashRule.js
import http from '../../../libs/http.js';
var utils = require('../../../utils/util.js');
var config = require('../../../libs/config');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    cashTime:'',  //提现时间
    maxDayAmount:'',  //单日提现额度
    maxAmount:'', //单次提现额度
    minAmount:'',
    times:'',   //单日提现次数
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    http.request({
      url: config.jsHost + '/app/v1.0/artemis/withdrawal/rule',
      method:'POST',
      success(res) {
        console.log(res)
        var data = res.data.data;
        if(res.data.code == 200){
          var weekday = new Array(7)
          weekday[1] = "星期一";
          weekday[2] = "星期二";
          weekday[3] = "星期三";
          weekday[4] = "星期四";
          weekday[5] = "星期五";
          weekday[6] = "星期六";
          weekday[7] = "星期天";
          var cashTime = weekday[data.weekDay];
          that.setData({
            cashTime: cashTime,
            maxDayAmount: utils.change(data.maxDayAmount),
            maxAmount: utils.change(data.maxAmount),
            minAmount: utils.change(data.minAmount),
            times: data.times
          })
        }
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

  }
})