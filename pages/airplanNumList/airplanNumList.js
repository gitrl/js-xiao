// pages/airplanNumList/airplanNumList.js
var app = getApp();
var utils = require('../../utils/util.js');
import http from '../../libs/http.js';
var config = require("../../libs/config.js");

Page({

  /**
   * 页面的初始数据
   */
  data: {
    flightList:[],  //航班列表数据 
    token:'' ,     //登录状态
    isShow:true,
    failMsg:'查询失败！',  //查询失败显示信息
    type:"" //业务类型
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.showNavigationBarLoading();
    var that = this;
    var type = options.type;
    type = (type == 'takeAir' ? 1 : (type == 'sendAir' ? 2 : (type == 'takeTrain' ? 3 : (type == 'sendTrain' ? 4 : ''))));
    this.setData({
      type:type
    })
    that.getFlightList(options)
   
  },
  // 获取航班列表
  getFlightList: function (options){
    var that = this;
    // 起始地
    if (options.searchWay == 'endAdd') {
      // 动态设置标题
      wx.setNavigationBarTitle({
        title: options.depCity + ' ⇀ ' + options.arrCity
      })
      var pages = getCurrentPages();
      var prevPage = pages[pages.length - 2]; //上一个页面
      var citystartInfo = prevPage.data.start;
      var cityendInfo = prevPage.data.end;
      // 按起始地
      http.request({
        url: config.jsHost +'/app/v1.0/flight/getByDepCodeAndArrCode',
        data: {
          depCode: citystartInfo.aitaCode,
          depCity: citystartInfo.name,
          arrCode: cityendInfo.aitaCode,
          arrCity: cityendInfo.name,
          date: options.formatTimeS
        },
        success(res) {
          wx.hideNavigationBarLoading()
          let data = res.data.data;
          // 请求成功
          if (res.data.code == 200) {
            for (let i in data) {
              // 转换时间
              let flighTimetList = {};
              var arrTime = that.getTime(data[i].arrTime);
              var depTime = that.getTime(data[i].depTime);
              flighTimetList.arrTime = arrTime;
              flighTimetList.depTime = depTime;
              data[i].flighTimetList = flighTimetList;
            }
            that.setData({
              flightList: data,
              isShow: true
            })
          } else {
            that.setData({
              isShow: false,
              failMsg: res.data.msg
            })
          }
        }
      })
    }
    else {
      // 动态设置标题
      wx.setNavigationBarTitle({
        title: options.flightNum
      })
      // 按航班号点击查询 
      http.request({
        url: config.jsHost +'/app/v1.0/flight/getByFlightNo',
        data: {
          flightNo: options.flightNum,
          date: options.formatTimeS,
          goodsType: that.data.type,
        },
        success(res) {
          wx.hideNavigationBarLoading()
          if (res.data.code == 200) {
            let data = res.data.data;
            for (let i in data) {
              let flighTimetList = {};
              var arrTime = that.getTime(data[i].arrTime);
              var depTime = that.getTime(data[i].depTime);
              flighTimetList.arrTime = arrTime;
              flighTimetList.depTime = depTime;
              data[i].flighTimetList = flighTimetList;
            }
            that.setData({
              flightList: data
            })
          } else {
            that.setData({
              isShow: false,
              failMsg: res.data.msg
            })
          }
        }
      })
    }
  },

  // 转换时间
  getTime(time){
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
  // 点击选择按钮
  chooseFlifhtNum:function(e){
    var that = this;
    // 获取选择按钮上的自定义属性，航班号、起飞时间，到达时间
    var options = e.currentTarget.dataset;
    var pages = getCurrentPages();
    var currPage = pages[pages.length - 1];  //当前页面
    var prevPage = pages[pages.length - 2]; //上一个页面
    var prev3Page = pages[pages.length - 3]; //上上一个页面
    var type = that.data.type;
    http.request({
      url: config.jsHost +'/app/v1.0/get-estimate-time',
      data: {
        orderType: type,
        shiftStartTime: options.deptime,
        shiftEndTime: options.arrtime
      },
      success: function (res) {
        // 计划用车时间
        //res.data.data.willStartTime = "1555690800000";
        var useCarTime = parseInt(res.data.data.willStartTime);
        useCarTime = that.getTime(useCarTime);
        var useCarDate = utils.getAfterDayDate(new Date(parseInt(res.data.data.willStartTime)), 0);
        var useCarDatemm = res.data.data.willStartTime;

        // 航班起飞(到达)日期
        var flightArrdate;
        if(type==2){
          flightArrdate= parseInt(options.deptime);
        }else{
          flightArrdate = parseInt(options.arrtime);
        }
        flightArrdate = utils.getAfterDayDate(new Date(flightArrdate), 0);

        // 航班到达时间
        var flightArrTime = new Date(options.arrtime);
        flightArrTime = that.getTime(flightArrTime);
        // 航班起飞时间
        var flightDepTime = new Date(options.deptime);
        flightDepTime = that.getTime(flightDepTime);
        var flightEndTime = options.arrtime;
        var flightStartTime = options.deptime;
        if (type == 1) {
          prev3Page.setData({
            isShow1: true,
            isShow2: false,
            isShow3: false,
            isShow4: false,
            airplanNum2:'',
            trainNum2: "",
            trainNum: "",
            airplanNum: options.flightno,
            endInfo: prevPage.data.end,
          })
        }
        else if (type == 2) {
          prev3Page.setData({
            isShow2: true,
            isShow1: false,
            isShow3: false,
            isShow4: false,
            airplanNum: '',
            trainNum2: "",
            trainNum: "",
            airplanNum2: options.flightno,
            endInfo: prevPage.data.start,
          })
        }
        prev3Page.setData({
          flightDate: flightArrdate,//航班起飞时间,转换后的时间
          flightArrTime: flightArrTime, //航班到达时间,转换后的时间
          flightDepTime: flightDepTime,
          flightStartTime: flightStartTime, //航班起飞时间，毫秒
          flightEndTime: flightEndTime,   //航班到达时间，毫秒
          useCarTime: useCarTime,
          useCarDate: useCarDate,
          useCarDatemm: useCarDatemm,
          type: type,
        })
        wx.navigateBack({
          delta: 2
        })
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