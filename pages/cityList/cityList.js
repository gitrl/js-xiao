import qqmap from '../../libs/map.js';//这里的路径看你自己的文件路径
// var cityData = require('../../libs/data.js');  //引入
import http from '../../libs/http.js';
var config = require("../../libs/config.js");

Page({
  data: {
    //下面是字母排序
    letter: [],
    cityListId: '',
    //下面是城市列表信息
    citylist: [],
    locateCity: '',
    show: false,
    tips: {}, 
    toWhere:'',
    //下面是热门城市数据
    hotCity:[],
    isanimotion:false,
    failLocation: '正在定位...',
  },
  /**
    * 生命周期函数--监听页面加载
    */
  onLoad: function (options) {
    wx.showNavigationBarLoading();
    var that= this;
    that.getCityList();
    that.setData({
      toWhere: options.target
    });
    // 动态设置标题
    if (options.target=='end'){
      wx.setNavigationBarTitle({
        title: '目的地'
      })
    }else{
      wx.setNavigationBarTitle({
        title: '出发地'
      })
    }
   
  },
  //点击城市
  cityTap(e) {
    const val = e.currentTarget.dataset.val || '',
      types = e.currentTarget.dataset.types || '',
      Index = e.currentTarget.dataset.index || '',
      that = this;
  },
  //点击城市字母
  letterTap(e) {
    const Item = e.currentTarget.dataset.item;
    this.setData({
      cityListId: Item
    });
  },
// 重新定位
  relocationBtn(){
    var that = this;
    wx.getSetting({
      success: (res) => {
        if (!res.authSetting['scope.userLocation']) {
          wx.openSetting({
            success: (res) => { 
              that.getLocate();
            }
          })
        }
        else{
          that.getLocate();
        }

      }
    })
  },


  //调用定位
  getLocate() {
    let that = this;
    that.setData({
      isanimotion: true
    });
    new qqmap().getLocateInfo().then(function (val) {
      if (val.errMsg == 'getLocation:fail auth deny' || val.errMsg == 'getLocation:fail:auth denied'){
        that.setData({
          failLocation: '定位失败',
          isanimotion: false
        });
        return
      }
      if (val.indexOf('市') !== -1) {//这里是去掉“市”这个字
        val = val.slice(0, val.indexOf('市'));
      }
      that.setData({
        locateCity: val,
        isanimotion:false
      });
      //把获取的定位和获取的时间放到本地存储
      wx.setStorageSync('locatecity', { city: val, time: new Date().getTime() });
    });
  },
  // 获取城市列表
  getCityList(){
    var that = this;
    http.request({
      url:config.jsHost +'/app/v1.0/flightCity/list',
      success(res) {
        wx.hideNavigationBarLoading()
        if (res.data.code == 200) {
          var letter = []; //城市首字母 
          var citylist = [];//城市列表
          var hotCity = [];//热门
          var data = res.data.data; //城市列表数据
          // 遍历数据得到字母列表
          for (let index in data) {
            if (letter.indexOf(data[index].pyHead) < 0) {
              letter.push(data[index].pyHead);
            }
            if (data[index].hotType == 2) {
              hotCity.push(data[index])
            }
          }
          // 重组数据
          for (let i in letter) {
            let cityObj = {};
            let cities = [];
            for (let index in data) {
              if (letter[i] == data[index].pyHead) {
                cityObj.tag = data[index].pyHead;
                cities.push(data[index]);
                cityObj.cities = cities;
              }
            }
            citylist.push(cityObj);
          }
          letter.push('#')
          that.setData({
            citylist: citylist,
            orderData: data,
            letter: letter,
            hotCity: hotCity
          });
        }
      }
    })
  },
  // 输入提示
  bindInput: function (e) {
    var that = this;
    var value = e.detail.value;
    if (value == '') {
      this.setData({
        show: false,
      })
    }
    else{
      var cityData = that.data.orderData;
      var arr = cityData.filter(item => 
      item.name.indexOf(value) != -1 ||
      item.pySimple.indexOf(value) != -1 ||
      item.aitaCode.indexOf(value) != -1)
      this.setData({
        show: true,
        tips:arr
      })
    }
    
  },
  // 点击城市名字
  bindSearch: function (e) {
    var that = this;
    var keywords = e.target.dataset.keywords;
    var target = that.data.toWhere;
    var pages = getCurrentPages();
    var currPage = pages[pages.length - 1];  //当前页面
    var prevPage = pages[pages.length - 2]; //上一个页面
    if (target == 'end') {
      //直接调用上一个页面的setData()方法，把数据存到上一个页面中去
      prevPage.setData({
        end: keywords,
      })
    } else {
      prevPage.setData({
        start: keywords,
      })
    }
    wx.navigateBack();
 },
  onShow() {
    let that = this,
      cityOrTime = wx.getStorageSync('locatecity') || {},
      time = new Date().getTime(),
      city = '';
    if (!cityOrTime.time || (time - cityOrTime.time > 1800000)) {//每隔30分钟请求一次定位
      this.getLocate();
    } else {//如果未满30分钟，那么直接从本地缓存里取值
      that.setData({
        locateCity: cityOrTime.city
      })
    }
 
  }
})