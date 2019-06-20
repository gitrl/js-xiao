var app = getApp();
var config = require('../../libs/config');
import http from '../../libs/http.js';
// pages/reg/reg.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    wx.showToast({
      title: '加载中',
      icon: 'loading',
      duration:500
    })
    that.getOpenID()
  },
  getOpenID: function () {
    var that = this;
    wx.login({
      success: function (res) {
        if (res.code) {
          //获取openID
          http.request({
            url: config.loginHost + '/v2.0/wechat/get-openid',  
            loading: true,
            method: 'POST',
            data: {
              code: res.code
            },
            success: function (data) {
              if(data.data.code == 200){
                wx.setStorageSync('openid', data.data.data)
              }
              else{
                var data = {
                  code: res.code,
                  data:data
                };
                throw new Error(JSON.stringify(data));
              }
            }
          })
        } else {
          console.log('获取用户登录态失败！' + res.errMsg)
          wx.showModal({
            title: '警告',
            content: '微信登录失败'
          })
        }
      }
    });
  },
  getPhoneNumber: function (e) {
    var that = this;
    var encryptedData = e.detail.encryptedData;
    var iv = e.detail.iv;
    var openid = wx.getStorageSync('openid');
    if (e.detail.errMsg == 'getPhoneNumber:fail user deny') {
      wx.showModal({
        title: '提示',
        showCancel: false,
        content: '未授权',
        success: function (res) {
          wx.switchTab({
            url: '../airplanIndex/airplanIndex'
          })
        }
      })
    } 
    else if (openid == ""){
      wx.showModal({
        title: '提示',
        content: '未获取到openid无法登录,是否重新获取？',
        success(res){
          if (res.confirm) {
            wx.showLoading({
              title: '加载中',
            })
            that.getOpenID();
            wx.switchTab({
              url: '../airplanIndex/airplanIndex'
            })
          }
        }
      })
    }
    else{
      that.getPhoneNum(encryptedData, iv, openid);
    }
   
  },
//发送求求解密encryptedData，获取手机号
getPhoneNum: function (encryptedData, iv, openid){
  wx.showLoading({
    title: '正在登录',
  })
  wx.request({
    url: config.loginHost + '/v2.0/wechat/login',
    header: {
      'content-type': 'application/json',
    },
    data: {
      encryptedData: encryptedData,
      iv: iv,
      openid: openid
    },
    method: "POST",
    success: function (res) {
      console.log(res)
      if (res.data.code == 200) {
        var token = res.data.data.token;
        wx.setStorageSync('token', token);
        wx.setStorageSync('userInfo', res.data.data);
        var sourceId = wx.getStorageSync('sourceId') || 0;
        wx.hideLoading()
        wx.navigateBack();
        wx.showToast({
          title: '登录成功',
          icon: 'success',
          duration: 1000
        });
        // 百度统计 isRegister:0老用户
        if (typeof res.data.data.isRegister == 'undefined' || res.data.data.isRegister == '' || res.data.data.isRegister == 0 ){
          getApp().mtj.trackEvent('mimi_21003', {
            old: sourceId +'',
            sourceid: 1,
          });
        }
        else if (res.data.data.isRegister == 1){
          getApp().mtj.trackEvent('mimi_21003', {
            new: sourceId + '',
            sourceid: 1,
          });
        }
      }
      else {
        wx.hideLoading();
        wx: wx.showModal({
          title: '提示',
          content: res.data.msg,
        })
        var data = {
          encryptedData: encryptedData,
          iv: iv,
          openid: openid,
          data: res.data
        };
        throw new Error(JSON.stringify(data));
        
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
    // 第一次登录小程序设置userStatus状态为1
    var userStatus = wx.getStorageSync('userStatus');
    if (userStatus == '') {
      wx.setStorageSync('userStatus', 1);
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
    // if(wx.getStorageSync('token') == ''){
    //   wx.switchTab({
    //     url: '/pages/airplanIndex/airplanIndex'
    //   })
    // }
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