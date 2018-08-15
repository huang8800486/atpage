//  页面初始化加载
$(function () {
    $("#header").load("./main/common/indexHeader.html?version=" + $.version);
    $("#footer").load("./main/common/indexFooter.html?version=" + $.version);
    //  获得各大币行情
    // ticker();
    //  获得行业资讯文章信息
    getNewsList();
    //  获得交易市场列表
    getMarketList();
    //  获得成交量
    $("#btcPrice").html(0.00);
    connect();
});

function errorImg(obj) {
    $.loadDefaultImg1(obj);
}
appcode();
function appcode(){
    var url = window.location.href.split(/\/index/)[0];
    var linkText = url + "/main/help/redirect.html"
    $("#iosCode").attr("src", linkText);
    var iosCode = new QRCode(document.getElementById("iosCode"), {
        text: $("#iosCode").attr("src"),
        width: 108,
        height: 108,
        colorDark : "#000000",
        colorLight : "#ffffff",
        correctLevel : QRCode.CorrectLevel.H
    });
}

/*
* 24小时涨跌初始化定义价格
*/
var btcNum = 0;
var btcNum2 = 0;
var ltcNum = 0;
var ltcNum2 = 0;
var bchNum = 0;
var bchNum2 = 0;
var ethNum = 0;
var ethNum2 = 0;
var etcNum = 0;
var etcNum2 = 0;
var temp = 0;


var stompClient;
function connect() {
    var socket = new SockJS(gateways + "/api/socket");
    stompClient = Stomp.over(socket);
    stompClient.connect({}, function (frame) {

        stompClient.debug = function(message) {
            return null;
        };

        stompClient.subscribe('/ws/real/time/price',function(message){
            //  解析JSON对象
            var data = JSON.parse(message.body);

            //  前面人民币，后面美元
            var type = 0;

            for ( var i = 0 ;i < data.length; i++ ) {

                type = data[i].type;

                switch (type) {
                    case 3:
                        $("#btcPrice").html("¥ " + data[i].price[1]);
                        break;
                    case 8:
                        $("#ltcPrice").html("¥ " + data[i].price[1]);
                        break;
                    case 9:
                        $("#bchPrice").html("¥ " + data[i].price[1]);
                        break;
                    case 5:
                        $("#ethPrice").html("¥ " + data[i].price[1]);
                        break;
                    case 7:
                        $("#etcPrice").html("¥ " + data[i].price[1]);
                        break;
                    default:

                        break;
                }
            }
        });

        stompClient.subscribe('/topic/real/time/price', function(message) {
            //  解析JSON对象
            var data = JSON.parse(message.body);
            var type = data.type;

            //  如果是 BTC
            if ( type == 3){
                var price = data.price[0];
                if ( btcNum == 0 ){
                    btcNum = price;
                }else {
                    btcNum2 = price;
                    if ( btcNum < btcNum2 ) {
                        $("#btcPrice").html("<span class=\"c_green\">¥ " + btcNum2.toFixed(2) + " <i class=\"iconfont icon-xiangshang\"></i></span>");
                        btcNum = btcNum2;
                    }else if(btcNum > btcNum2){
                        $("#btcPrice").html("<span class=\"red\">¥ " + btcNum2.toFixed(2) +" <i class=\"iconfont icon-xiangxia\"></i></span>");
                        btcNum = btcNum2;
                    }
                }
            }
            //  如果是 LTC
            if ( type == 8){
                var price = data.price[0];
                if ( ltcNum == 0 ){
                    ltcNum = price;
                }else {
                    ltcNum2 = price;
                    if ( ltcNum < ltcNum2 ) {
                        $("#ltcPrice").html("<span class=\"c_green\">¥ " + ltcNum2.toFixed(2) + " <i class=\"iconfont icon-xiangshang\"></i></span>");
                        ltcNum = ltcNum2;
                    }else if(ltcNum > ltcNum2) {
                        $("#ltcPrice").html("<span class=\"red\">¥ " + ltcNum2.toFixed(2) +" <i class=\"iconfont icon-xiangxia\"></i></span>");
                        ltcNum = ltcNum2;
                    }
                }
            }
            //  如果是 BCH
            if ( type == 9){
                var price = data.price[0];
                if ( bchNum == 0 ){
                    bchNum = price;
                }else {
                    bchNum2 = price;
                    if ( bchNum < bchNum2 ) {
                        $("#bchPrice").html("<span class=\"c_green\">¥ " + bchNum2.toFixed(2) + " <i class=\"iconfont icon-xiangshang\"></i></span>");
                        bchNum = bchNum2;
                    }else if ( bchNum > bchNum2 ){
                        $("#bchPrice").html("<span class=\"red\">¥ " + bchNum2.toFixed(2) +" <i class=\"iconfont icon-xiangxia\"></i></span>");
                        bchNum = bchNum2;
                    }
                }
            }
            //  如果是 ETH
            if ( type == 5){
                var price = data.price[0];
                if ( ethNum == 0 ){
                    ethNum = price;
                }else {
                    ethNum2 = price;
                    if ( ethNum < ethNum2 ) {
                        $("#ethPrice").html("<span class=\"c_green\">¥ " + ethNum2.toFixed(2) + " <i class=\"iconfont icon-xiangshang\"></i></span>");
                        ethNum = ethNum2;
                    }else if ( ethNum > ethNum2 ){
                        $("#ethPrice").html("<span class=\"red\">¥ " + ethNum2.toFixed(2) +" <i class=\"iconfont icon-xiangxia\"></i></span>");
                        ethNum = ethNum2;
                    }
                }
            }
            //  如果是 ETC
            if ( type == 7){
                var price = data.price[0];
                if ( etcNum == 0 ){
                    etcNum = price;
                }else {
                    etcNum2 = price;
                    if ( etcNum < etcNum2 ) {
                        $("#etcPrice").html("<span class=\"c_green\">¥ " + etcNum2.toFixed(2) + " <i class=\"iconfont icon-xiangshang\"></i></span>");
                        etcNum = etcNum2;
                    }else if ( etcNum > etcNum2 ){
                        $("#etcPrice").html("<span class=\"red\">¥ " + etcNum2.toFixed(2) +" <i class=\"iconfont icon-xiangxia\"></i></span>");
                        etcNum = etcNum2;
                    }
                }
            }
        });
    });
}

