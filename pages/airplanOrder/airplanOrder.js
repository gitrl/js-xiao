var app = getApp();
import http from '../../libs/http.js';
var utils = require('../../utils/util.js');
var config = require("../../libs/config.js");
var QR = require('../../libs/qrcode.js');
var thisItv;
Page({
  data: {
    winHeight: "",//窗口高度
    currentTab: 0, //预设当前项的值
    scrollLeft: 0, //tab标题的滚动条位置
    orderList: [],  //订单列表
    hasMore: true,
    currentSize:1,  //当前页
    countDownList: [], //倒计时
    willStartDate:[],    //预计上车日期
    willStartTime: [] ,   //s
    pageSize:10,   //一页显示多少条数据
    // thisItv:"" , //定时器名字
    isNavigate: false,
    canvasHidden:false,
    imagePath: '',
    isShowCode:false
  },
  // 点击标题切换当前页时改变样式
  swichNav: function (e) {
    var that = this;
    var cur = e.target.dataset.current;
    if (this.data.currentTab == cur) { 
        return; 
      }
    else {
      this.clearCountDown()
      this.setData({ currentTab:cur, currentSize: 1, orderList:[]})
      this.loadMore()
    }
  },
  stopTouchMove: function () {
    return false;
  },
  
  onLoad: function () {
    var that = this;
    //  高度自适应
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          winHeight: res.windowHeight,
        });
      }
    });

  },
