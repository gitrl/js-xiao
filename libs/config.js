var config = {
  //腾讯地图key(now)
  key: 'KILBZ-CA335-QZ6IL-QNM6S-TMLZE-CHFYP',
  //腾讯地图key  (old)
  key2:'7ORBZ-QRMK3-5F23P-YFN5S-EYIAV-5ZB2T'

}
// test :测试，dev：开发环境，pre:预发布，prod:生产环境

/**
 * 连接NAMI服务端地址
 */
var ENV = 'prod';
var jsHost='';
var loginHost='';

 if(ENV == 'dev'){
     jsHost = "http://192.168.1.58:21000";
     loginHost = "http://192.168.1.6:13132";
 }
 else if (ENV == 'test'){
     jsHost = "http://192.168.1.221:21000";
     loginHost = "http://192.168.1.231:13132";
 }
 else if (ENV == 'pre'){
     jsHost = "http://111.231.211.53:21000";
     loginHost = "http://111.231.210.132"; 
 }
 else if (ENV == 'prod') {
     jsHost = "https://hades-airport.maoniuchuxing.com";
     loginHost = "https://login-passeneger.maoniuchuxing.com"; 
 }
module.exports = {
  Config: config,
  jsHost: jsHost,
  loginHost: loginHost
}