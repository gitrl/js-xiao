var config = require('./config');

// 封装公共的请求
var request = options => {
    var data = options.data || {};
    var token = wx.getStorageSync('token');
    var method = options.method;
    var url = options.url;
    if (url.indexOf("http") != 0) {
        url = `${config.host}${url}`;
    }
    if (options.loading) {
        wx.showNavigationBarLoading();
    };
    wx.request({
        url: url,
        data: data,
        method:method,  
        header:{
          'content-type': 'application/json',
          'x-access-token': token
        },
        complete: function (res) {
            if (res.errMsg == 'request:fail timeout'){
              wx.hideLoading();
              wx.showModal({
                title: '提示',
                content: '请求超时，请稍后再试',
                showCancel:false,
                success(res){
                  wx.switchTab({
                    url: '../airplanIndex/airplanIndex'
                  })
                }
              })
              var data = {
                data: res
              };
              throw new Error(JSON.stringify(data));
            }
            if (typeof (res.data.code) == 'undefined'){
              wx.showToast({
                title: '系统异常！',
                icon: 'none',
                duration: 2000
              });
              var data = {
                url: url,
                data:res
              };
              throw new Error(JSON.stringify(data));
            }
            if (options.loading) {
                wx.hideNavigationBarLoading();
            }
            if (res.statusCode != 200 || typeof res.data == "undefined") {//失败
                console.log("失败", options.url, res);
              wx.hideLoading()

              wx.showToast({
                title: '网络异常，请稍后重试!',
                icon: 'none',
                duration: 2000
              })
              wx.navigateBack();
                typeof options.fail == "function" && options.fail(res);
            } else {//成功
                // console.log("成功", options.url, res);
                typeof options.success == "function" && options.success(res);
            }
            // 登录失效，重新登录
          if (res.data.code == 10000) {
              // wx.clearStorageSync();
              // 清楚本地数据ff
              wx.removeStorageSync('token');
              wx.removeStorageSync('userInfo');
              wx.removeStorageSync('userStatus');
              // wx.removeStorageSync('openid');
              wx.showModal({
                title: '提示',
                content: res.data.msg,
                cancelText: '暂不登录',
                confirmText: '立即登录',
                cancelColor:'#c7c7c7',
                success(res){
                  if(res.confirm){
                    wx.setStorageSync('userStatus', 1);
                    wx.navigateTo({
                      url: '/pages/reg/reg'
                    })
                  }
                  else{
                    wx.switchTab({
                      url: '/pages/airplanIndex/airplanIndex'
                    })
                  }
                }
              })
          }
         
        }
  }); 
}

module.exports = {
    request: request
}