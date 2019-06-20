var app = getApp();
var utils = require('../../utils/util.js');
import http from '../../libs/http.js';
var config = require("../../libs/config.js");

Page({
  data: {
    winHeight: "",//窗口高度
    currentTab:'0', //预设当前项的值
    scrollLeft: 0, //tab标题的滚动条位置
    start:'', //按出发地目的地时，出发地
    end: '',   //按出发地目的地时，目的地
    // keywords:'',    
    airplanNum:'',  //选择航班号
    date:'', //选择航班号时间 安航班号
    date2: '', //选择航班时间 安起始地
    startDate:'', //选择日期是限制只能选择当天之后
    type:'', //业务类型
    options: {}, //上个页面传过来的参数
    isNavigate: false,
    endDate:''
  },
  // 滚动切换标签样式
  switchTab: function (e) {
    this.setData({
      currentTab: e.detail.current
    });
    this.checkCor();
  },
  // 点击标题切换当前页时改变样式
  swichNav: function (e) {
    var cur = e.target.dataset.current;
    if (this.data.currentTaB == cur) { 
      return false;
       }
    else {
      this.setData({
        currentTab: cur
      })
    }
  },
  //判断当前滚动超过一屏时，设置tab标题滚动条。
  checkCor: function () {
    if (this.data.currentTab > 4) {
      this.setData({
        scrollLeft: 300
      })
    } else {
      this.setData({
        scrollLeft: 0
      })
    }
  },
   // 按航班号
  bindDateChange: function (e) {
    this.setData({
      date: e.detail.value
    })
  },
   //安起始地
  bindDate2Change: function (e) {
    this.setData({
      date2: e.detail.value
    })
  },
  //获取用户输入的出发地
  startAreaInput: function (e) {
    this.setData({
      start: e.detail.value
    })
  },
  endAreaInput: function (e) {
    this.setData({
      end: e.detail.value
    })
  },
  // 点击交换出发地和目的地
  // searchBox: function (e) {
  //   this.setData({
  //     end: this.data.start,
  //     start: this.data.end
  //   })
  // },
  // 点击目的地跳转城市选择页面
  slidToChooseAreaend(){
    var that = this;
    if (this.data.type == 'takeAir' || this.data.type == 'takeTrain' || that.data.isNavigate) {
      return;
    }
    that.setData({ isNavigate: true })
    wx.navigateTo({
      url: '../cityList/cityList?target=end',
      success: () => {
        that.setData({ isNavigate: false })
      }
    })
  },
  // 点击跳转城市选择页面
  slidToChooseAreastart() {
    var that = this;
    if (this.data.type == 'sendAir' || this.data.type == 'sendTrain' || that.data.isNavigate) {
      return;
    }
    that.setData({ isNavigate: true })
    wx.navigateTo({
      url: '../cityList/cityList?target=start',
      success: () => {
        that.setData({ isNavigate: false })
      }
    })
  },
  // 输入航班号保存值
  airplanNum: function (e) {
    this.setData({
      airplanNum: e.detail.value
    })
  },
  // 按航班号点击查询 验证表单
  searcFlightNum(){
    var that = this;
    if (this.data.airplanNum =='' || this.data.date == ''){
      wx.showModal({
        content: '请输入航班号和起飞时间',
        showCancel: false,
        success(res) {
        }
      })
    }
    else{
      if (that.data.isNavigate) {
        return;
      }
      that.setData({ isNavigate: true })
      var formatTimeS = new Date(this.data.date).getTime()
      var flight = this.data.airplanNum;
      var type = that.data.type;
      wx.navigateTo({
        url: '../airplanNumList/airplanNumList?type=' + type + '&&searchWay=flightNum &&flightNum=' + flight + '&&formatTimeS=' + formatTimeS,
        success: () => {
          that.setData({ isNavigate: false })
        }
      })
    }
  },
  // 按起始地
  searcFlightCity:function(){
    var that = this;
    if (this.data.start == '' || this.data.end == '' || this.data.date2 == '') {
      wx.showModal({
        content: '请输入起始地址和起飞时间',
        showCancel: false,
        success(res) {
        }
      })
    }
    else {
      if (that.data.isNavigate) {
        return;
      }
      that.setData({ isNavigate: true })
      var formatTimeS = new Date(this.data.date2).getTime()
      var citystartInfo = that.data.start;
      var cityendInfo = that.data.end;
      var type = that.data.type;
      wx.navigateTo({
        url: '../airplanNumList/airplanNumList?type=' + type + '&&searchWay=endAdd&&depCity=' + citystartInfo.name + '&&arrCity=' + cityendInfo.name + '&&formatTimeS=' + formatTimeS,
        success: () => {
          that.setData({ isNavigate: false })
        }
      })
     
    }
  },
  // 获取默认地址
  
  onLoad: function ( options) {
    var that = this;
    // 获取今天之后的日期
    var currentDate = utils.getAfterDayDate(new Date(),0);
    var endDate = utils.getAfterDayDate(new Date(), 90);
    this.setData({
      startDate: currentDate,
      type: options.type,
      options: options,
      endDate: endDate
    })
    
    //  高度自适应
    wx.getSystemInfo({
      success: function (res) {
        var clientHeight = res.windowHeight,
          clientWidth = res.windowWidth,
          rpxR = 750 / clientWidth;
        var calc = clientHeight * rpxR - 180;
        that.setData({
          winHeight: calc
        });
      }
    });
  },
  /**
  * 生命周期函数--监听页面显示
  */
  onShow: function () {
    var that = this;
    var options = this.data.options
    // 获取默认地址
    http.request({
      url: config.jsHost + '/app/v1.0/goods/buy',
      success(res) {
        console.log(res)
        var data = res.data.data;
        //takeAir：接机，sendAir：送机，takeTrain：接站，sendTrain：送站
        // 接：目的地为默认地址，送：chu出发地为默认地址
        for (let item in data) {
          if (options.type == 'takeAir' && data[item].goodsType == 1) {
            that.setData({
              end: data[item]
            });
          }
          else if (options.type == 'sendAir' && data[item].goodsType == 2) {
            that.setData({
              start: data[item]
            });
          }
          else if (options.type == 'takeTrain' && data[item].goodsType == 3) {
            that.setData({
              end: data[item]
            });
          }
          else if (options.type == 'sendTrain' && data[item].goodsType == 4) {
            that.setData({
              start: data[item]
            });
          }
        }
      }
    })
  },
  footerTap: app.footerTap
})