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
    orderList: [],
    pageNum: 1, //第几页
    pageSize: 10, //一页显示几条数据
    hasMore: true,
    flightList:[],  //数据列表
    dateValue:'', //选择的日期
    dateValue2:'',
    startDate: '',  //日期选择限制
    endDate: '',
    balance: 0,  //总额
    createTime: [], 
    createDate: [],
    amount: [],
    isShow: false,
  },
  //加载更多订单
  loadMore: function () {
    var that = this;
    if (that.data.hasMore) {
      wx.showLoading({
        title: '正在加载',
      })
    }
    // 获取提现记录列表 
    http.request({
      url: config.jsHost + '/app/v1.0/artemis/withdrawal/list',
      data: {
        startTime: that.data.dateValue,
        endTime: that.data.dateValue2,
        pageNum: that.data.pageNum,
        pageSize: that.data.pageSize
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
            flightList: that.data.flightList,
            balance: utils.change(data.balance),
            pageNum: that.data.pageNum,
            createTime: [],
            createDate: [],
            amount:[]
          })
          //转换日期时间
          for (let i in that.data.flightList) {
            // 分转元
            that.data.amount[i] = utils.change(that.data.flightList[i].amount);

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
            amount: that.data.amount,
            flightList: that.data.flightList,
            createTime: that.data.createTime,
            createDate: that.data.createDate
          })
        }
        else {
          // 显示没有更多内容了
          that.setData({ hasMore: false, isShow: true, balance: 0})

        }

      }
    })
  },

  bindDateChange: function (e) {
    this.setData({ dateValue: e.detail.value, flightList: [], pageNum: 1})
    this.loadMore()
  },
  bindDate2Change: function (e) {
    this.setData({ dateValue2: e.detail.value, flightList: [], pageNum: 1 })
    this.loadMore()
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var today = utils.formatDate(new Date())
    this.setData({
      endDate: today,
      dateValue: today,
      dateValue2: today,
    }) 
    this.loadMore()

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
    this.setData({
      currentSize: 1,
      orderList: [],
    })
      that.loadMore()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    var that = this;
    if (that.data.hasMore) {
      that.loadMore()
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})