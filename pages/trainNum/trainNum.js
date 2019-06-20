var app = getApp();
var utils = require('../../utils/util.js');
var config = require("../../libs/config.js");
import http from '../../libs/http.js';
const date = new Date();
const years = [];
const months = [];
const days = [];

const years2 = [];
const months2 = [];
const days2 = [];
const hours = [];
const minutes = [];
var currentDate = utils.getAfterDayDate(new Date(), 0);
var currentYear = parseInt(currentDate.split('-')[0]) 
var currentmonths = parseInt(currentDate.split('-')[1]);
var currentdays = parseInt(currentDate.split('-')[2]) ;

//获取年
for (let i = currentYear - 1; i <= date.getFullYear() +10; i++) {
  years.push("" + i );
}
//获取年
for (let i = currentYear; i <= date.getFullYear() + 10; i++) {
  years2.push("" + i);
}
//获取月份
for (let i = 1; i <= 12; i++) {
  if (i < 10) {
    i = "0" + i;
  }
  months.push("" + i );
}
//获取到达月份
for (let i = 1; i <= 12; i++) {
  if (i < 10) {
    i = "0" + i;
  }
  months2.push("" + i);
}
//获取日期
for (let i = 1; i <= 31; i++) {
  if (i < 10) {
    i = "0" + i;
  }
  days2.push("" + i );
}
//获取日期
for (let i = 1; i <= 31; i++) {
  if (i < 10) {
    i = "0" + i;
  }
  days.push("" + i);
}
//获取小时
for (let i = 0; i < 24; i++) {
  if (i < 10) {
    i = "0" + i;
  }
  hours.push("" + i );
}
//获取分钟
for (let i = 0; i < 60; i++) {
  if (i < 10) {
    i = "0" + i;
  }
  minutes.push("" + i);
}