function disconnect() {
    if (stompClient != null) {
        stompClient.disconnect();
    }
}

function sendMessage() {
    var message = $("#message").val();
    var topic = $("#topic").val();
    stompClient.send(topic, {}, message);
}
/*
* 获得交易市场列表
* 现在只有4个交易市场, 1个自选市场
* QD
* USDT
* BTC
* ETH
*/
var collectArr = [];
function getMarketList() {
    var param = {
        id: "",
        sort: 0
    }


    $.ajaxSendData(param, "/api/market/search", function(resData){
        var lengths = resData.data.length;
        
        var zxArray = new Array();
        var qdArray = new Array();
        var usdtArray = new Array();
        var btcArray = new Array();
        var ethArray = new Array();
        var defaultArray = new Array();
        var j = 0;
        var k = 0;
        var qd = 0;
        var usdt = 0;
        var btc = 0;
        var eth = 0;
        for ( i = 0;i<lengths;i++ ){
            var nameEn = resData.data[i].name_en.split("/");
            var result = nameEn[nameEn.length - 1];
            // 自选有登陆
            if ($.getToken() != "") {
                if(collectArr[k] == resData.data[i].id){
                    zxArray[k] = resData.data[i];
                    k++;
                }
            }else{
                if(getids(resData.data[i].id)){
                    zxArray[k]=resData.data[i];
                    k++;
                }
            }
            
            if ( result == 'QD' ){
                qdArray[qd] = resData.data[i];
                qd++;
            }

            if ( result == 'USDT' ){
                usdtArray[usdt] = resData.data[i];
                usdt++;
            }

            if ( result == 'BTC' ){
                btcArray[btc] = resData.data[i];
                btc++;
            }

            if ( result == 'ETH' ){
                ethArray[eth] = resData.data[i];
                eth++;
            }

        }
        //自选市场
        var da1 = { "list": zxArray };
        var _html = template('list_zxList', da1);   //template("模版名","数据集")
        $("#zxList").html(_html);
        //  QD
        var da2 = { "list": qdArray };
        var _html = template('list_qdList', da2);   //template("模版名","数据集")
        $("#qdList").html(_html);
        //  usdt
        var da3 = { "list": usdtArray };
        _html = template('list_usdtList', da3);   //template("模版名","数据集")
        $("#usdtList").html(_html);
        //  btc
        var da4 = { "list": btcArray };
        _html = template('list_btcList', da4);   //template("模版名","数据集")
        $("#btcList").html(_html);
        //  eth
        var da5 = { "list": ethArray };
        var _html = template('list_ethList', da5);   //template("模版名","数据集")
        $("#ethList").html(_html);
    });
}