// 点击我的二维码
  tapHandler: function (e) {
    var that = this;
    var initUrl = e.currentTarget.dataset.qrcode;
    if (initUrl == ''){
      return
    }
    else{
      var size = this.setCanvasSize();//动态设置画布大小
      setTimeout(() => {
        that.createQrCode(initUrl, "canvas", size.w, size.h);
      }, 500);
      this.setData({ isShowCode: true });
    }
  },
  closeErweiCode:function(){
    this.setData({ isShowCode: false })
  },
  createQrCode: function(url, canvasId, cavW, cavH) {
    //调用插件中的draw方法，绘制二维码图片
    QR.api.draw(url, canvasId, cavW, cavH);
  },
  //适配不同屏幕大小的canvas
  setCanvasSize: function () {
    var size = {};
    try {
      var res = wx.getSystemInfoSync();
      var scale = 750 / 350;
      var width = res.windowWidth / scale;
      var height = width; //canvas画布为正方形
      size.w = width;
      size.h = height;
    } catch (e) {
      // Do something when catch error
      console.log("获取设备信息失败" + e);
    }
    return size;
  },
  // 转换时间
  getTime(time) {
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
  // 加载更多
  loadMore: function (orderStatus){
    var that = this;
    this.clearCountDown()
    if (that.data.hasMore){
      wx.showLoading({
        title: '正在加载',
      })
    }
    // 订单状态 1，待支付 2，已支付 3，已完成 4，退款中 5、已取消,
    http.request({
      url: config.jsHost +'/app/v1.0/order/list',
      method: 'POST',
      data: {
        "orderStatus": this.data.currentTab,
        "pageNumber": this.data.currentSize,
        "pageSize": this.data.pageSize
      },
      success(res) {
        wx.hideLoading()
        wx.stopPullDownRefresh();
        var willStart = [];
        if (res.data.code == 200 && res.data.data.orderList.length >0){
          // if (res.data.code == 200 && res.data.data.length == undefined) {

          // 若返回的数据小于pageSize则显示“没有更多数据了”
            if (res.data.data.orderList.length < this.data.pageSize) {
              that.setData({ hasMore: false})
            }
            // 每次调用追加数据到数组，
            that.data.orderList.push(...res.data.data.orderList);
            // 页码加一
            that.data.currentSize += 1
            // 清空预计日期和时间数据(切换tab的时候先清空再存新的对应的数据)
            that.setData({
              orderList: that.data.orderList,
              currentSize: that.data.currentSize,
              willStartDate: [],
              willStartTime: []
            })
            // 调用倒计时
            that.countDown(that.data.orderList);
            // 循环每个订单的下单时间
          for (let i in that.data.orderList) {
            // 转换日期
            var willStartDate = utils.getAfterDayDate(new Date(parseInt(that.data.orderList[i].willStartTime)), 0);
            that.data.willStartDate[i] = willStartDate;
            // var willStartDate = new Date(parseInt(that.data.orderList[i].willStartTime)).toLocaleDateString();
            // that.data.willStartDate[i] = willStartDate.replace(/\//g, '-');
            // 转换时间
            that.data.willStartTime[i] = that.getTime(parseInt(that.data.orderList[i].willStartTime));
          }
          that.setData({
            willStartDate: that.data.willStartDate,
            willStartTime: that.data.willStartTime
          })
        } 
        else {
          // 显示没有更多内容了
          that.setData({hasMore: false})
          if (res.data.code != 200 && res.data.code !=10000){
            wx.showModal({
              title: '提示',
              showCancel:false,
              content: res.data.msg,
            })
          }
        }      
      }
    })
  },
  // 清除定时器
  clearCountDown:function(){
    // 清理定时器thisIv
    clearTimeout(thisItv);
  },
  //30分钟倒计时
  countDown:function (orderArry){
    var that = this;
    thisItv = setTimeout(function () {
      //1800=30*60 当前时间减去系统时间除以1000 就是指用掉的时间是多少秒
      for (let index in orderArry) {
        //如果为待支付订单
        if (orderArry[index].orderStatus == 1) {
          let startTime = Math.floor(1800 - ((new Date().getTime() - orderArry[index].createTime) / 1000));
          if (startTime <= 0) {
            that.data.countDownList[index] = '';
            that.data.orderList[index].orderStatus = 5
            that.setData({
              countDownList: that.data.countDownList,
              orderList: that.data.orderList
            })
            break;
          }
          // else{
            let mm = Math.floor(startTime / 60);
            let ss = Math.floor(startTime % 60);
            if (mm < 10) {
              mm = '0' + mm;
            }
            if (ss < 10) {
              ss = '0' + ss;
            }
            if (startTime > 0) {
              var countDown = "00:" + mm + ":" + ss
              that.data.countDownList[index] = countDown;
              that.setData({
                countDownList: that.data.countDownList
              })
              startTime--;
            }
          // }
        }
        //其他类型订单不需要倒计时
        else {
          that.data.countDownList[index] = '';
          that.setData({
            countDownList: that.data.countDownList
          })
        }
      }
      clearTimeout(thisItv);
      that.countDown(orderArry)
    }, 995)
  },
  // 点击去付款
  slidToPorder:function(e){
    var that = this;
    var orderId = e.currentTarget.dataset.orderid;
    var orderstatus = e.currentTarget.dataset.orderstatus;
    if (that.data.isNavigate) {
      return;
    }
    that.setData({ isNavigate: true })
    if (orderstatus == 1){
      wx.navigateTo({
        url: '../payOrder/payOrder?orderId=' + orderId,
        success: () => {
          that.setData({ isNavigate: false })
        }
      })
    }
    else{
      return;
    }
   
  },
  //执行取消
  makeCancel: function (orderId){
    var that = this;
    http.request({
      url: config.jsHost +'/app/v1.0/order/cancel',
      method: 'POST',
      data: {
        orderId: orderId,
        cancelReason: ''
      },
      success(res) {
        console.log(res)
        that.setData({
          currentSize: 1,
          orderList:[],
        })
        that.loadMore();
        // for (let i in that.data.orderList) {
        //   if (that.data.orderList[i].orderId == orderId) {
        //     that.data.orderList[i].orderStatus = 4;
        //     that.setData({
        //       orderList: that.data.orderList
        //     })
        //   }
        // }
      }
    })
  },
  // 取消订单
  cancelOrder:function(e){
    var that = this;
    var orderId = e.currentTarget.dataset.orderid;
    http.request({
      url: config.jsHost +'/app/v1.0/order/cancel/check',
      data: {
        orderId: orderId
      },
      success(res) {
        if(res.data && res.data.code == 200){
          wx:wx.showModal({
            title: '提示',
            content: res.data.msg ,
            showCancel: true,
            success: function(res) {
              if(res.confirm){
                // 点击确定取消订单
                that.makeCancel(orderId)
              }
            },
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
    
  },
  /**
  * 生命周期函数--监听页面显示
  */
  onShow: function () {
    // if (wx.getStorageSync('token') != '' && wx.getStorageSync('token') != undefined){
      this.setData({ currentSize: 1, orderList: [] });
      //用onShow周期方法重新加载，实现当前页面的刷新
      this.loadMore();
    // }
    // else{
    //   wx.navigateTo({
    //     url: '/pages/reg/reg'
    //   })
    // }
  },
  /**
  * 生命周期函数--监听页面卸载
  */
  onUnload: function () {
    this.clearCountDown()
  },
  /**
    * 生命周期函数--监听页面隐藏
    */
  onHide: function () {
    this.clearCountDown()
  },

  footerTap: app.footerTap
})