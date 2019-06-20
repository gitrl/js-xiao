var utils = require('../../../utils/util.js');
import http from '../../../libs/http.js';
var config = require('../../../libs/config');
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    balance: 0, //余额
    card: '', //银行卡
    bandName: '', //银行名称
    phone: '', //联系电话
    sellerId: "", //分销商分享ID
    isNavigate: false,
  },
  //去绑定银行卡按钮
  bandCard: function (){
    if (this.data.isNavigate) {
      return;
    }
    this.setData({ isNavigate: true })
    wx.navigateTo({
      url: './Card',
      success: () => {
        this.setData({ isNavigate: false })
      }
    })
  },
  //提现按钮
  cash: function (){
    if (this.data.isNavigate) {
      return;
    }
    this.setData({ isNavigate: true })
    if(this.data.balance > 0){
      wx.navigateTo({
        url:  "./Cash",
        success: () => {
          this.setData({ isNavigate: false })
        }
      })
    }
    else{
      this.setData({ isNavigate: false })
      wx.showModal({
        title: '系统提示',
        content: "余额不足，无法提现",
      })
    }
  },
  // 佣金明细
  commissionRecord:function(){
    if (this.data.isNavigate) {
      return;
    }
    this.setData({ isNavigate: true })
    wx.navigateTo({
      url: './CommissionRecord',
      success: () => {
        this.setData({ isNavigate: false })
      }
    })
  },
  // 提现明细
  cashRecord:function(){
    if (this.data.isNavigate) {
      return;
    }
    this.setData({ isNavigate: true })
    wx.navigateTo({
      url: './CashRecord',
      success: () => {
        this.setData({ isNavigate: false })
      }
    })
  },
  // 分销二维码
  shareErweiCode:function(){
    if (this.data.isNavigate) {
      return;
    }
    this.setData({ isNavigate: true })
    wx.navigateTo({
      url: './erweiCode?sellerId=' + this.data.sellerId,
      success: () => {
        this.setData({ isNavigate: false })
      }
    })
  },
  //转发
  onShareAppMessage: function (res) {
    if (res.from === 'button') {
      http.request({
        url: config.jsHost + '/app/v1.0/reseller/share/add',
        method:'POST',
        success(res) {
        }
      })
    }
    return {
      title:'牦牛出行-接送机',
      path: 'pages/airplanIndex/airplanIndex?sellerId=' + this.data.sellerId,
      imageUrl: "/img/1.png",
    }
  },

  // 修改电话显示为111****2222
  updateNum: function (value) {
    var that = this;
    var newPhone = '';
    if (value.length > 0) {
      for (var i = 0; i < value.length; i++) {
        if (i < 3 || i >= value.length - 4) {
          newPhone += value[i];
        } else {
          newPhone += '*';
        }
      }
    }
    return newPhone
  },
// 获取分销商信息
  getSellerInfo:function(){
    var that = this;
    http.request({
      url: config.jsHost + '/app/v1.0/reseller/get',
      success(res) {
        wx.hideLoading()
        if (res.data != "undefined" && res.data.code == 200) {
          var data = res.data.data;
          var withdrawableBalance = utils.change(data.withdrawableBalance);
          var phoneNum = that.updateNum(data.mobileNumber);
          that.setData({
            balance: withdrawableBalance, //余额
            card: data.bankNumber, //银行卡
            phone: phoneNum, //联系电话
            sellerId: data.resellerId, //分销商分享ID
          })
        }
        else {
          wx.hideLoading()
          wx.showModal({
            title: '系统错误',
            showCancel:false,
            content: res.data.msg,
          })
        }
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.showLoading({
      title: '加载中...',
    })
    var that = this;
    // this.getSellerInfo()
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
    this.getSellerInfo()
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
})