const wxqqmap = require('../libs/qqmap-wx-jssdk.min.js'),
  qqwxmap = new wxqqmap({
    key: 'KILBZ-CA335-QZ6IL-QNM6S-TMLZE-CHFYP' // 必填，这里最好填自己申请的的
  });
// import util from './util.js';
const qq = 'sdfsdf';
export default class qqmap {//获取定位信息
  getLocateInfo() {
    let that = this;
    return new Promise(function (resolve, reject) {
      that.location().then(function (val) {
        console.log(val)
        //如果通过授权，那么直接使用腾讯的微信小程序sdk获取当前定位城市
        qqwxmap.reverseGeocoder({
          location: {
            latitude: val.latitude,
            longitude: val.longitude
          },
          success: function (res) {
            resolve(res.result.address_component.city);//返回城市
          },
          fail: function (res) {
            reject(res);
          },
          complete: function (res) {
          }
        });

      }, function (error) {
        console.log(error)
          resolve(error)
        //如果用户拒绝了授权，那么这里会提醒他，去授权后再定位
        // wx.showModal({
        //   title: '',
        //   content: '授权失败',
        //   // confirmText: '去授权',
        //   showCancel:false,
        //   success(res) {
            // resolve(error)
        //     // if (res.confirm) {
        //     //   wx.openSetting({
        //     //     success(res) {
        //     //       that.getLocateInfo();
        //     //     }
        //     //   })
        //     // }
        //   }
        // })

      })

    })
  }

  // 搜素提示
  // getTips(keywords) {
  //   let that = this;
  //   return new Promise(function (resolve, reject) {
  //     that.location().then(function (val) {
  //       // 获取输入提示词
  //       qqwxmap.getSuggestion({
  //         keyword: keywords,
  //         policy:1,
  //         success: function (res) {
  //           console.log(res);
  //             resolve(res)
  //         },
  //         fail: function (res) {
  //           console.log(res);
  //         },
  //         complete: function (res) {
  //         }
  //       });

  //     }, function (error) {
  //       //如果用户拒绝了授权，那么这里会提醒他，去授权后再定位
  //       wx.showModal({
  //         title: '',
  //         content: '获取输入提示词失败',
  //         confirmText: '重试？',
  //         success(res) {
  //           if (res.confirm) {
  //             that.getCityListInfo();
  //           }
  //         }
  //       })

  //     })

  //   })
  // }
  //定位，获取当前经纬度
  location() {
    return new Promise(function (resolve, reject) {
      wx.getLocation({
        altitude: true,
        success: function (res) {
          resolve(res);
        }, fail(res) {
          
          reject(res);
        }
      })
    });

  }


}