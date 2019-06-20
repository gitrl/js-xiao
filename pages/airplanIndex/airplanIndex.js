var app = getApp();
var utils = require('../../utils/util.js');
var config = require('../../libs/config');

import http from '../../libs/http.js';

Page({
  data: {
    winHeight: "",//窗口高度
    currentTab: 0, //预设当前项的值
    // scrollLeft: 0, //tab标题的滚动条位置
    takeEnd: '',    //接机选择目的地
    sendStart:'',   //送机选择出发地
    trainEnd:'',
    trainStart:'',
    airplanNum: '',    //接机航班号
    airplanNum2:'',   //送机航班号
    trainNum:'',      //接站班次号
    trainNum2:'',     //送站班次号
    isShow1:false,  //航班信息是否显示
    isShow2: false, 
    isShow3: false, 
    isShow4: false, 
    flightDate:'',    //航班日期
    flightArrTime: '',//航班到达时间页面显示
    flightDepTime:'',
    useCarTime:'',  //计划用车时间
    useCarDate: '', //计划用车日期
    useCarDatemm: '', //计划用车日期时间戳
    type:'',  //业务类型
    endInfo:{} , //
    orderInfo :{} ,   //跳转下单页面需要的数据
    flightEndTime: '',   //航班到达时间，毫秒
    flightStartTime: '',    //航班起飞时间，毫秒
    isNavigate:false,
    sellerId: "", //分销商ID
    array:[],//包车车型列表
    index:5,//车型列表中选择的索引
    useCarWay:true ,//1拼车，0包车
    carTypeFlag:false , //控制车型选择列表是否可弹出
    cartypeindex:0  ,//
    carTypeFlagText:'请先选择航班号',
    baoCarArr:[]
  },
  // 禁止滑动切换tab
  stopTouchMove: function () {
    return false;
  },
  // 滚动切换标签样式
  switchTab: function (e) {
    // source 字段来判断是否是由于用户触摸引起
    if (e.detail.source == 'touch') {
      this.setData({
        currentTab: e.detail.current,
        useCarWay: true,
        carTypeFlag:false,
      });
    }
  },
  // 点击标题切换当前页时改变样式
  swichNav: function (e) {
    var cur = e.target.dataset.current;
    if (this.data.currentTaB == cur) {
      return false;
    }
    else {
      this.setData({
        currentTab: cur,
        useCarWay: true,
        carTypeFlag: false,
      })
    }
  },
  // 选择航班号
  chooseAirplan: function (e) {
    var that = this;
    var type = e.target.dataset.type;
    if(that.data.isNavigate){
      return;
    }
    that.setData({isNavigate:true})
      wx.navigateTo({
        url: '../airplanNum/airplanNum?type=' + type,
        success:()=>{
          that.setData({isNavigate:false})
        }
      })
  },
  chooseTrain:function(e){
    var that = this;
    var type = e.target.dataset.type;
    if (that.data.isNavigate) {
      return;
    }
    that.setData({ isNavigate: true })
    wx.navigateTo({
      url: '../trainNum/trainNum?type=' + type,
      success: () => {
        that.setData({ isNavigate: false })
      }
    })
  },
  // 选择目的地
  chooseArrival:function(e){
    var that = this;
    var type = e.target.dataset.type;
    if (that.data.isNavigate) {
      return;
    }
    that.setData({ isNavigate: true })
    wx.navigateTo({
      url: '../airplanArrival/airplanArrival?type=' + type,
      success: () => {
        that.setData({ isNavigate: false })
      }
    })
  },

  // 选择车型
  chanceCarType(e) {
    this.setData({
      index: e.detail.value
    })
  },
  // 若没选航班号提示
  carTypeFlag(){
    wx.showModal({
      title: '提示',
      showCancel:false,
      content: this.data.carTypeFlagText,
    })
  },
   // 用车方式
  chanceUseCarWay(e){
    var that = this;
    var cartypeindex = e.currentTarget.dataset.cartypeindex;
    if (e.currentTarget.dataset.usecarway == 'pingcar' && this.data.useCarWay == true){
      return
    }
    else if (e.currentTarget.dataset.usecarway == 'baocar' && this.data.useCarWay == false){
      return
    }
    else{
      this.setData({ useCarWay: !this.data.useCarWay });
      if (e.currentTarget.dataset.usecarway == 'baocar' && this.data.useCarDatemm != ''){
        this.setData({ array: []})
        var currentTab = this.data.currentTab;
        if (currentTab == 0 && this.data.isShow1){
          this.setData({ carTypeFlag: true });
          that.getList(currentTab, that.data.useCarDatemm);
          return;
        }
        else if (currentTab ==1 && this.data.isShow2){
          this.setData({ carTypeFlag: true });
          that.getList(currentTab,that.data.useCarDatemm);
          return;

        }
        else if (currentTab == 2 && this.data.isShow3) {
          this.setData({ carTypeFlag: true });
          that.getList(currentTab, that.data.useCarDatemm);
          return;
        }
        else if (currentTab == 3 && this.data.isShow4) {
          this.setData({ carTypeFlag: true });
          that.getList(currentTab, that.data.useCarDatemm);
          return;

        }
        else {
          this.setData({ carTypeFlag: false, carTypeFlagText: '请先选择航班号'});
          return;
        }
      }
      else if (this.data.useCarDatemm == '' && e.currentTarget.dataset.usecarway == 'baocar'){
        that.setData({ carTypeFlagText: '请先选择航班号', carTypeFlag: false})
        // that.carTypeFlag();
      }
    }
  },
// 获取包车车型列表
  getList(goodsType, willStartStamp){
    goodsType = parseInt(goodsType) + 1;
    var that = this;
    http.request({
      url: config.jsHost + '/app/v1.0/goods/goods-select',
      data: {
        goodsType: goodsType,
        willStartStamp: willStartStamp
      },
      success: function (res) {
        var data = res.data.data
        var arrList = [];
        if (res.data.code == 200) {
          for (var i in data) {
            arrList.push(data[i].goodsName);
          }
          that.setData({ array: arrList, baoCarArr:data});
        }
        else {
          that.setData({ carTypeFlag: false, carTypeFlagText: res.data.msg })
          that.carTypeFlag();
          return;
        }
      }
    })
  },
  // 飞机预约
  fightOrderInfoPage:function(e){
    var that = this;
    var index = that.data.index;
    if (e.target.dataset.place == '' || e.target.dataset.flight==''){
      if (e.target.dataset.ordertype == 1) {
        var textMsg = '请输入航班号和目的地'
      }
      else {
        textMsg = '请输入航班号和出发地'
      }
      wx.showModal({
        content: textMsg,
        showCancel:false,
      });
      return;
    }
    // 如果选择了包车，没选车型，弹出提示
    else if (that.data.useCarWay == 0 && that.data.array[index] == undefined) {
      wx.showModal({
        content: '请选择车型',
        showCancel: false,
      });
      return;
    }
    else{
      if (that.data.isNavigate) {
        return;
      }
      that.setData({ isNavigate: true })
      var orderData={};
      orderData.end = e.target.dataset.place;   //首页输入的地点
      orderData.start = that.data.endInfo;      //航班查询时默认的地址
      var baoid = '';
      var baoprice = 0;
    //  false包车
      if (that.data.useCarWay == false) {
        for (var i in that.data.baoCarArr) {
          if (that.data.baoCarArr[i].goodsName == that.data.array[that.data.index]) {
            baoid = that.data.baoCarArr[i].id;
            baoprice = that.data.baoCarArr[i].price;
          }
        }
        that.setData({
          id: baoid,
          price: baoprice,
        })
      }
      else{
        // 当前时间
        var currentDay = utils.getAfterDayDate(new Date(),0);
        currentDay = new Date(currentDay).getTime();
        // 预计用车时间
        var useCarDatemm = new Date(this.data.useCarDate).getTime();
        // 如果下当天的单，并选择拼车提示无法下单
        if (useCarDatemm == currentDay){
          wx.showModal({
            title: '提示',
            showCancel:false,
            content: '暂不支持当日拼车服务',
            success(){
              that.setData({ isNavigate: false })
            }
          });
          return;
        }
        that.setData({
          id: that.data.endInfo.id,
          price: that.data.endInfo.price
        })
      }
      // 业务类型
      orderData.type = that.data.type;
      // 航班号
      orderData.flightNum = e.target.dataset.flight;
      // 航班日期
      orderData.flightDate = that.data.flightDate;
      // 航班起飞时间
      orderData.flightStartTime = that.data.flightStartTime;
      // 航班到达时间
      orderData.flightEndTime = that.data.flightEndTime;
      orderData.flightArrTime = that.data.flightArrTime;
      orderData.useCarTime = that.data.useCarTime;
      orderData.useCarDate = that.data.useCarDate;
      orderData.flightDepTime = that.data.flightDepTime;

      // 用车方式
      orderData.useCarWay = that.data.useCarWay;
      orderData.useCarType = that.data.array[that.data.index];
   
      that.setData({
        orderInfo: orderData
      })
      wx.navigateTo({
        url: '../fightOrderInfo/fightOrderInfo',
        success: () => {
          that.setData({ isNavigate: false })
        }
      })
    }
  },
  // 火车预约
  trainOrderInfoPage: function (e) {
    var that = this;
    var index = that.data.index;
    if (e.target.dataset.place == '' || e.target.dataset.flight == '') {
      if (e.target.dataset.ordertype == 3) {
        var textMsg = '请输入班次和目的地'
      }
      else{
        textMsg = '请输入班次号和出发地'
      }
      wx.showModal({
        content: textMsg,
        showCancel: false,
      })
    }
    // 如果选择了包车，没选车型，弹出提示
    else if (that.data.useCarWay == 0 && that.data.array[index] == undefined) {
      wx.showModal({
        content: '请选择车型',
        showCancel: false,
      });
      return;
    }
    else {
      if (that.data.isNavigate) {
        return;
      }
      that.setData({ isNavigate: true })
      var orderData = {};
      orderData.end = e.target.dataset.place;   //首页输入的地点
      orderData.start = this.data.endInfo;      //航班查询时默认的地址
      // 业务类型
      orderData.type = this.data.type;
      // 航班号
      orderData.flightNum = e.target.dataset.flight;
      // 航班日期
      orderData.flightDate = this.data.flightDate;
      // 航班起飞时间
      orderData.flightStartTime = this.data.flightStartTime;
      // 航班到达时间
      orderData.flightEndTime = this.data.flightEndTime;
      orderData.flightArrTime = this.data.flightArrTime;
      orderData.useCarTime = this.data.useCarTime;
      orderData.useCarDate = this.data.useCarDate;

      // 用车方式
      orderData.useCarWay = that.data.useCarWay;
      orderData.useCarType = that.data.array[that.data.index];
      var baoid = '';
      var baoprice = 0;
      //  false包车,包车获取车型列表的价格
      if (that.data.useCarWay == false) {
        for (var i in that.data.baoCarArr) {
          if (that.data.baoCarArr[i].goodsName == that.data.array[that.data.index]) {
            baoid = that.data.baoCarArr[i].id;
            baoprice = that.data.baoCarArr[i].price;
          }
        }
        that.setData({
          id: baoid,
          price: baoprice,
        })
      }
      else {
        // 当前时间
        var currentDay = utils.getAfterDayDate(new Date(), 0);
        currentDay = new Date(currentDay).getTime();
        // 预计用车时间
        var useCarDatemm = new Date(this.data.useCarDate).getTime();
        // 如果下当天的单，并选择拼车提示无法下单
        if (useCarDatemm == currentDay) {
          wx.showModal({
            title: '提示',
            showCancel: false,
            content: '暂不支持当日拼车服务',
            success() {
              that.setData({ isNavigate: false })
            }
          });
          return;
        }
        that.setData({
          id: that.data.endInfo.id,
          price: that.data.endInfo.price
        })
      }
      this.setData({
        orderInfo: orderData
      })
      wx.hideLoading()
      wx.navigateTo({
        url: '../fightOrderInfo/fightOrderInfo',
        success: () => {
          that.setData({ isNavigate: false })
        }
      })
    }
  },
  onShow: function () {
    this.setData({
      carTypeFlag: false,
      useCarWay: true,
    })
  },
  onLoad: function (options) {
    var that = this;
    //如果包含分享商ID，保存
    if( options.q != undefined){
      var currentTime = new Date().getTime();
      var url = decodeURIComponent(options.q)
      var sellerId = utils.getUrlParam("sellerId", url);
      var sourceId = utils.getUrlParam("sourceId", url);
      
      wx.setStorageSync("sellerId", sellerId);
      wx.setStorageSync('currentTime', currentTime);
      if (sourceId != "") {
        wx.setStorageSync('sourceId', sourceId);
      }
    } 
    else{
      var sellerId = options.sellerId;
      var sourceId = options.sourceId;
      if (sourceId != "") {
        wx.setStorageSync('sourceId', sourceId);
      }
      if (sellerId != undefined){
        var currentTime = new Date().getTime();
        wx.setStorageSync("sellerId", sellerId);
        wx.setStorageSync('currentTime', currentTime);

      }
    }
    
    //  高度自适应
    wx.getSystemInfo({
      success: function (res) {
        var clientHeight = res.windowHeight;
        that.setData({
          winHeight: clientHeight
        });
      }
    });
  },
  // footerTap: app.footerTap
})
