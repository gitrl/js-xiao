var QR = require("../../../libs/qrcode.js");

Page({

  data: {
    name: "lishi",
    canvasHidden: false,
    imagePath: '',
    placeholder: '',//默认二维码生成文本
  },

  //动态生成二维码
  onLoad: function (options) {
    wx.showLoading({
      title: '加载中...',
    })
    var url = 'https://chuxing.maoniuchuxing.com/airport?sellerId=' + options.sellerId 
    this.setData({ placeholder: url})
    setTimeout(function () {
      wx.hideLoading()
    }, 1000)
    // 页面初始化 options为页面跳转所带来的参数
    var size = this.setCanvasSize();//动态设置画布大小
    var initUrl = this.data.placeholder;

    this.createQrCode(initUrl, "mycanvas", size.w, size.h);
  },

  //适配不同屏幕大小的canvas
  setCanvasSize: function () {
    var size = {};
    try {
      var res = wx.getSystemInfoSync();
      //不同屏幕下canvas的适配比例；设计稿是750宽
      var scale = 750 / 350;    
      var width = res.windowWidth / scale;
      var height = width;//canvas画布为正方形
      size.w = width;
      size.h = height;
    } catch (e) {
    }
    return size;
  },
  createQrCode: function (url, canvasId, cavW, cavH) {
    //调用插件中的draw方法，绘制二维码图片
    QR.api.draw(url, canvasId, cavW, cavH);
    setTimeout(() => { this.canvasToTempImage(); }, 1000);
  },
  //获取临时缓存照片路径，存入data中
  canvasToTempImage: function () {
    var that = this;
    wx.canvasToTempFilePath({
      canvasId: 'mycanvas',
      success: function (res) {
        var tempFilePath = res.tempFilePath;
        that.setData({
          imagePath: tempFilePath,
          // canvasHidden:true
        });
      },
      fail: function (res) {
      }
    });
  },
  //点击图片进行预览，长按保存分享图片
  previewImg: function (e) {
    var img = this.data.imagePath;
    wx.previewImage({
      current: img, // 当前显示图片的http链接
      urls: [img] // 需要预览的图片http链接列表
    })
  },

  // 下载二维码
  // downloadCode: function (res) {
  //   var filePath = this.data.imagePath
  //   console.log('下载中' + filePath)
  //   wx.saveImageToPhotosAlbum({
  //     filePath: filePath,
  //     success: function (res) {
  //       wx.showToast({
  //         title: '图片保存成功',
  //         icon: 'success',
  //         duration: 2000 //持续的时间
  //       })
  //     },
  //     fail: function (err) {
  //       console.log(err)
  //       wx.showToast({
  //         title: '图片保存失败',
  //         icon: 'none',
  //         duration: 2000//持续的时间
  //       })
  //     }
  //   })
  // }

})