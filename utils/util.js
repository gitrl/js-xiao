const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}
const formatDate = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  return [year, month, day].map(formatNumber).join('-')
}
// 转换时间
var getTime = function(time) {
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
}

/**
     * 获取间隔多少天的时间
     * @param d 时间
     * @param n 间隔多久（负数表示过期的日期）
     * @returns {string|*}
     */

const getAfterDayDate = function (d, n) {
  var year = d.getFullYear();
  var mon = d.getMonth() + 1;
  var day = d.getDate();
  if (day <= n) {
    if (mon > 1) {
      mon = mon - 1;
    }
    else {
      year = year - 1;
      mon = 12;
    }
  }
  d.setDate(d.getDate() + n);
  year = d.getFullYear();
  mon = d.getMonth() + 1;
  day = d.getDate();
  var s = year + "-" + (mon < 10 ? ('0' + mon) : mon) + "-" + (day < 10 ? ('0' + day) : day);
  return s;
}


/**
 * 获取上一个月
 *
 * @date 格式为yyyy-MM的日期，如：2014-01-25
 */
var getPreMonth = function (dateYMStr) {
  var arr = dateYMStr.split('-');
  var year = arr[0]; //获取当前日期的年份
  var month = arr[1]; //获取当前日期的月份
  var year2 = year;
  var month2 = parseInt(month) - 1;
  if (month2 == 0) {
    year2 = parseInt(year2) - 1;
    month2 = 12;
  }
  if (month2 < 10) {
    month2 = '0' + month2;
  }
  var t2 = year2 + '-' + month2;
  return t2;
}
//获取月份一共多少天 dateYMStr格式为yyyy-MM
var getMonthDayCount = function (dateYMStr) {
  var year = parseInt(dateYMStr.split('-')[0]);
  var month = parseInt(dateYMStr.split('-')[1]);
  var day = new Date();
  day.setYear(year);
  day.setMonth(month - 1);
  day.setDate(1);
  var dayCount = (32 - new Date(day.getYear(), day.getMonth(), 32).getDate());
  return dayCount;
}
//手机号码验证
const checkMobile = function(value) {
  if (value == '') {
    return false;
  } else if (value && (!(/^[1][123456789]\d{9}$/).test(value) || !(/^[1-9]\d*$/).test(value) || value.length !== 11)) {
    return false;
  } else if (value != undefined) {
    return true;
  }
}
//联系人验证
const checkUserName = function(value){
  value = value.replace(/(^\s+)|(\s+$)/g, "");
  var reg = /^[\u4e00-\u9fa5a-zA-Z]+$/;
  // 两个字符以上
  if (value == "" || value.length < 2 ) {
    return false;
    // 只能输入中英文
  }else if(!reg.test(value)){
    return false;
  } 
  else if (value != undefined) {
    return true;
  }
}
const buttonClicked=function(self) {
  self.setData({
    buttonClicked: true
  })
  setTimeout(function () {
    self.setData({
      buttonClicked: false
    })
  }, 500)
}
// 分转元
var change = function (fen) {
  var yuan = fen / 100;
  return yuan.toFixed(2);
}
var changeTofen = function (fen) {
  var yuan = (fen * 100).toFixed(0);
  return parseInt(yuan);
}


const getUrlParam = function(p, u){

  var u = u || document.location.toString();
  if (/.maoniuchuxing.com\//.test(u)) {
      var c = new RegExp("/" + p + "/([^/?#&]*)");
      var m = u.match(c);
      if (m && m[1]) {
          return m[1];
      }
  }
  var reg = new RegExp("(^|&)" + p + "=([^&]*)(&|$)");
  var r = u.substr(u.indexOf('?') + 1).match(reg);
  if (r != null)return r[2];
  return "";
        
}

module.exports = {
  formatTime: formatTime,
  formatDate: formatDate,
  getAfterDayDate:getAfterDayDate,
  checkMobile: checkMobile,
  buttonClicked: buttonClicked,
  checkUserName: checkUserName,
  getUrlParam: getUrlParam,
  getPreMonth: getPreMonth,
  getMonthDayCount: getMonthDayCount,
  getTime: getTime,
  change: change,
  changeTofen:changeTofen
}

