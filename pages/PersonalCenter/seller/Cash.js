//提现页面
import http from '../../../libs/http.js';
var utils = require('../../../utils/util.js');
var config = require('../../../libs/config');

var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    balance: 0, //余额
    card: '', //银行卡
    bankName: '', //银行名称
    isCode:true,    //判断是否显示倒计时
    countDown:60,   //倒计时
    moneySum:'',  //提现金额
    currentBgColor:0,//判断提现按钮
    isNavigate: false,
    isCash:false,
    checkCode:'', //验证码
    mobileNumber:''
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    var mobileNumber = wx.getStorageSync('userInfo');
    this.setData({ mobileNumber: mobileNumber.mobileNumber });
    // 获取提现信息
    http.request({
      url: config.jsHost + '/app/v1.0/artemis/withdrawal/info',
      success(res) {
        if(res.data.code == 200){
          that.setData({
            balance: utils.change(res.data.data.balance),
            card: res.data.data.bankNumber,
            bankName: res.data.data.bankName
          })
        }
        // 没绑定银行卡
        else if (res.data.code == 10405){
          wx.showModal({
            title: '提示',
            content: res.data.msg,
            showCancel: false,
            success: function (res) {
              wx.redirectTo({
                url: './Card'
              })
            }
          })
        }
        else{
          wx.showModal({
            title: '提示',
            content: res.data.msg,
            showCancel:false,
          })
        }
      }
    })

  },
  
  // 提现
  cathBtn:function(){
    var that = this;
    if (this.data.isCash) {
      return;
    }
    this.setData({ isCash: true })
    var userInfo = wx.getStorageSync('userInfo');
    if (this.data.currentBgColor == 1){
      
      http.request({
        url: config.jsHost + '/app/v1.0/artemis/withdrawal/apply',
        method: 'POST',
        data: {
          amount: utils.changeTofen(this.data.moneySum),
          wechatName: userInfo.wechatName,
          code: this.data.checkCode
        },
        success(res) {
          if (res.data.code == 200) {
            wx.showModal({
              title: '提示',
              showCancel: false,
              content: '提现成功',
              success: function (res) {
                wx.redirectTo({
                  url: './SellerHome',
                  success: () => {
                    that.setData({ isCash: false });
                  }
                })
              }
            })
          }
          else {
            that.setData({ isCash: false });
            wx.showModal({
              title: '提示',
              showCancel:false,
              content: res.data.msg,
            })
          }
        }
      })
    }
    else{
      return;
    }
   
    
  },
  // 验证码倒计时
  countDown:function(){
    var that = this;
    //倒计时
    var num = 60;
    var timesID = setInterval(function () {
      num--;
      that.data.countDown = num;
      that.setData({
        countDown: that.data.countDown
      })
      //给id为unbind的元素删除点击事件
      if (num < 0) {
        clearInterval(timesID);
        that.setData({ isCode: true, isNavigate: false  })
      }
    }, 1000);
  },
  // 输入提现金额
  cashMoney: function (e) {
    var that = this;
    var cashMoney = e.detail.value;
    var reg = /^[0-9\.]*$/;
    if (utils.changeTofen(cashMoney) > utils.changeTofen(this.data.balance) || !reg.test(cashMoney)){
      wx.showModal({
        title: '提示',
        content: '请输入正确的金额，并不能超过总金额',
        showCancel: false,
        success:function(){
          that.setData({
            moneySum:''
          })
        }
      })
    }
    else{
      this.setData({
        moneySum: e.detail.value
      })
    }
   
  },
  // 获取验证码
  getCode:function(){
    if (this.data.isNavigate) {
      return;
    }
    
    if (this.data.moneySum != '' && this.data.moneySum>0){
      this.setData({ isNavigate: true })
      this.setData({ isCode: false})
      this.countDown();
      // 获取验证码
      http.request({
        url: config.jsHost + '/app/v1.0/artemis/send-sms',
        data: {
          mobileNumber: this.data.mobileNumber
        },
        success(res) {
          if (res.data.code != 200) {
            wx.showModal({
              title: '提示',
              showCancel: false,
              content: res.data.msg,
            })
          }
        }
      })
    }
    else{
      wx.showModal({
        title: '提示',
        showCancel: false,
        content: '请输入金额',
      })
    }
  },
  // 输入验证码
  inputCode:function(e){
    var value = e.detail.value;
    if(value.length ==4 ){
      this.setData({ currentBgColor: 1, checkCode: value })
    }
    else{
      this.setData({ currentBgColor: 0})
    }
  },
  // 提现规则
  cashRule:function(){
    if (this.data.isNavigate) {
      return;
    }
    this.setData({ isNavigate: true })
    wx.navigateTo({
      url: './cashRule',
      success: () => {
        this.setData({ isNavigate: false })
      }
    })
  },
  // 全部提现
  cashAll:function(){
    this.setData({
      moneySum: this.data.balance
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
    this.setData({
      currentSize: 1,
        orderList: [],
    })
    this.loadMore()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    var that= this;
    if (that.data.hasMore){
      that.loadMore()
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})