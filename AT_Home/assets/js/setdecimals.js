/**
 * 创建Cookie
 * @param key
 * @param value
 */
function setCookie(key, value) {
    $.cookie(key, value, {path:'/',expires: 1});
}

///<summary>
/// 删除cookie
///</summary>
function delCookie(key) {
    $.cookie(key, null,{path:'/'});
}

function getCookie(key) {
    try {
        var value = $.cookie(key);
        return undefinedCheck(value);
    } catch (e) {
        return "";
    }
}

function undefinedCheck(reValue) {
    if (typeof (reValue) == "undefined") {
        return "";
    } else if (reValue == null || typeof (reValue) == "null" || reValue == "null") {
        return "";
    } else {
        return reValue;
    }
}

var marketAllListCoinJson = {};

// 所有币种有效位数
$(function(){
    var sessionStorage;
    if(window.sessionStorage){
        sessionStorage = window.sessionStorage;
    }

    if(sessionStorage && sessionStorage.marketAllListCoin && sessionStorage.marketAllListCoin != "{}"){
        marketAllListCoinJson = JSON.parse(sessionStorage.marketAllListCoin);
    }else{
        $.ajaxSendData("", "/api/market/all", function(resData){
            var mark = {};
            if(resData.data){
                mark = {}
                for(var i in resData.data){
                    mark[resData.data[i].id] = resData.data[i];
                }
            }
            sessionStorage.marketAllListCoin = JSON.stringify(mark);
            marketAllListCoinJson = mark;
        });
    }
   
})


template.helper('_getMarketCoinfloatNumber', function (str, id) {
    id = (id != null) ? id : -1;
    var num = marketAllListCoinJson[id];
    if(num)
        return returnFloat(str, num.floatNumber);
    return str;
});

template.helper('_getMarketCoinfloatPrice', function (str, id) {
    id = (id != null) ? id : -1;
    var num = marketAllListCoinJson[id];
    if(num)
        return returnFloat(str, num.floatPrice);
    return str;
});

function getMarketCoinfloatNumber(str, id){
    id = (id != null) ? id : -1;
    var num = marketAllListCoinJson[id];
    if(num)
        return returnFloat(str, num.floatNumber);
    return str;
}

function getMarketCoinfloatPrice(str, id){
    id = (id != null) ? id : -1;
    var num = marketAllListCoinJson[id];
    if(num)
        return returnFloat(str, num.floatPrice);
    return str;
}

//数量方法
function returnFloat(value, iFloatNumber){
    // console.log(iFloatNumber);

    iFloatNumber = Math.abs(iFloatNumber);
    var valueLen0 = 0;
    var valueLen1 = 0;
    if(value == null) return 0;
    var initValue = value.toString();
    var str = initValue.split(".");
    try{ valueLen0 += str[0].length; }catch(e){};
    try{ valueLen1 += str[1].length; }catch(e){};

    // console.group("截取分组")
    //     console.log("初始值为: " + initValue + ", 截取整数的位数: " + valueLen0);
    //     console.log("初始值为: " + initValue + ", 截取小数的位数: " + valueLen1);
    // console.groupEnd("截取分组")
    if(iFloatNumber == 0){
        return value = str[0];
    }

    if(typeof str[1] == "undefined"){
        if(typeof str[1] == "undefined"){
            var Intlen = "";
            for(var i = 0; i < iFloatNumber; i++){
                Intlen += "0";
            }
            return (value = str[0] + "." + Intlen);
        }
    }
    if(valueLen1 >= iFloatNumber){
        if(iFloatNumber == 0){
            return value = str[0];
        }
        value = str[0] + "." + str[1].substring(0, iFloatNumber);
    }else{
        var len = iFloatNumber - valueLen1;
        for(var i = 0; i < len; i++){
            str[1] += "0";
        }
        value = str[0] + "." + str[1];
    }

    return value;
}
// console.log(sessionStorage.marketAllListCoin)