/*接站，送站选择车次号页面没有按出发地目的地查询，此页面不显示默认地址，应该在首页设置默认地址，
但因跟接机，送机业务一样，在此还是在选择车次页面请求默认地址接口，数据还是保存在 start: end: ,中
*/
Page({
  data: {
    winHeight: "",//窗口高度
    airplanNum:'',  //选择航班号
    startDate:'', //选择日期是限制只能选择当天及当天之后
    type:'', //业务类型
    token:'', //登录态标识
    changeDate: false,  //date0 data2字体颜色判断
    time: '',   //接站选择的开始日期时间
    time2:'',   //接站选择的结束日期时间
    detailTime: '',  //接站选择的具体的出发时间点
    detailTime2: '', //接站选择的具体的到达时间点
    date2:'请选择到达时间',   //接站选择的到达日期
    date0: '请选择出发时间',//接站选择的出发日期
    options:{}, //上个页面传过来的参数
    date:'',  //送机选择的日期
    start: '', //按出发地目的地时，出发地
    end: '',   //按出发地目的地时，目的地
    multiArray: [years, months, days, hours, minutes],
    multiArray2: [years2, months2, days2, hours, minutes],
    multiIndex2: [0, currentmonths - 1, currentdays ,15, 4],
    multiIndex: [1, currentmonths - 1, currentdays - 1, 10, 4],
    choose_year: '',
    showTime: true,  //接站显示选择出发时间和到达时间，送站显示查询日期
    endDate:''    //最多90天
  },
   // 送站选择的日期
  bindDateChange: function (e) {
    this.setData({
      date: e.detail.value
    })
  },

  // 输入航班号保存值
  airplanNum: function (e) {
    this.setData({
      airplanNum: e.detail.value
    })
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

/*
  setIndex:并请求预计用车时间接口，设置首页车次号，车次到达或者出发日期时间，预计用车时间
 */
 // 类型，出发时间（毫秒），到达时间（毫秒），到达(出发)日期，到达时间
  setIndex: function (type, shiftStartTime, shiftEndTime, flightArrdate, flightArrTime){
    var that = this;
    // var formatTimeS = new Date(this.data.date).getTime()
    var flight = this.data.airplanNum;
    // 获取当前页
    var pages = getCurrentPages();
    var currPage = pages[pages.length - 1];  //当前页面
    var prevPage = pages[pages.length - 2]; //上一个页面
    // 请求预计用车时间
    http.request({
      url: config.jsHost +'/app/v1.0/get-estimate-time',
    data: {
      orderType: type,  //业务类型
      shiftStartTime: shiftStartTime, //出发时间
      shiftEndTime: shiftEndTime    //到达时间
    },
    success: function (res) {
      wx.hideLoading()
      // 计划用车时间
      var useCarTime = parseInt(res.data.data.willStartTime);
      useCarTime = that.getTime(useCarTime);
      var useCarDate = utils.getAfterDayDate(new Date(parseInt(res.data.data.willStartTime)), 0)
      var useCarDatemm = res.data.data.willStartTime;
      if (type == 3) {
        prevPage.setData({
          isShow3: true,
          isShow2: false,
          isShow1: false,
          isShow4: false,
          trainNum2:"",
          airplanNum2: '',
          airplanNum: '',
          trainNum: flight,
          endInfo: that.data.end
        })
      }
      else if (type == 4) {
        prevPage.setData({
          isShow4: true,
          isShow3: false,
          isShow2: false,
          isShow1: false,
          trainNum: "",
          airplanNum2: '',
          airplanNum: '',
          trainNum2: flight,
          endInfo: that.data.start
        })
      }
      prevPage.setData({
        flightDate: flightArrdate,//航班起飞时间,转换后的时间
        flightArrTime: flightArrTime, //航班到达时间,转换后的时间
        flightStartTime: shiftStartTime, //航班起飞时间，毫秒
        flightEndTime: shiftEndTime,   //航班到达时间，毫秒
        useCarTime: useCarTime,   //预计用车时间
        useCarDate: useCarDate,
        useCarDatemm: useCarDatemm,
        type: type,
      })
      wx.navigateBack();
    }
  })
},
  // 按航班号点击查询 验证表单
  // 1.点击确定按钮，判断是接站业务还是送站业务，
  // 2.判断对应表单是否有值
  // 3.无值弹出提示框，有值调用setIndex方法
  searchFlightNum(e){
    var that = this;
    // 获取当前业务类型
    var type = that.data.type;
    // 接站
    if (e.target.dataset.type == 3){
      // 判断表单是否为空
      if (this.data.airplanNum == '' || this.data.time2 == '' || this.data.time == '') {
        wx.showModal({
          content: '请输入班次号和班次时间',
          showCancel: false,
          success(res) {
          }
        })
      }
      else{
        wx.showLoading({
          title: '查询中',
          mask: true
        })
        // 接站具体到达时间
        var flightArrTime = that.data.detailTime2;
        // 接站到达日期
        var flightArrdate = that.data.date2;
         //接站选择的开始日期时间
        //接站选择的结束日期时间
        var time = (that.data.time).replace(/-/g, '/');
        //接站选择的结束日期时间
        var time2 = (that.data.time2).replace(/-/g, '/');
        var shiftStartTime = new Date(time).getTime();
        var shiftEndTime = new Date(time2).getTime();
        //  // 类型，出发时间（毫秒），到达时间（毫秒），到达日期，到达时间
        that.setIndex(type, shiftStartTime, shiftEndTime, flightArrdate, flightArrTime)
      }
    }
    else if(e.target.dataset.type == 4){
      var date = this.data.date;
      date = new Date(date).getTime();
      if (this.data.airplanNum == '' || this.data.date== '') {
        wx.showModal({
          content: '请输入班次号和班次时间',
          showCancel: false,
          success(res) {
          }
        })
      }
      else{
        wx.showLoading({
          title: '查询中',
          mask: true
        })
        // 按航班号点击查询 
        http.request({
          url: config.jsHost + '/app/v1.0/flight/getByFlightNo',
          data: {
            flightNo: this.data.airplanNum,
            date: date,
            goodsType: e.target.dataset.type,
          },
          success(res) {
            if (res.data.code == 200) {
              let data = res.data.data;
              // 转换日期时间
              var depTime = that.getTime(data[0].depTime);
              var depDate = utils.getAfterDayDate(new Date(data[0].depTime), 0);
              
              // 类型，出发时间（毫秒），到达时间（毫秒），出发日期，出发时间
              that.setIndex(type, data[0].depTime, data[0].arrTime, depDate, depTime)
            } 
            else{
              wx.hideLoading()
              wx.showModal({
                title: '提示',
                content: res.data.msg,
              })
            }
          }
        })
      }
    }
  },
  // 获取默认地址
  getAddress(options){
    var that = this;
    http.request({
      url: config.jsHost +'/app/v1.0/goods/buy',
      success(res) {
        var data = res.data.data;
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
  onLoad: function (options) {
    var that = this;
    var type = options.type;
     type = (type == 'takeAir' ? 1 :
     (type == 'sendAir' ? 2 : 
     (type == 'takeTrain' ? 3 :
     (type == 'sendTrain' ? 4 : ''))));
    // 获取今天之后的日期
    var currentDate = utils.getAfterDayDate(new Date(), 0);
    var endDate = utils.getAfterDayDate(new Date(), 90);
    this.setData({
      startDate: currentDate,
      endDate: endDate,
      type: type,
      options: options,
      choose_year: this.data.multiArray[0][0] //设置默认的年份
    })
    // 如果是送站只选出发日期
    if (type ==4){
      this.setData({
        showTime:false
      })
    }
    if (type == 3){
      this.setData({
        showTime: true
      })
    }
    
  
  },
  /**
* 生命周期函数--监听页面显示
*/
  onShow: function () {
    var options = this.data.options
    // 获取默认地址
    this.getAddress(options)
  },
  //获取时间日期
  bindMultiPickerChange: function (e) {
    this.setData({
      multiIndex: e.detail.value,
      changeDate:true
    })
    const index = this.data.multiIndex;
    const year = this.data.multiArray[0][index[0]];
    const month = this.data.multiArray[1][index[1]];
    const day = this.data.multiArray[2][index[2]];
    const hour = this.data.multiArray[3][index[3]];
    const minute = this.data.multiArray[4][index[4]];
    var time = year + '-' + month + '-' + day + ' ' + hour + ':' + minute;
    var willDate = utils.getAfterDayDate(new Date(), 90);
    willDate = new Date(willDate).getTime();
    var chooseDate = new Date(time.replace(/-/g, '/')).getTime();
    if (chooseDate > willDate) {
      wx.showModal({
        title: '提示',
        content: '最多选择未来90天的额日期',
        showCancel: false,
      })
      return
    }
    this.setData({
      time: time,
      detailTime: hour + ':' + minute,
      date0: year + '-' + month + '-' + day 
    })
  },
  //获取时间日期
  bindMultiPickerChange2: function (e) {
  
    this.setData({
      multiIndex: e.detail.value,
      changeDate: true
    })
    const index = this.data.multiIndex;
    const year2 = this.data.multiArray2[0][index[0]];
    const month2 = this.data.multiArray2[1][index[1]];
    const day2 = this.data.multiArray2[2][index[2]];
    const hour = this.data.multiArray[3][index[3]];
    const minute = this.data.multiArray[4][index[4]];
    var time2 = year2 + '-' + month2 + '-' + day2 + ' ' + hour + ':' + minute;
    var dateArr = year2 + '-' + month2 + '-' + day2 ;
    // 未来90天
    var willDate = utils.getAfterDayDate(new Date(), 90);
    willDate = new Date(willDate).getTime();
    currentDate = new Date(currentDate).getTime();
    // 选择的日期
    var chooseDate = new Date(dateArr).getTime();

    if (chooseDate > willDate) {
      wx.showModal({
        title: '提示',
        content: '最多选择未来90天的日期',
        showCancel: false,
      })
      return
    }
    else if (chooseDate < currentDate){
      wx.showModal({
        title: '提示',
        content: '到达日期不能选择今天之前',
        showCancel: false,
      })
      return
    }

    this.setData({
      time2: time2,
      detailTime2: hour + ':' + minute,
      date2: dateArr
    })
  },
  //监听picker的滚动事件
  bindMultiPickerColumnChange: function (e) {
    //获取年份
    if (e.detail.column == 0) {
      let choose_year = this.data.multiArray[e.detail.column][e.detail.value];
      this.setData({
        choose_year: choose_year
      })
    }
    // console.log('修改的列为', e.detail.column, '，值为', e.detail.value);
    if (e.detail.column == 1) {
      let num = parseInt(this.data.multiArray[e.detail.column][e.detail.value]);
      let temp = [];
      if (num == 1 || num == 3 || num == 5 || num == 7 || num == 8 || num == 10 || num == 12) { //判断31天的月份
        for (let i = 1; i <= 31; i++) {
          if (i < 10) {
            i = "0" + i;
          }
          temp.push("" + i );
        }
        this.setData({
          ['multiArray[2]']: temp
        });
      } else if (num == 4 || num == 6 || num == 9 || num == 11) { //判断30天的月份
        for (let i = 1; i <= 30; i++) {
          if (i < 10) {
            i = "0" + i;
          }
          temp.push("" + i );
        }
        this.setData({
          ['multiArray[2]']: temp
        });
      } else if (num == 2) { //判断2月份天数
        let year = parseInt(this.data.choose_year);
        if (((year % 400 == 0) || (year % 100 != 0)) && (year % 4 == 0)) {
          for (let i = 1; i <= 29; i++) {
            if (i < 10) {
              i = "0" + i;
            }
            temp.push("" + i );
          }
          this.setData({
            ['multiArray[2]']: temp
          });
        } else {
          for (let i = 1; i <= 28; i++) {
            if (i < 10) {
              i = "0" + i;
            }
            temp.push("" + i );
          }
          this.setData({
            ['multiArray[2]']: temp
          });
        }
      }
    }
    var data = {
      multiArray: this.data.multiArray,
      multiIndex: this.data.multiIndex
    };
    data.multiIndex[e.detail.column] = e.detail.value;
    this.setData(data);
  }
})