/*
* 获得行业资讯文章信息
* type: "news", 接口属性值新闻
* languageType: 加载的语言, 中文1, 英文2
* adaptationtype: 为2时是PC, 1是APP
*/
function getNewsList() {
    var param = {
        pageSize: 20,
        pageTo: 1,
        type: "news",
        adaptationtype: 2,
        languageType : langPkg.getAdLanguage()
    }



    $.ajaxSendData(param, "/api/article/getArticleList", function(resData){
        //  获得行业资讯列表的长度
        var articleLength = resData.data.length;
        if ( articleLength > 0) {

            var articleArray = new Array();

            for (i = 0; i < articleLength; i++) {
                if (resData.data[i].index == 1) {
                    articleArray[i] = resData.data[i];
                }
            }
            var da = {"list": articleArray};
            var _html = template('list_News', da);   //template("模版名","数据集")
            $("#div_newsList").html(_html);
        }else{
            $(".new-container").hide();
        }
        if ( articleLength >= 4 ) {
            $("#more").attr("style","display:block");
        }
    })
}

/*
* banner图片加载
* languageType: 加载的语言, 中文1, 英文2
* bannertype: 为1时接口是首页banner图
* adaptationtype: 为2时是PC, 1是APP
*/
getBannerImg();
var bannerLength = 1;
function getBannerImg() {

    var param = {
        pageSize: 0,
        pageTo: 0,
        languageType : langPkg.getAdLanguage(),
        bannertype: 1,
        adaptationtype:2
    };

    $.ajaxSendData(param, "/api/adver/getAdverList/v2", function(resData){
        var newAdList = [];
        newAdList = resData.data;
        bannerLength = newAdList.length;
        if ( bannerLength > 0) {
            var da = { "list": newAdList}
            // var _html = template('banner_list', da);   //template("模版名","数据集")
            var _html = template('banner_list', da);   //template("模版名","数据集")
            $("#flash").html(_html);
            var mySwiper = new Swiper ('.swiper-container', {
                autoplay: { 
                    delay: 7000,
                    disableOnInteraction: false
                },
                loop: true,
            }) 
        }else{
            $("#flash").append('<div class="swiper-slide" style="background: url(../images/banner_01.jpg) center top / cover no-repeat;class="am-active-slide" data-thumb-alt=""></div>')
        }
    });


}

jQuery(document).ready(function () {
    $(".top").hover(function () {
        $(".top").addClass('topbg');
    });
    $(".top").mouseleave(function () {
        $(".top").removeClass('topbg');
    });
});
function getids(id) {
    var colnid = $.cookie("coinname")
    if(colnid!=null&&colnid!=""){
        colnid = $.cookie("coinname").split(",");
        for(var i=0;i<colnid.length;i++){
            if(colnid[i] == id){
                return true;
            }
        }
    }   
    return false;
};

/*
* 点击收藏
*/
function setcookies(id) {       
    var cookid = $.cookie("coinname");
    if(cookid!=null&&cookid!=""){
        var cokid = new Array();
        var flag = true;
        cookid=$.cookie("coinname").split(",");
        for(var i=0;i<cookid.length;i++){
            if(cookid[i]==id)
            {
                flag = false;
                continue;
            }
            cokid.push(cookid[i]);
            if(i==cookid.length-1&&flag){   
                cokid.push(id);
            }
        }
        $.cookie("coinname",cokid,{
            path: "/"
        });
        if($.getToken() != '')
        {
            saveCondig();
        }
        getMarketList();
    }else{
        $.cookie("coinname", id,{
            path: "/"
        });
        getMarketList();
    }
};

