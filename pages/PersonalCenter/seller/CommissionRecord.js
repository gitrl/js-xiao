//佣金明细
import http from '../../../libs/http.js';
var utils = require('../../../utils/util.js');
var config = require('../../../libs/config');
var app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    pageNum: 1, //第几页
    pageSize:10, //一页显示几条数据
    hasMore: true,
    currentTab:1,   //1待结算 ，2已结算
    flightList:[],  //数据列表
    balance:0,  //总额
    createTime:[],
    createDate:[],
    orderAmount: [],  //列表中显示的订单金额
    resellerAmount: [],
    endDate:'', //选择的时间段
    startDate:'',
    selectTime:0,
    selectArray: [{
      "id": "0",
      "text": "本月"
    }, {
      "id": "1",
      "text": "上月"
      }, {
        "id": "2",
        "text": "近三月"
      }, {
        "id": "3",
        "text": "近半年"
      }],
    isShow:false
  },
  
  // 点击标题切换当前页时改变样式
  swichNav: function (e) {
    var cur = e.target.dataset.current;
    if (this.data.currentTaB == cur) {
      return false;
    }
    else {
      this.setData({ currentTab: cur, pageNum: 1, flightList: [] })
      this.getCommissiondList()
    }
  },
  // 获取佣金明细列表数据
  getCommissiondList:function(){
    var that = this;
    if (that.data.hasMore) {
      wx.showLoading({
        title: '正在加载',
      })
    }
    http.request({
      url: config.jsHost + '/app/v1.0/artemis/settle/list',
      data: {
        startTime: that.data.startDate,
        endTime: that.data.endDate,
        pageNum: that.data.pageNum,
        pageSize: that.data.pageSize,
        status: that.data.currentTab
      },
      success(res) {
        wx.hideLoading()
        var data = res.data.data;
        if (res.data.code == 200 && data.total > 0) {
          that.setData({ isShow: false })
          // 若返回的数据小于pageSize则显示“没有更多数据了”
          if (data.total < that.data.pageSize || data.rows.length < that.data.pageSize) {
            that.setData({ hasMore: false })
          }
          else {
            that.setData({ hasMore: true })
          }
          that.data.flightList.push(...data.rows)
          // 页码加一
          that.data.pageNum += 1;
          that.setData({
            createTime: [],
            createDate:[],
            orderAmount:[],
            resellerAmount:[]
          })
          //转换日期时间
          for (let i in that.data.flightList) {
            // 分转元
            that.data.orderAmount[i] = utils.change(that.data.flightList[i].orderAmount);
            that.data.resellerAmount[i] = utils.change(that.data.flightList[i].resellerAmount);

            var createTime = that.data.flightList[i].createTime;
            // 获取时间
            that.data.createTime[i] = utils.getTime(createTime)
            // 获取日期
            var createDate = utils.getAfterDayDate(new Date(parseInt(createTime)), 0)
            var arr = createDate.split('-');
            var month = arr[1]; //获取月份
            var day = arr[2]; //获取日期
            createDate = month + '-' + day;
            that.data.createDate[i] = createDate;
          }
          that.setData({
            orderAmount: that.data.orderAmount,
            resellerAmount: that.data.resellerAmount,
            flightList: that.data.flightList,
            createTime: that.data.createTime,
            createDate: that.data.createDate,
            balance: utils.change(data.balance),
            pageNum: that.data.pageNum,
          })
        }
        else {
          // 显示没有更多内容了
          that.setData({ hasMore: false, isShow: true, balance:0})
        }

      }
    })
  },
  // 选择时间
  getDate: function (e) {
    var that = this;
    var value = e.detail.id;
    that.setData({selectTime: value})
    // 开始日期，结束日期，传时间段
    var startDate ='';
    var endDate ='';
    // 判断选择的什么时间段
    switch (that.data.selectTime) {
      case 0:
      // 本月
        var today = utils.formatDate(new Date());
        var arr = today.split('-');
        var year = arr[0]; //获取当前日期的年份
        var month = arr[1]; //获取当前日期的月份
        startDate = year + '-' + month + '-' + '01';
        endDate = today
        
        break;
      case 1:
      // 获取上月的年月
        var lastDate = utils.getPreMonth(utils.formatDate(new Date()))
      // 获取上月总共天数
        var dayNum = utils.getMonthDayCount(lastDate)
        startDate = lastDate + '-' + '01';
        endDate = lastDate + '-' + dayNum
        
        break;
      case 2:
      // 近三月
        var lastDate='';
        var today = utils.formatDate(new Date())
        for(var i=0; i<2;i++){
          lastDate = utils.getPreMonth(today);
          today = lastDate;
        }
        // 获取上月总共天数
        var dayNum = utils.getMonthDayCount(lastDate)
        startDate = lastDate + '-' + '01';
        endDate = utils.formatDate(new Date());
        break;
      case 3:
      // 近半年
        var lastDate = '';
        var today = utils.formatDate(new Date())
        for (var i = 0; i < 5; i++) {
          lastDate = utils.getPreMonth(today);
          today = lastDate;
        }
        // 获取上月总共天数
        var dayNum = utils.getMonthDayCount(lastDate)
        startDate = lastDate + '-' + '01';
        endDate = utils.formatDate(new Date());
        break;
    }
    that.setData({
      flightList: [],
       pageNum: 1,
       startDate: startDate, 
       endDate: endDate
    })
      that.getCommissiondList()
   
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 默认本月
    var today = utils.formatDate(new Date());
    var arr = today.split('-');
    var year = arr[0]; //获取当前日期的年份
    var month = arr[1]; //获取当前日期的月份
    var startDate = year + '-' + month + '-' + '01';
    var endDate = today;
    this.setData({
      startDate: startDate,
      endDate: endDate
    })
    this.getCommissiondList()
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
    var that= this;
    this.getCommissiondList()
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})