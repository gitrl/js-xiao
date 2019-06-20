// pages/airplanArrival/airplanArrival.js
var QQMapWX = require('../../libs/qqmap-wx-jssdk.min.js');
var config = require("../../libs/config.js");
var http = require('../../libs/http.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    tips: {},
    isTipShow: false,//输入提示
    isHotShow: true,  // 热门
    type:'', //业务类型
    hotAddressList:[],
    value:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      type: options.type
    });
    if (options.type == 'takeAir') {
      wx.setNavigationBarTitle({
        title: '目的地'
      })
    }
    else if (options.type == 'sendAir') {
      wx.setNavigationBarTitle({
        title: '出发地'
      })
    }
    else if (options.type == 'takeTrain'){
      wx.setNavigationBarTitle({
        title: '目的地'
      })
    }
    else if (options.type == 'sendTrain') {
      wx.setNavigationBarTitle({
        title: '出发地'
      })
    }
  //调用热门地址
    this.getHotAddress()
  },
  //获取热门地址
  getHotAddress:function(){
    var that = this;
    http.request({
      url: config.jsHost + '/app/v1.0/hotplace/list',
      success(res) {
        if(res.data.code == 200 && res.data.data.length>0){
          that.setData({
            hotAddressList: res.data.data,
          })
        }
      }
    })
  },
  // 输入提示
  inputTips:function(e){
    var that = this;
    var keywords = e.detail.value;
    if (keywords == ''){
      this.setData({
        isTipShow: false,
        isHotShow: true
      })
    }
    else{
      this.setData({
        value: keywords,
        isTipShow: true,
        isHotShow: false
      })
      // 实例化API核心类
      var qqmapsdk = new QQMapWX({
        key: config.Config.key
      });
      // 调用接口
      qqmapsdk.getSuggestion({
        keyword: keywords,
        region: '拉萨市',
        region_fix: 1, //取值： 0：[默认]当前城市无结果时，自动扩大范围到全国匹配 1：固定在当前城市
        policy: 1,  //policy=0：默认，常规策略, policy=1：本策略主要用于收货地址、上门服务地址的填写，
        success: function (res) {
          that.setData({
            tips: res.data,
          })
        },
        complete: function (res) {
        }
      });
    }
  },
  // 点击搜索列表
  chooseAreaItem:function(e){
    var that = this;
    var keywords = e.target.dataset.keywords;
    http.request({
      url: config.jsHost +'/app/v1.0/order/check/point',
      data:{
        lat: keywords.location.lat,
        lng: keywords.location.lng
      },
      success(res) {
        if (res.data.code == 200) {
          var pages = getCurrentPages();
          var currPage = pages[pages.length - 1];  //当前页面
          var prevPage = pages[pages.length - 2]; //上一个页面
          var type = that.data.type;
          if (type == 'takeAir') {
            prevPage.setData({
              takeEnd: keywords,
            })
          } else if (type == 'sendAir') {
            prevPage.setData({
              sendStart: keywords,
            })
          }
          else if (type == 'takeTrain') {
            prevPage.setData({
              trainEnd: keywords,
            })
          }
          else if (type == 'sendTrain') {
            prevPage.setData({
              trainStart: keywords,
            })
          }

          wx.navigateBack();
        }
        else{
        
          wx.showModal({
            title: '提示',
            showCancel:false,
            content: res.data.msg,
            success:function(res){
              that.setData({
                value: '',
              })
            }
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