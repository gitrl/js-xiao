// pages/PersonalCenter/PersonalCenter.js
import http from '../../libs/http.js';
var config = require('../../libs/config');

var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    showModal:false,
    mobileNum:'-',
    gender:'-',
    nickName:'-',
    avatarUrl:'../../img/airplan/head_pic.png',
    isNavigate: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var token = wx.getStorageSync('token');
    var userInfo = wx.getStorageSync('userInfo');
    var userStatus = wx.getStorageSync('userStatus');
    if (token != '' && userStatus == 2){
      this.setData({
        mobileNum: userInfo.mobileNumber,
        nickName: userInfo.nickName,
        avatarUrl: userInfo.avatarUrl,
        gender:userInfo.gender,
      })
    }
  },
  // 点击取消
  modalCancel:function(){
    this.setData({ showModal: false });
    // 点击取消就不再弹框询问是否获取资料
    wx.setStorageSync('userStatus', 3);
  },
  // 同意授权
  onGotUserInfo(e) {
    var that = this;
    var userData = e.detail.userInfo;
    this.setData({ showModal: false });
    http.request({
      url: config.jsHost +'/app/v1.0/member/wechat/save',
      method: 'POST',
      data: {
        nickName: userData.nickName,
        avatarUrl: userData.avatarUrl,
        gender: userData.gender,
        province: userData.province,
        city: userData.city,
        country: userData.country
      },
      success(res) {
        wx.setStorageSync('userStatus', 2);
    // 存信息
        var data = res.data.data;
        if (res.data.code == 200) {
          wx.setStorageSync("userInfo", data);
          var userInfo = wx.getStorageSync('userInfo');
          that.setData({
            avatarUrl: userData.avatarUrl,
            showModal: false,
            mobileNum: userInfo.mobileNumber,
            nickName: userInfo.nickName,
            gender: userData.gender,
          })
        }else{
          wx:wx.showModal({
            title: '提示',
            content: res.data.msg
          })
        }
      }
    })
  },
  // 退出
  clearUser:function(){
   var that = this;
    if (that.data.isNavigate) {
      return;
    }
    that.setData({ isNavigate: true })
    wx:wx.showModal({
      title: '提示',
      content: '确认退出登录？',
      showCancel: true,
      success: function(res) {
        if (res.confirm) {
          wx.showLoading({
            title: '退出中',
          })
          wx.setStorageSync('userStatus', 1);
          that.setData({
            mobileNum:'-',
            nickName: '-',
            avatarUrl: '../../img/airplan/head_pic.png',
            gender: '-',
          })
          // 清楚本地数据ff
          // wx.removeStorageSync('token');
          // wx.removeStorageSync('userInfo');
          // wx.setStorageSync('userStatus', 1);
          wx.clearStorageSync()
          wx.hideLoading()
          wx.switchTab({
            url: '../airplanIndex/airplanIndex',
            success: () => {
              that.setData({ isNavigate: false })
            }
          })
        }
        else if(res.cancel){
          that.setData({ isNavigate: false })
        }
      }
    })
  
  },

  // 拨打客服
  callMobile:function(){
    wx.makePhoneCall({
      phoneNumber: '400-656-2666'
    })
  },
 

/* 
    1、点击分销中心请求接口（根据返回判断是否是分销商）；
    2、是则跳转分销中心；
    3、不是则弹框询问是否注册分销商；

*/
  sellerCenter: function () {
    var that = this;
    var userInfo = wx.getStorageSync('userInfo');
    if (that.data.isNavigate) {
      return;
    }
    that.setData({ isNavigate: true });
      http.request({
        url: config.jsHost + '/app/v1.0/reseller/check',
        data:{
          mobileNumber:userInfo.mobileNumber
        },
        success(res) {
          console.log(res)
          that.setData({ isNavigate: false });
          if(res.data.code == 200){
            wx.navigateTo({
              url: './seller/SellerHome'
            })
          }
          else if (res.data.code == 4000){
            wx.showModal({
              title: '提示',
              content: '未获取小程序用户信息，无法成为分销商，是否获取你的信息？',
              success(res){
                if(res.confirm){
                  that.setData({
                    showModal: true
                  })
                }
              }
            })
          }
          else if (res.data.code == 4001) {
            wx.showModal({
              title: '提示',
              content: '你还不是分销商，需要注册为分销商吗？',
              success: function (res) {
                that.setData({ isNavigate: false });
                if (res.confirm) {
                  that.registerReller(userInfo.mobileNumber);
                  
                }
              }
            })
          }
          else if (res.data.code == 4003) {
            wx.showModal({
              title: '提示',
              content: '审核失败，是否再次申请',
              success(res){
                if(res.confirm){
                  that.registerReller(userInfo.mobileNumber);
                }
              }
            })
          }
          else{
            wx.showModal({
              title: '提示',
              showCancel:false,
              content: res.data.msg,
            })
          }
        }
      })

  },
// 注册分销商
  registerReller: function (mobileNumber){
    http.request({
      url: config.jsHost + '/app/v1.0/reseller/register',
      method: 'POST',
      data:{
        mobileNumber: mobileNumber
      },
      success(res) {
        // 注册成功将reseller置为1(如果不退出不会再请求save接口)
        if (res.data.code == 200) {
            wx.showModal({
              title: '提示',
              showCancel:false,
              content: '申请成功，等待审核中'
            })
        }
        else {
          wx.showModal({
            title: '提示',
            content: '注册分销商错误，请稍后再试',
            showCancel: false,
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
    var token = wx.getStorageSync('token');
    var userStatus = wx.getStorageSync('userStatus');
    if (token == '') {
      wx.showModal({
        title: '提示',
        content: '您长时间未登录或在其他地方登录，请重新登录',
        cancelText:'暂不登录',
        confirmText:'立即登录',
        cancelColor: '#c7c7c7',
        success(res) {
          if (res.confirm) {
            wx.navigateTo({
              url: '/pages/reg/reg'
            })
          }
          else {
            wx.switchTab({
              url: '/pages/airplanIndex/airplanIndex'
            })
          }
        }
      })
      return;
    }
    if (token != '' && userStatus == 1) {
      // wx.removeStorageSync('userInfo');
      this.setData({
        showModal: true,
        mobileNum: '-',
        gender: '-',
        nickName: '-',
        avatarUrl: '../../img/airplan/head_pic.png',
      })
      return;
    }
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