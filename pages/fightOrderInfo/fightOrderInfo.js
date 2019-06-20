// pages/fightOrderInfo/fightOrderInfo.js
var pingPay = require('../../libs/pingpp.js');
var utils = require('../../utils/util.js');
import http from '../../libs/http.js';
var config = require("../../libs/config.js");

Page({

  /**
   * 页面的初始数据
   */
  data: {
    personNum:1,  //人数
    price:0,    //价格
    orderInfo:{},   //订单信息
    userName:'',   //联系人
    phoneNum:'', //联系电话
    payMoney:0,    //总额
    isNavigate: false,
    sellerId: "无" //分销商ID
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 判断当前时间减去开始时间大于24小时就清空id
    var currentTime = wx.getStorageSync("currentTime");
    var currentDate = new Date().getTime();
    if (currentDate - currentTime > 86400000) {
      var resellerId = wx.setStorageSync("sellerId", '');
    }
    // 从上个页面获取订单信息展示
    var pages = getCurrentPages();
    var prevPage = pages[pages.length - 2]; //上一个页面
    var orderInfo = prevPage.data.orderInfo;
    // var price = utils.change(orderInfo.start.price);
    var price = utils.change(prevPage.data.price);
    var id = prevPage.data.id;
    // 取分销id,有显示id,没有显示无
    var sellerId = wx.getStorageSync("sellerId") || '无';
    this.setData({
      orderInfo: orderInfo,
      price: price,
      payMoney: price,  //默认总额为单价，选中人数后变化总额
      sellerId: sellerId,
      id:id
    })
  },
 
  //乘法精确运算
  numMulti:function(num1, num2){
    var baseNum = 0;
    try {
      baseNum += num1.toString().split(".")[1].length;
    } catch (e) {
    }
    try {
      baseNum += num2.toString().split(".")[1].length;
    } catch (e) {
    }
    return Number(num1.toString().replace(".", "")) * Number(num2.toString().replace(".", "")) / Math.pow(10, baseNum);
  },
  //获取用户输入姓名
  nameInput:function (e) {
    this.setData({
      userName: e.detail.value
    })
  },
  // 手机号
  phoneInpout:function(e){
    this.setData({
      phoneNum: e.detail.value
    })
  },
  // 订单须知
  orderKnow:function(){
    var that = this;
    if (that.data.isNavigate) {
      return;
    }
    that.setData({ isNavigate: true })
    wx.navigateTo({
      url: '../ReservationNotes/ReservationNotes',
      success: () => {
        that.setData({ isNavigate: false })
      }
    })
  },

  //手机号码验证
   checkMobile: function (value) {
    if (value == '') {
      return false;
    } else if (value && (!(/^[1-9]\d*$/).test(value))) {
      return false;
    } else if (value != undefined) {
      return true;
    }
  },
  // 下单
  gotoPayOrder:function(){
    var that = this;
    // 阻止连续点击
  
    var sourceType = 3;   //标识来源是微信，3
    var orderInfo = that.data.orderInfo;
    var address = orderInfo.end
    var userName = that.data.userName;
  // 取分销id
    var resellerId = wx.getStorageSync("sellerId");

    // 获取街道号
    address = address.address.split(address.district)[1]
      // 判断联系人和联系电话是否填写
    if (!utils.checkUserName(userName)) {
        wx.showModal({
          content: '联系人姓名由2-20个中文或英文字符组成！',
          showCancel: false,
        })
        return
    }
    else if (!that.checkMobile(that.data.phoneNum)){
      wx.showModal({
        content: '请输入正确的联系电话！',
        showCancel: false,
        success(res) {
          that.setData({phoneNum:''})
        }
      })
      return
    }
    else {
     
      if (that.data.isNavigate) {
        return;
      }
      that.setData({ isNavigate: true })
      //  保存订单
      http.request({
        url: config.jsHost +'/app/v1.0/order/save',
        data: {
          "contactNumber": that.data.phoneNum,
          "contacts": that.data.userName,
          "goodsId": that.data.id,
          "lat": orderInfo.end.location.lat,
          "lng": orderInfo.end.location.lng,
          "name": orderInfo.end.title,
          "passengerNumber": that.data.personNum,
          "place": orderInfo.end.district,
          "shiftArriveTime": orderInfo.flightEndTime,
          "shiftNumber": orderInfo.flightNum,
          "shiftStartTime": orderInfo.flightStartTime,
          "sourceType": sourceType,
          "address": address,
          "resellerId": resellerId
        },
        method: 'POST',
        success: function (res) {
          that.setData({ isNavigate: false })
          if (res.data.code == 200) {
            // 下单成功返回订单号，跳转支付页面
            //注销分销商ID
            // wx.setStorageSync('sellerId', '');
            wx.redirectTo({
              url: '../payOrder/payOrder?orderId=' + res.data.data
            })
          } else {
            wx.showModal({
              title: '提示',
              showCancel: false,
              content: res.data.msg,
            })
            var data = {
              "contactNumber": that.data.phoneNum,
              "contacts": that.data.userName,
              "goodsId": orderInfo.start.id,
              "lat": orderInfo.end.location.lat,
              "lng": orderInfo.end.location.lng,
              "name": orderInfo.end.title,
              "passengerNumber": that.data.personNum,
              "place": orderInfo.end.district,
              "shiftArriveTime": orderInfo.flightEndTime,
              "shiftNumber": orderInfo.flightNum,
              "shiftStartTime": orderInfo.flightStartTime,
              "sourceType": sourceType,
              "address": address,
              "resellerId": resellerId,
              "data":res.data
            };
            throw new Error(JSON.stringify(data));
            
          }
        }
      })
    }
  },
  // 增加人数
  addPerson:function(){
    var that = this;
    if (that.data.personNum >=20){
      return
    }
    that.data.personNum += 1;
    that.data.payMoney = that.numMulti(that.data.price, that.data.personNum)
    that.setData({
      personNum: that.data.personNum,
      payMoney: that.data.payMoney
    })
  },
  // 减人数
  subPerson: function () {
    var that = this;
    if (that.data.personNum > 1){
      that.data.personNum -= 1
      that.data.payMoney = that.numMulti(that.data.price, that.data.personNum)
      that.setData({
        personNum: that.data.personNum,
        payMoney: that.data.payMoney
      })
    }
    
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