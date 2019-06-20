// pages/fightOrderInfo/fightOrderInfo.js
var pingPay = require('../../libs/pingpp.js');
import http from '../../libs/http.js';
var utils = require('../../utils/util.js');
var config = require("../../libs/config.js");

var app = getApp();
// var pingpp_ui = require('../../libs/pingpp_ui.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    personNum:1,  //人数
    payMoney:0,   //总额
    orderInfo:{}, //订单信息
    orderType: '',  //业务类型
    willStartDate: '',  //预计用车日期
    willStartTime: '', //预计用车时间点
    userName:'',  //用户名
    shiftArrOrStartTime:'',
    phoneNum:'',  //手机号
    payId:'' , //支付id
    isNavigate: false,
    sellerId:'无'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.showLoading({
      title: '加载中',
    })
    var sellerId = wx.getStorageSync('sellerId');
    if(sellerId !='' && sellerId != undefined){
      this.setData({sellerId:sellerId})
    }
    // 获取订单信息
    this.getOrderInfo(options)
  },
  // 支付
  gotoPayOrder:function(){
    var that = this;
    if (that.data.isNavigate) {
      return;
    }
    that.setData({ isNavigate: true })
    const openid = wx.getStorageSync('openid')
    if(openid != ''){
      http.request({
        url: config.jsHost +'/app/v1.0/order/pay/wechatlite',
        data: {
          payId: that.data.payId,
          openid: openid
        },
        success(res) {
          var data = res.data.data;
          if (res.data.code == 200) {
            // 在支付页调用支付：
            pingPay.createPayment(data.charge, function (result, err) {
              // object 需是 Charge/Order/Recharge 的 JSON 字符串
              that.setData({ isNavigate: false })
              if (result == "success") {
                //支付成功后清除分销商ID
                // wx.setStorageSync('sellerId', '');
                wx.switchTab({
                  url: '../airplanOrder/airplanOrder',
                })
              } else if (result == "fail") {
                // Ping++ 对象不正确或者微信JSAPI / QQ公众号支付失败时会在此处返回
                wx.showToast({
                  title: '支付失败',
                  icon: 'none',
                  duration: 1000
                })
                wx.switchTab({
                  url: '../airplanOrder/airplanOrder',
                })
                var data = {
                  payId: that.data.payId,
                  openid: openid,
                  data:res.data
                };
                throw new Error(JSON.stringify(data));
               
              } else if (result == "cancel") {
                // 微信JSAPI支付取消支付
              }
            });
          }
          else {
            wx.showModal({
              title: '支付失败,请重试',
              content: res.data.msg,
            })
            var data = {
              payId: that.data.payId,
              openid: openid,
              data:res.data
            };
            throw new Error(JSON.stringify(data));
           
          }
        }
      })
    }
   
  },
// 获取订单信息
  getOrderInfo: function (options){
    var that = this;
    http.request({
      url: config.jsHost +'/app/v1.0/order/notPay/' + options.orderId,
      success(res) {
        wx.hideLoading()
        var data = res.data.data;
        if(res.data.code == 200){
          // 订单类型
          var orderType = data.orderType
          orderType = (orderType == 1 ? '接机' : 
          (orderType == 2 ? '送机' :
          (orderType == 3 ? '接站' :
          (orderType == 4 ? '送站' : '未知')
          )));
          // 转换日期
          var willStartDate = utils.getAfterDayDate(new Date(parseInt(data.willStartTime)), 0);
          // var willStartDate = new Date(parseInt(data.willStartTime)).toLocaleDateString();
          // willStartDate = willStartDate.replace(/\//g, '-');
          // 转换时间
          var willStartTime= that.getTime(parseInt(data.willStartTime));
          // 总额计算
          var payMoney = utils.change(data.totalPrice)
          // 出发货到达时间
          var shiftArrOrStartTime = data.shiftArrOrStartTime;
          shiftArrOrStartTime = that.getTime(parseInt(shiftArrOrStartTime))
          that.setData({
            orderInfo: res.data.data, //订单信息
            orderType: orderType,     //订单类型 
            orderTypeNum: data.orderType,
            willStartDate: willStartDate,
            willStartTime: willStartTime,
            payId: res.data.data.payId,
            payMoney: payMoney,
            shiftArrOrStartTime: shiftArrOrStartTime
          })
        }
      }
    })
},

  // 转换时间
  getTime(time) {
    var time = new Date(time);
    let hour = time.getHours();
    let minute = time.getMinutes();
    if (minute.toString().length == 1) {
      minute = "0" + minute;
    }
    if (hour.toString().length == 1) {
      hour = "0" + hour;
    }
    return (hour + ":" + minute)
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