/**
 * 存储配置到服务器
 */
function saveCondig(id) {
    var param = {
        config : id
    }
    $.ajaxSendData(param, "/api/user/config_edit", function(resData){
        getCondig();
    });
}
// 删除
function deleteCondig(id) {
    var param = {
        config : id
    }
    $.ajaxSendData(param, "/api/user/config_delete", function(resData){
        getCondig();
    });
}
function getCondig() {
    var marketids = $("body").data("marketid");
    $.ajaxSendData("", "/api/user/config", function(resData){
        collectArr = resData.data;
    });
}


//  自定义模板
template.helper('_imgPath', function (str) {
    if (str == '' || str == null) {
        return "../../logo.png";
    } else {
        return $.imgFilePath() + str;
    }
});

template.helper('_imgPath', function (str) {
    if (str == '' || str == null) {
        return "../../logo.png";
    } else {
        return $.imgFilePath() + str;
    }
});

/*
* 根据后台返回的有效小数位来计算要显示的位数
* 获取cookie名name为"marketAllListCoin", 设置cookie在indexHeader.html里
* 最终返回returnFloat计算
*/
template.helper('_getFloatNumber', function (str, id) {
    var value = returnFloat(str, id);
    return value;
});
template.helper('_getFloatPrice', function (str, id) {
    var value = returnFloat(str, id);
    return value;
});

template.helper('_toThousands', function (num) {
    return num && num.toString().replace(/(^|\s)\d+/g, function (m) {
        return m.replace(/(?=(?!\b)(\d{3})+$)/g, ',');
    });
});
template.helper('_toUpperCase', function (str) {
    return str.toUpperCase();
});
template.helper('_toUpperCases', function (str) {
    return str.toUpperCase();
});

template.helper('_dataFomate', function (strDate) {
    var dt = new Date(strDate);
    var m = new Array("Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Spt", "Oct", "Nov", "Dec");
    var w = new Array("Monday", "Tuseday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday");
    var d = new Array("st", "nd", "rd", "th");
    mn = dt.getMonth();
    wn = dt.getDay();
    dn = dt.getDate();
    var dns;
    if (((dn) < 1) || ((dn) > 3)) {
        dns = d[3];
    }
    else {
        dns = d[(dn) - 1];
        if ((dn == 11) || (dn == 12)) {
            dns = d[3];
        }
    }
    return dn + " " + m[mn] + " " + " " + dt.getFullYear();
});
template.helper('_isCookieID',function(id){
    var colnid = $.cookie("coinname")
    if(colnid!=null&&colnid!=""){
        colnid = $.cookie("coinname").split(",");
        for(var i=0;i<colnid.length;i++){
            if(colnid[i] == id){
                return "icon-shoucang";
            }
        }
    }   
    return "icon-weishoucang";
});
template.helper('_cutRoundNum',function( str , num ){
    var str = $.cutRoundNum( str , num );
    return str;
});
setInterval('getMarketList()',10000);

function redictMarketId(id) {
    window.location.href='./main/trade/market.html?marketid=' + id;
}

/*
* 客服
*/
(function(a,h,c,b,f,g){a["UdeskApiObject"]=f;a[f]=a[f]||function(){(a[f].d=a[f].d||[]).push(arguments)};g=h.createElement(c);g.async=1;g.charset="utf-8";g.src=b;c=h.getElementsByTagName(c)[0];c.parentNode.insertBefore(g,c)})(window,document,"script","https://assets-cli.udesk.cn/im_client/js/udeskApi.js","ud");
ud({
    "code": "29i6k45k",
    "link": "https://at3.udesk.cn/im_client/?web_plugin_id=49439"
});

/* 
* 市场动态排序 
*/
$(function() {
    var table = $('<table class="ex-2"></table>');
    var tbody = $('<tbody></tbody>');
    table.append(tbody);
    // $('table').tablesort().data('tablesort');       
});