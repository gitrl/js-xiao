import http from '../../../libs/http.js';
var config = require('../../../libs/config');

var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    name: "", //用户姓名
    card: "", //银行卡号
    phone: "", //联系电话
    mobileNumber:'',
    idCard: '',//身份证
    code: "", //验证码
    isNavigate: false,
    isBind:true , //绑定or解绑
    isCode: true,    //判断是否显示倒计时
    countDown: 60,   //倒计时
    isDisable:false, //是否可修改
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    var phone = wx.getStorageSync('userInfo');
    this.setData({ phone: that.updateNum(phone.mobileNumber), mobileNumber: phone.mobileNumber});
// 获取银行卡信息
    http.request({
      url: config.jsHost + '/app/v1.0/reseller/bank/get',
      success(res) {
        if(res.data.code == 200){
          that.setData({
            isBind: true,
            name:res.data.data.userName,
            card: that.updateNum(res.data.data.bankNumber) ,
            isDisable:true,
            idCard: that.updateNum(res.data.data.idCard)
          })
        }
        else{
          that.setData({ isBind: false, isDisable: false})
          // wx.showModal({
          //   title: '提示',
          //   content:res.data.msg,
          // })
        }
      }
    })

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
  // 验证码倒计时
  countDown: function () {
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
        that.setData({ isCode: true, isNavigate: false, countDown: 60, })
      }
    }, 1000);
  },
  // 获取验证码
  getCode: function () {
    if (this.data.isNavigate) {
      return;
    }
    // 调用倒计时显示
    if (this.data.mobileNumber !='') {
      this.setData({ isNavigate: true, isCode: false })
      this.countDown()
      http.request({
        url: config.jsHost + '/app/v1.0/artemis/send-sms',
        data:{
          mobileNumber: this.data.mobileNumber
        },
        success(res) {
          if(res.data.code != 200){
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
      this.setData({isCode: true })
      wx.showModal({
        title: '提示',
        showCancel:false,
        content: '手机号为空',
      })
    }
  },

  // 验证验证码和银行卡
  checkNum:function(value,text){
    if (text == "验证码" && value.length !== 4){
        wx.showModal({
          title:'验证码错误',
          content: "请输入四位合法验证码",
          showCancel: false,
        })
        return false;
    }
    if (typeof value == undefined || value == '') {
      wx.showModal({
        title: text+'错误',
        content: "请输入" + text,
        showCancel: false,
      })
      return false;
    }
    else if (value && (!(/^[0-9]*$/).test(value))){
      if (value.indexOf(" ") >= 0) {
        wx.showModal({
          title: text +'错误',
          content: text+"输入有空格!",
          showCancel: false,
        })
      } else {
        wx.showModal({
          title: text+'错误',
          content: text+"输入不符合规范",
          showCancel: false,
        })
        return false;
      }
    }
    return true;
  },
  //验证身份证
  checkIdCard:function(value){
    var reg = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;  
    if (typeof value == undefined || value == '') {
      wx.showModal({
        title: '身份证错误',
        content: '请输入身份证号',
        showCancel: false,
      })
      return false;
    }
    else if (value && (!reg.test(value))) {
        wx.showModal({
          title: '身份证错误',
          content: '请输入合法身份证号',
          showCancel: false,
        })
      return false;
    } 
    return true;
  },
  //绑定银行卡
  bandCard: function () {
    var that =this;
    if (that.data.name == ""){
      wx.showModal({
        title: "提示",
        content:"请输入姓名",
        showCancel: false,
      })
    }
    else if (
      that.checkNum(that.data.card, "银行卡") 
      && that.checkIdCard(that.data.idCard) 
      && that.checkNum(that.data.code,"验证码")){
      wx.showLoading({
        title: '加载中',
      })
      http.request({
        url: config.jsHost + '/app/v1.0/reseller/bank/bind',
        method:'POST',
        data: {
          bankNumber: that.data.card,
          code: that.data.code,
          mobileNumber: that.data.mobileNumber,
          userName:that.data.name,
          idCard: that.data.idCard
        },
        success(res) {
          wx.hideLoading();
          if (res.data != "undefined" && res.data.code == 200){
            wx.showModal({
              title: '系统提示',
              content: "绑定银行卡成功",
              showCancel:false,
              success: function (res) {
                wx.navigateTo({
                  url: '../seller/SellerHome'
                })
              }
            })
          }
          else{
            wx.showModal({
              title:"提示",
              content: res.data.msg,
            })
          }
        }
      })  
    }
  },
// 解绑
  unBandCard:function(){
    var that = this;
    var code = this.data.code;
    if (that.checkNum(that.data.code, "验证码")){
      wx.showLoading({
        title: '加载中',
      })
      http.request({
        url: config.jsHost + '/app/v1.0/reseller/bank/untying',
        method: 'POST',
        data: {
          code: code
        },
        success(res) {
          wx.hideLoading();
          if(res.data.code == 200){
            wx.showModal({
              title: '系统提示',
              content: "解绑成功",
              showCancel: false,
              success: function (res) {
                wx.navigateTo({
                  url: '../seller/SellerHome'
                })
              }
            })
          }
          else{
            wx.showModal({
              title: '系统提示',
              showCancel:false,
              content: res.data.msg,
            
            })
          }
        }
      })
    }
  
  },
  // 绑卡说明
  bindCardRule:function(){
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

  // 输入姓名
  inUserName: function (e) {
    this.setData({ name: e.detail.value})
  },
  // 输入银行卡
  inCard: function (e) {
    this.setData({card: e.detail.value})
  },
  // 输入验证码
  inCheckCode: function (e) {
    this.setData({ code: e.detail.value })
  },
  // 输入验证码
  inIdCard: function (e) {
    this.setData({ idCard: e.detail.value })
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