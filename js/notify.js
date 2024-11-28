
var serverUrl = 'server url' //server url
var key = 'your app key'  //your app key
var secret = 'your app secret' //your app secret


var signMethod = 'HMAC-SHA1'
var channel = 1


var $money = $('#money');
var $deviceNo = $('#deviceNo');

$(function(){
    getToken()

    var $submit = $('#submit');

    var moneyTest = /(?:^[1-9]([0-9]+)?(?:\.[0-9]{1,2})?$)|(?:^(?:0)$)|(?:^[0-9]\.[0-9](?:[0-9])?$)/;
    $submit.on('click', function () {
        if ($deviceNo.val() === '') {
          return alert('Please enter the device number')
        }

        if (!moneyTest.test($money.val()) || Number($money.val()) > 10000000) {
          return alert('Please enter the correct amount of consumption, maximum amount 10,000,000')
        } else {
          notify();
        }
      })
})



// sign method
function getSign (data) {
    function paramBuild (param) {
      var keys = []
      for (var k in param) {
        if (k !== 'Sign') keys.push(k)
      }
      keys.sort(function (a, b) {
        return a.trim() === b.trim() ? 0 : (a.trim() > b.trim() ? 1 : -1)
      })
      var buf = ''
      for (var i = 0; i < keys.length; i++) {
        var key = keys[i]
        var v = param[key]
        if (key.trim() !== '' && v !== '') {
          buf += key.trim() + '='
          buf += typeof v === 'object' ? JSON.stringify(v) : v
          buf += '&'
        }
      }
      return buf
    }
    data = paramBuild(data)
    data = data.substr(0, data.length - 1)
    // console.log('signStr:' + data)
    return CryptoJS.HmacSHA1(data,secret).toString().toUpperCase()
  }
  
  // get token 
  function getToken () {
    var data = {
        AppKey: key,
        SignMethod: signMethod,
        Timestamp: Math.round(new Date().getTime() / 1000),
        Nonce: Math.random().toString(36).substr(2, 16)
    }
    data.Sign = getSign(data)
  
    $.ajax({
      type: 'post',
      url: serverUrl + '/open/auth',
      contentType: 'application/json',
      dataType: 'json',
      data: JSON.stringify(data),
      success: function (result) {
        if (result.code === 0) {
          token = result.data.token
        } else {
         alert(result.msg)
          console.log(result.msg)
        }
      }
    })
  }
  

  // notify method
function notify () {
    var data = {
      AppKey: key,
      type: 0,
      Token: token,
      deviceName: $deviceNo.val(),
      amount: accMul($money.val(), 100),
      channel: channel
    }
    data.Sign = getSign(data)
    $.ajax({
      type: 'post',
      url: serverUrl + '/open/speaker/notify',
      contentType: 'application/json',
      dataType: 'json',
      data: JSON.stringify(data),
      success: function (result) {
        if (result.code === 0) {
          alert('successful')
        } else {
          alert(result.msg)
        }
      }
    })
  }
  
  /**
   * @description js精准计算(乘法)
   */
  function accMul (arg1, arg2) {
    let m = 0
    let s1 = arg1.toString()
    let s2 = arg2.toString()
    try { m += s1.split('.')[1].length } catch (e) {}
    try { m += s2.split('.')[1].length } catch (e) {}
    return Number(s1.replace('.', '')) * Number(s2.replace('.', '')) / Math.pow(10, m)
  }