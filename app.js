import http from './libs/http.js';
import './utils/mtj-wx-sdk.js'
var config = require('./libs/config');

App({
  onLaunch: function () {
    // 第一次登录小程序设置userStatus状态为1
    var userStatus = wx.getStorageSync('userStatus');
    if (userStatus ==''){
      wx.setStorageSync('userStatus', 1);
    }
    var openid = wx.getStorageSync('openid');
    if (openid == '') {
      this.getOpenID();
    }
  },
  // 获取openid
  getOpenID: function(){
    var openid = wx.getStorageSync('openid')
    var that = this;
    if (openid ==''){
      wx.login({
        success: function (res) {
          if (res.code) {
            //获取openID
            http.request({
              url: config.loginHost+'/v2.0/wechat/get-openid',
              loading: true,
              method: 'POST',
              data: {
                code: res.code
              },
              success: function (res) {
                if (res.data.code == 200) {
                  wx.setStorageSync('openid', res.data.data)
                }
                else {
                  var data = {
                    code: res.code,
                    data: res
                  };
                  throw new Error(JSON.stringify(data));
                }
              }
            })
          } else {
            that.globalData.isLogin = false;
            wx.showModal({
              title: '警告',
              content: '微信登录失败'
            })
          }
        }
      });
    }
   
  },
 
  globalData:{
    userInfo: null,
    code: "",
    userStatus:1,
    token:'',
    session_key:''
  }
})