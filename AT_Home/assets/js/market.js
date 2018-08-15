var marketID = null;
var floatNumber = 0;
var floatPrice = 0;
var floatCoinNames = "";
var floatPointCoinName = "";
var isChecktype = null;     
var isSetTradePwd = null;   // 是否交易密码
var collectArr = [];        // 收藏列表
var regionCoin = 1;         // 主区1, 创新区2
var searchKey = "";         // 搜索币种
$(function () {
    var marketurl = window.location.href;
    var klineTitle = "";
    $("#header").load("../common/commonHeader.html?version=" + $.version);
    $("#footer").load("../common/commonFooter.html?version=" + $.version);
    $.GetMarketId(function(marketid){
        //  页面一加载，就将ifram框的src填充
        $("body").data("marketid", marketid);
        if(marketurl.indexOf("fullmarket") != -1){
            klineTitle = "big"
        }else{
            klineTitle = "simple"
        }
        var fullmarketurl = "fullmarket.html?marketid=" + marketid;
        $("#k_line").attr("src","trading/"+ klineTitle +".html?symbol=" + marketid);
        $(".gofullMarket").attr("href", fullmarketurl)
        $(".collectCoin").addClass("collectCoin" + marketid)
        //  判断是否登录
        isLogin(marketid);

        /**
         * 请不要随意改动此处，不要随意添加向后端的轮询请求，禁止非法的，需要添加新的接口数据请先咨询
         * @param obj
         * @returns
         */
        //  获得用户信息
        // Getassets();
        //  获得实时成交记录
       // getTransactionList(marketid);

        //  根据 市场ID 获得当前交易市场详情信息
       // getMarketInfoById(marketid);
        //  获取交易市场列表
       // getMarketList();
        //  根据交易市场ID查询交易市场数据
        collectFun(marketid);
        // getMarketInfo(marketid);
        //  根据交易市场ID查询交易市场数据（只调用一次，页面初始化调用一次）
        // getMarketInfoOnce(marketid);
        //  根据交易市场ID查询对应币种数据
        getCoinDetails(marketid);

        //  交易市场行情
       // GetTradeingMarketList(marketid);
        //  滑块
        myslider();
        //  获取用户资产，并初始化
      //  getUserAssets(marketid);
        
        initWebSocket();
    })
    
});

// console.log($.cookie())
function errorImg(obj) {
    $.loadDefaultImg2(obj);
}

//  判断是否登录
function isLogin(marketID) {
    if (!$.TokenIsNull($.getToken())) {
        getCondig()
        getUserInfo();
    }
    $("body").addClass("tradeloading");
    var LoginInfo = $.getToken();
    if (LoginInfo == "") {
        getUserAssets(marketID);
        $("#NotLogin").show();
        $("#limitNotLogin").show()
    } else {
        // Getassets();
        $("#Islogin").show();
        $("#limitIsLogin").show()
        setTimeout(function(){
            //  限时委托
            getLimitTradeList(marketID);
            //  历史委托
            // getHistoryTradeList(marketID);
        }, 0)
    }
}

function getUserInfo() {
    $.ajaxSendData("", "/api/user/details", function(resData){
        isChecktype = resData.data.checktype;
        isSetTradePwd = resData.data.status;
        if(isChecktype == 1){
            $("#timetrade").html(langPkg.getI18N("yongbushuru"))
        }else if(isChecktype == 2){
            $("#timetrade").html(langPkg.getI18N("sixhouneibushuru"))
        }else if(isChecktype == 3){
            $("#timetrade").html(langPkg.getI18N("meicishurudouxuyaoyanzhengma"))
        }

        var CookiesID =  resData.data.conf;
        $.cookie("coinname", CookiesID,{
            path: "/"
        });

    });
}

//  定时任务
//setInterval("reloadPage()", 10000);
//setInterval("GetTradeingMarketList(marketID)", 4000);
//setInterval("getUserAssets(marketID)", 60000);
// setInterval("getMarketInfoOnce(marketID)", 10000);

//  重新加载页面数据
function reloadPage() {
    var marketIDs = $("body").data("marketid");
    //  获得实时成交记录
    getTransactionList(marketIDs);
    //  获取交易市场列表
    getMarketList(marketIDs);
    // getMarketInfoOnce(marketIDs);

    //  根据交易市场ID查询对应币种数据
    // getCoinDetails(marketIDs);
    //  根据 市场ID 获得当前交易市场详情信息
    getMarketInfoById(marketIDs);
    //  根据交易市场ID查询交易市场数据
    // setInterval("getMarketInfo(marketIDs)",2000);
    getMarketInfo(marketIDs);

    var LoginInfo = $.getToken();
    if (LoginInfo != "") {
        setTimeout(function(){
            //  限时委托
            getLimitTradeList(marketIDs);
            //  历史委托
            // getHistoryTradeList(marketIDs);
        }, 0)
    }
    //  实时刷新最新价
    GetTradeingMarketList(marketIDs);
}

//  获取用户资产
function getUserAssets(marketid) {
    if (!$.TokenIsNull($.getToken())) {
        var param = {
            hot: 1,
            marketId: marketid,
            keyword: "",
            pageSize: 25,
            pageTo: 1,
            sort: 3
        };
        

        $.ajaxSendData(param, "/api/assets/market/assets", function(resData){
            userAssetsResultHandler(resData);
        });
    }
}
function userAssetsResultHandler(resData){
    if (resData.code == 200 && !jQuery.isEmptyObject(resData.data)) {
        $("#available_xnb").val(returnFloat((resData.data.availableCoin), floatPrice));
        $("#available_xn2").html(returnFloat((resData.data.availableCoin), floatPrice));
        $("#available_rmb").val(returnFloat((resData.data.availablePointCoin), floatPrice));
        $("#available_rm2").html(returnFloat((resData.data.availablePointCoin), floatPrice));
        if ( $("#buyPrice").val() == 0 ) {
            // $("#buy_max").html(returnFloat(resData.data.availablePointCoin, floatPrice));
        }else {
            $("#buy_max").html(returnFloat((resData.data.availablePointCoin / $('#buyPrice').val()), floatNumber));
        }
        if ( $("#sellPrice").val() == 0 ) {
            $("#sell_max").html(returnFloat((resData.data.availableCoin), floatNumber));
        }else {
            $("#sell_max").html(returnFloat((resData.data.availableCoin ), floatNumber));
        }
        

        // $("#buyMax").show();
        // $("#sellMax").show();
        $("#availables").show();

    }

}
var recommendPrice = 0;
var recomIndex = 0;
var overbrim = {
    buy_overflow: 1.15,    // 高于
    normal_overflow: 1,
    sell_overflow: 0.85,       // 低于
    recommPrice: 0
}
function getafijewoResultHanlder(resData){
    var marketIds = $("body").data("marketid");
	if(recomIndex == 0){
        $("#buyPrice, #sellPrice").val(getMarketCoinfloatPrice(resData.data.price, marketIds));
        $("#buy_limit_math_price, #sell_limit_math_price").html(resData.data.cny);
    }
    recomIndex++;
    $(".current_pricec_coin").html(getMarketCoinfloatPrice(resData.data.price, marketIds));
    $(".cny_pricec_coin").html(resData.data.cny);
    $(".charth2, .collectCoin, .klin-pr_wrap").css("visibility", "visible");
    recommendPrice = resData.data.rate;
    overbrim.buy_overflow = resData.data.buy_overflow;
    overbrim.normal_overflow = 100;
    overbrim.sell_overflow = resData.data.sell_overflow;
    overbrim.recommPrice = resData.data.price;
}
//  滑块
function myslider() {
    var type = ['sell', 'buy'];
    // for (var i in type) {
    $("#slider_buy").slider({
        value:0,
        min: 0,
        max: 100,
        step: 1,
        range: "min",
        slide: function( a,t ) {
            var type = $(t.handle).attr('data_slide');//获取type类型，sell或者buy
            var e = parseFloat($("#buy_max").text());//获取最大可买/卖数量，并转型为float
            if(isNaN(e)){
                e=0;    //如果转型失败，则标记为0
            }
            $("#sliderLine_buy").css('width',t.value + '%');    //  给进度条添加样式
            $("#sli_buy").css('width',t.value + '%');     //  给滑块添加样式
            var buyNum = returnFloat((e / 100 * t.value), floatNumber);

            $("#buyNum").val(buyNum);//设置买卖数量

            $("#ratio_num_buy").text(t.value + "%");//设置显示比例数
            $("#sli_buy").css('width',t.value + '%');     //  给滑块添加样式
            var buyPrice = $('#buyPrice').val();
            if(t.value == 0){
                $("#slider_buy .percent").removeClass("active");
            }
            else if(t.value < 25){
                $("#slider_buy .percent").removeClass("active");
                $("#slider_buy .percent_00").addClass("active");
            }else if(t.value >= 25 && t.value < 50){
                $("#slider_buy .percent").removeClass("active");
                $("#slider_buy .percent_00").addClass("active");
                $("#slider_buy .percent_01").addClass("active");
            }else if(t.value >= 50 && t.value < 75){
                $("#slider_buy .percent").removeClass("active");
                $("#slider_buy .percent_00").addClass("active");
                $("#slider_buy .percent_01").addClass("active");
                $("#slider_buy .percent_02").addClass("active");
            }else if(t.value >= 75 && t.value < 100){
                $("#slider_buy .percent").removeClass("active");
                $("#slider_buy .percent_00").addClass("active");
                $("#slider_buy .percent_01").addClass("active");
                $("#slider_buy .percent_02").addClass("active");
                $("#slider_buy .percent_03").addClass("active");
            }else if(t.value >= 100){
                $("#slider_buy .percent").removeClass("active");
                $("#slider_buy .percent_00").addClass("active");
                $("#slider_buy .percent_01").addClass("active");
                $("#slider_buy .percent_02").addClass("active");
                $("#slider_buy .percent_03").addClass("active");
                $("#slider_buy .percent_04").addClass("active");
            }
            if(buyPrice >0){
                if(floatPointCoinName != "QD"){
                    $("#buyMum").html(returnFloat((buyNum * buyPrice), floatPrice));//设置总价
                }else{
                    $("#buyMum").html(returnFloat((buyNum * buyPrice), 2));//设置总价
                }
                
            }
        }
    });
    $("#slider_sell").slider({
        value:0,
        min: 0,
        max: 100,
        step: 1,
        range: "min",
        slide: function( a,t ) {
            var e = parseFloat($("#sell_max").text());//获取最大可买/卖数量，并转型为float
            if(isNaN(e)){
                e=0;    //如果转型失败，则标记为0
            }
            $("#sliderLine_sell").css('width',t.value + '%');    //  给进度条添加样式
            $("#sli_sell").css('width',t.value + '%');     //  给滑块添加样式
            var sellNum = returnFloat((e / 100 * t.value), floatNumber);

            $("#sellNum").val(sellNum);//设置买卖数量

            $("#ratio_num_sell").text(t.value + "%");//设置显示比例数
            var sellPrice = $('#sellPrice').val();
            if(t.value == 0){
                $("#slider_sell .percent").removeClass("active");
            }
            else if(t.value < 25){
                $("#slider_sell .percent").removeClass("active");
                $("#slider_sell .percent_00").addClass("active");
            }else if(t.value >= 25 && t.value < 50){
                $("#slider_sell .percent").removeClass("active");
                $("#slider_sell .percent_00").addClass("active");
                $("#slider_sell .percent_01").addClass("active");
            }else if(t.value >= 50 && t.value < 75){
                $("#slider_sell .percent").removeClass("active");
                $("#slider_sell .percent_00").addClass("active");
                $("#slider_sell .percent_01").addClass("active");
                $("#slider_sell .percent_02").addClass("active");
            }else if(t.value >= 75 && t.value < 100){
                $("#slider_sell .percent").removeClass("active");
                $("#slider_sell .percent_00").addClass("active");
                $("#slider_sell .percent_01").addClass("active");
                $("#slider_sell .percent_02").addClass("active");
                $("#slider_sell .percent_03").addClass("active");
            }else if(t.value >= 100){
                $("#slider_sell .percent").removeClass("active");
                $("#slider_sell .percent_00").addClass("active");
                $("#slider_sell .percent_01").addClass("active");
                $("#slider_sell .percent_02").addClass("active");
                $("#slider_sell .percent_03").addClass("active");
                $("#slider_sell .percent_04").addClass("active");
            }
            if(sellPrice >0){
                if(floatPointCoinName != "QD"){
                    $("#sellMum").html(returnFloat((sellNum * sellPrice), floatPrice));//设置总价
                }else{
                    $("#sellMum").html(returnFloat((sellNum * sellPrice), 2));//设置总价
                }
                
            }
        }
    });
}

// $('#market_trade_pwd_set').modal({
//     relatedTarget: this 
// });

//  买入操作
var isPwdinfo = true;
function pop_tradeadd_buy(){
    if ( !$.TokenIsNull($.getToken())) {
        if (isSetTradePwd != null && isSetTradePwd != 3 ){
            //  获得买入价格
            var buyPrice = parseFloat($("#buyPrice").val());
            //  获得买入数量
            var buyNum = parseFloat($("#buyNum").val());

            if (buyPrice == "" || buyPrice == null || isNaN(buyPrice)) {
                layer.tips(langPkg.getI18N("qingshurumairujiage"), '#buyPrice', {tips: [3, "#0e9e80"]});
                layer.closeAll('loading');
                return false;
            }
            if (buyNum == "" || buyNum == null  || isNaN(buyNum)) {
                layer.tips(langPkg.getI18N("qingshurumairushuliang"), '#buyNum', {tips: [3, "#0e9e80"]});
                layer.closeAll('loading');
                return false;
            }

            var checkPrice = (new Decimal($("#buyPrice").val()).mul(new Decimal(overbrim.normal_overflow))).toNumber();
            var beyongPrice = (new Decimal(overbrim.recommPrice).mul(new Decimal(overbrim.buy_overflow + overbrim.normal_overflow))).toNumber();
            if(overbrim.buy_overflow > 0){
                if(checkPrice  > beyongPrice){
                    /*layer.confirm(langPkg.getI18N("shifouyiranguadan"), {
                        btn: [langPkg.getI18N("make_sure")] //按钮
                    }, function(){
                        layer.closeAll();
                        // checkPriceFun()
                    });*/
                    layer.msg("委托价格超出市场价格" + overbrim.buy_overflow + "%，请调整出价");
                }else{
                    checkPriceFun()
                }
            }else{
                checkPriceFun()
            }
        } else {
            layer.msg(langPkg.getI18N("ningweishezhijiaoyimima_zhengzaiweiningtiaozhuan"), { time: 2000, icon: 0 }, function () {
                $.beforePage();
                window.location.href = "../security/update_trade_pwd.html";
            })
        }
    }else {
        layer.msg(langPkg.getI18N("ningshangweidenglu_zhengzaiweiningtianzhuan"), { time: 2000, icon: 0 }, function () {
            $.beforePage();
            window.location.href = "../../login.html";
        })
    }

    function checkPriceFun(){
        $.ajaxSendData("", "/api/trade/pwdinfo", function(resData){
            isPwdinfo = resData.data.info;
            if(isPwdinfo == false){
                tradeadd_buy();
            }else{
                $('#market_trade_pwd_buy').modal({
                    relatedTarget: this 
                });
            }
        });
    }
}
function tradeadd_buy() {
    var marketid = $.GetMarketId(function(marketid){
        if ( !$.TokenIsNull($.getToken()) ) {
            if (isSetTradePwd != null && isSetTradePwd != 3 ){
                //加载层-风格3
                /*layer.load(1, {
                    shade: [0.5, '#fff'] //0.1透明度的白色背景
                });*/

                //  获得买入价格
                var buyPrice = parseFloat($("#buyPrice").val());
                //  获得买入数量
                var buyNum = parseFloat($("#buyNum").val());
                //  获得交易密码
                var buyPayPwd = $("#buyPayPwd").val();
                if (buyPrice == "" || buyPrice == null || isNaN(buyPrice)) {
                    layer.tips(langPkg.getI18N("qingshurumairujiage"), '#buyPrice', {tips: [3, "#0e9e80"]});
                    layer.closeAll('loading');
                    return false;
                }
                if (buyNum == "" || buyNum == null  || isNaN(buyNum)) {
                    layer.tips(langPkg.getI18N("qingshurumairushuliang"), '#buyNum', {tips: [3, "#0e9e80"]});
                    layer.closeAll('loading');
                    return false;
                }

                //  组合参数
                if(isPwdinfo == false){
                    var param = {
                        marketId: marketid,
                        num: buyNum ,
                        price: buyPrice
                    };
                    // console.log("无密码")
                }else{
                    if (buyPayPwd == "" || buyPayPwd == null ) {
                        layer.tips(langPkg.getI18N("financial_first4_placeholder3"), '#buyPayPwd', {tips: [3, "#0e9e80"]});
                        layer.closeAll('loading');
                        return false;
                    }
                    var param = {
                        marketId: marketid,
                        num: buyNum ,
                        payPwd: buyPayPwd,
                        price: buyPrice
                    };
                    // console.log(langPkg.getI18N("youmima"))
                }


                $.ajaxSendData(param, "/api/trade/buy", function(resData){
                    layer.msg(langPkg.getI18N("mairucaozuowancheng"), {icon: 1});
                    $("#buyPrice").val("");
                    $("#buyNum").val("");
                    $("#buyPayPwd").val("");
                    $("#buyMum").html("0");
                    $("#sliderLine_buy").attr("style","width:0%;width: 0");
                    $("#sli_buy").attr("style","width: 0");
                    $("#sellPrice").val("");
                    $("#sellNum").val("");
                    $("#sellPayPwd").val("");
                    $("#sellMum").html("0");
                    $("#sliderLine_sell").attr("style","width:0%;width: 0");
                    $("#sli_sell").attr("style","width: 0");
                    reloadPage();
                    getUserAssets(marketid);
                    layer.closeAll('loading');
                    $('#market_trade_pwd_buy').modal("close");
                }, function(resData){
                    layer.msg(resData.msg, {icon: 2}, { icon: 2, time: 2000 });
                    layer.closeAll('loading');
                    // $('#market_trade_pwd_buy').modal("close");
                });
            } else {
                layer.msg(langPkg.getI18N("ningweishezhijiaoyimima_zhengzaiweiningtiaozhuan"), { time: 2000, icon: 0 }, function () {
                    $.beforePage();
                    window.location.href = "../security/update_trade_pwd.html";
                })
            }
            

        }else {
            // layer.msg("请登录", {icon: 2});
            // Signin();
            // Userlogin();
            layer.msg(langPkg.getI18N("ningshangweidenglu_zhengzaiweiningtianzhuan"), { time: 2000, icon: 0 }, function () {
                $.beforePage();
                window.location.href = "../../login.html";
            })

        }
    });
    
}

//  卖出操作
function pop_tradeadd_sell(){
    if ( !$.TokenIsNull($.getToken())) {
        if (isSetTradePwd != null && isSetTradePwd != 3 ){
            //  获得卖出价格
            var sellPrice = parseFloat($("#sellPrice").val());
            //  获得卖出数量
            var sellNum = parseFloat($("#sellNum").val());

            if (sellPrice == "" || sellPrice == null || isNaN(sellPrice)) {
                layer.tips(langPkg.getI18N("qingshurumaichujiage"), '#sellPrice', {tips: [3, "#0e9e80"]});
                layer.closeAll('loading');
                return false;
            }
            if (sellNum == "" || sellNum == null || isNaN(sellNum)) {
                layer.tips(langPkg.getI18N("qingshuumaichushuliang"), '#sellNum', {tips: [3, "#0e9e80"]});
                layer.closeAll('loading');
                return false;
            }
            var checkPrice = (new Decimal($("#sellPrice").val()).mul(new Decimal(overbrim.normal_overflow))).toNumber();
            var beyongPrice = (new Decimal(overbrim.recommPrice).mul(new Decimal(overbrim.normal_overflow - overbrim.sell_overflow))).toNumber();
            if(overbrim.sell_overflow > 0){
                if(checkPrice < beyongPrice){
                    /*layer.confirm(langPkg.getI18N("shifouyiranguadan"), {
                        btn: [langPkg.getI18N("make_sure")] //按钮
                    }, function(){
                        layer.closeAll();
                        // checkPriceFun()
                    });*/
                    layer.msg("委托价格低于市场价格"+ overbrim.sell_overflow + "%，请调整出价");
                }else{
                    checkPriceFun()
                }
            }else{
                checkPriceFun()
            }
        } else {
            layer.msg(langPkg.getI18N("ningweishezhijiaoyimima_zhengzaiweiningtiaozhuan"), { time: 2000, icon: 0 }, function () {
                $.beforePage();
                window.location.href = "../security/update_trade_pwd.html";
            })
        }
        
    }else {
        layer.msg(langPkg.getI18N("ningshangweidenglu_zhengzaiweiningtianzhuan"), { time: 2000, icon: 0 }, function () {
            $.beforePage();
            window.location.href = "../../login.html";
        })

    }
    function checkPriceFun(){
        $.ajaxSendData("", "/api/trade/pwdinfo", function(resData){
            isPwdinfo = resData.data.info;
            if(isPwdinfo == false){
                tradeadd_sell();
            }else{
                $('#market_trade_pwd_sell').modal({
                    relatedTarget: this 
                });
            }
        });
    }
}
function tradeadd_sell() {
    var marketid = $.GetMarketId(function(marketid){
        if ( !$.TokenIsNull($.getToken()) ) {
            if (isSetTradePwd != null &&  isSetTradePwd != 3 ) {
                /*layer.load(1, {
                    shade: [0.5, '#fff'] //0.1透明度的白色背景
                });*/
                //  获得卖出价格
                var sellPrice = parseFloat($("#sellPrice").val());
                //  获得卖出数量
                var sellNum = parseFloat($("#sellNum").val());
                //  获得交易密码
                var sellPayPwd = $("#sellPayPwd").val();

                if (sellPrice == "" || sellPrice == null || isNaN(sellPrice)) {
                    layer.tips(langPkg.getI18N("qingshurumaichujiage"), '#sellPrice', {tips: [3, "#0e9e80"]});
                    layer.closeAll('loading');
                    return false;
                }
                if (sellNum == "" || sellNum == null || isNaN(sellNum)) {
                    layer.tips(langPkg.getI18N("qingshuumaichushuliang"), '#sellNum', {tips: [3, "#0e9e80"]});
                    layer.closeAll('loading');
                    return false;
                }
                //  组合参数
                if(isPwdinfo == false){
                    var param = {
                        marketId: marketid,
                        num: sellNum ,
                        price: sellPrice
                    };
                    // console.log(langPkg.getI18N("wumima"))
                }else{
                    if (sellPayPwd == "" || sellPayPwd == null ) {
                        layer.tips(langPkg.getI18N("financial_first4_placeholder3"), '#sellPayPwd', {tips: [3, "#0e9e80"]});
                        layer.closeAll('loading');
                        return false;
                    }
                    var param = {
                        marketId: marketid,
                        num: sellNum ,
                        payPwd: sellPayPwd,
                        price: sellPrice
                    };
                    // console.log(langPkg.getI18N("youmima"))
                }


                $.ajaxSendData(param, "/api/trade/sell", function(resData){
                    layer.msg(langPkg.getI18N("mnaichucaozuowancheng"), {icon: 1});
                    $("#sellMum").html("0")
                    $("#sellPrice").val("")
                    $("#sellNum").val("")
                    $("#sellPayPwd").val("")
                    reloadPage();
                    getUserAssets(marketid);
                    layer.closeAll('loading');
                    $('#market_trade_pwd_sell').modal("close");
                }, function(resData){
                        layer.msg(resData.msg, {icon: 2}, { icon: 2, time: 2000 });
                        layer.closeAll('loading');
                        // $('#market_trade_pwd_sell').modal("close");
                });
            }else {
                layer.msg(langPkg.getI18N("ningweishezhijiaoyimima_zhengzaiweiningtiaozhuan"), { time: 2000, icon: 0 }, function () {
                    $.beforePage();
                    window.location.href = "../security/update_trade_pwd.html";
                })
            }
        }else {
            // Userlogin();
            layer.msg(langPkg.getI18N("ningshangweidenglu_zhengzaiweiningtianzhuan"), { time: 2000, icon: 0 }, function () {
                $.beforePage();
                window.location.href = "../../login.html";
            })
        }
    });
    
}

// 忘记交易密码
$(".market_view_body").on("click", ".forg_trade", function(){
    $.beforePage()
})
function setTradeTime(){
    $('#market_trade_pwd_set').modal({
        relatedTarget: this 
    });
    setTimesFun();
    function setTimesFun(){
        var setTimes = $(".setTimes");
        setTimes.on("click", "a", function(){
            var idx = $(".setTimes a").index($(this));
            $(this).addClass("active").siblings().removeClass("active");
        })
    }
    getUserInfoquery();
    function getUserInfoquery() {
        $.ajaxSendData("", "/api/user/paypassword/query", function(resData){
            var type = resData.data.type;
            if(type != 0){
                for(var i = 0; i < $(".setTimes a").length; i++){
                    if($(".setTimes a").eq(i).attr("data-type") == type){
                        $(".setTimes a").removeClass("active");
                        $(".setTimes a").eq(i).addClass("active");
                        break;
                    }
                }
            }
        });
    }
}
//  绑定操作
function setTrade() {
    var type = $(".setTimes").find(".active").attr("data-type");
    var payPwd = $("#tb_oldpwd").val();
    if(typeof type == "undefined"){
        layer.tips(langPkg.getI18N("qingxuanzejiaoyiyanzhengshezhi"), ".setTimes", {
            tips: [3, "#0e9e80"], time: 2000
        });
        return false;
    }

    if(payPwd==""){
        layer.tips(langPkg.getI18N("financial_first4_placeholder3"), '#tb_oldpwd', { tips: [3, "#0e9e80"], time: 2000, end: function () { $("#setButton").removeAttr("disabled"); } });
        return false;
    }

    var param = {
        type: type,
        payPwd: payPwd
    };

    $.ajaxSendData(param, "/api/user/paypassword/update", function(resData){
        $("#market_trade_pwd_buy").modal("close");
        $("#market_trade_pwd_sell").modal("close");
        $("#market_trade_pwd_set").modal("close");
    });
}


// 自动填价格
function autotrust(_this, type, cq) {
    if (type == 'sell' || type == 'buy') {
        $('#buyPrice').val($(_this).find(".t2").html());
        if ($("#available_rmb").val() > 0) {
            $("#buy_max").html(returnFloat(($("#available_rmb").val() / $('#buyPrice').val()), floatNumber));
        }
        if ($('#buyNum').val()) {
            if(floatPointCoinName != "QD"){
                $("#buyMum").html(returnFloat(($('#buyNum').val() * $('#buyPrice').val()), floatPrice));
            }else{
                $("#buyMum").html(returnFloat(($('#buyNum').val() * $('#buyPrice').val()), 2));
            }
        }
        $('#sellPrice').val($(_this).find(".t2").html());
        /*if ($("#available_xnb").val() > 0) {
            $("#sell_max").html(returnFloat($("#available_xnb").val() / $('#sellPrice').val(), floatPrice));
        }*/
        if ($('#sellNum').val()) {
            if(floatPointCoinName != "QD"){
                $("#sellMum").html(returnFloat(($('#sellNum').val() * $('#sellPrice').val()), floatPrice));
            }else{
                $("#sellMum").html(returnFloat(($('#sellNum').val() * $('#sellPrice').val()), 2));
            }
            
        }

    }
    /*if (type == 'buy') {
        $('#sellPrice').val($(_this).children().eq(cq).html()).css({'color': '#c0bebb'});
        if ($("#available_xnb").val() > 0) {
            $("#sell_max").html($("#available_xnb").val());
        }
        if ($('#sellNum').val()) {
            $("#sellMum").html(($('#sellNum').val() * $('#sellPrice').val()).toFixed(8) * 1);
        }
    }*/
}

//  获得交易市场列表
function getMarketList() {
    var param = {
        id: "",
        sort: 0,
        keyword:searchKey
    };

    $.ajaxSendData(param, "/api/market/change", function(resData){
        marketListResultHandler(resData);
    });
    
}

function marketListResultHandler(resData){
    if ( resData.data.length > 0 ) {
        var lengths = resData.data.length;
        // 主区
        var j = 0;
        var qd = 0;
        var usdt = 0;
        var btc = 0;
        var eth = 0;
        var m = 0;
        var qdArray = new Array();
        var usdtArray = new Array();
        var btcArray = new Array();
        var ethArray = new Array();
        var defaultArray = new Array();     // 自选
        

        // 创新区
        var cxqd = 0;
        var cxusdt = 0;
        var cxbtc = 0;
        var cxeth = 0;
        var cxm = 0;
        var cxqdArray = new Array();
        var cxusdtArray = new Array();
        var cxbtcArray = new Array();
        var cxethArray = new Array();
        var cxdefaultArray = new Array();     // 自选

        for (var i = 0; i < lengths; i++) {
            var nameEn = resData.data[i].name_en.split("/");
            var resultcoin = nameEn[0];
            var result = nameEn[nameEn.length - 1];
            // 主区
            if(resData.data[i].region == 1){
                // 自选有登陆
                if (!$.TokenIsNull($.getToken())) {
                    for(var k = 0; k < collectArr.length; k++){
                        if(collectArr[k] == resData.data[i].id){
                            defaultArray[m] = resData.data[i];
                            m++;
                        }
                    }
                }else{
                    if (getCookiesID(resData.data[i].id))
                    {
                        defaultArray[m] = resData.data[i];
                        m++;
                    }
                }

                if (result == 'QD') {
                    qdArray[qd] = resData.data[i];
                    qd++;
                }

                if (result == 'USDT') {
                    usdtArray[usdt] = resData.data[i];
                    usdt++;
                }

                if (result == 'BTC') {
                    btcArray[btc] = resData.data[i];
                    btc++;
                }

                if (result == 'ETH') {
                    ethArray[eth] = resData.data[i];
                    eth++;
                }
            }
            // 创新区
            else{
                // 自选有登陆
                if (!$.TokenIsNull($.getToken())) {
                    for(var k = 0; k < collectArr.length; k++){
                        if(collectArr[k] == resData.data[i].id){
                            cxdefaultArray[cxm] = resData.data[i];
                            cxm++;
                        }
                    }
                }else{
                    if (getCookiesID(resData.data[i].id))
                    {
                        cxdefaultArray[cxm] = resData.data[i];
                        cxm++;
                    }
                }

                if (result == 'QD') {
                    cxqdArray[cxqd] = resData.data[i];
                    cxqd++;
                }

                if (result == 'USDT') {
                    cxusdtArray[cxusdt] = resData.data[i];
                    cxusdt++;
                }

                if (result == 'BTC') {
                    cxbtcArray[cxbtc] = resData.data[i];
                    cxbtc++;
                }

                if (result == 'ETH') {
                    cxethArray[cxeth] = resData.data[i];
                    cxeth++;
                }
            }
        }

        // 主区
        //  QD
        templateCoinList(qdArray, "list_qdList", $("#qdList"))
        templateCoinList(cxqdArray, "cxlist_qdList", $("#cxqdList"))
        //  usdt
        templateCoinList(usdtArray, "list_usdtList", $("#usdtList"))
        templateCoinList(cxusdtArray, "cxlist_usdtList", $("#cxusdtList"))
        //  btc
        templateCoinList(btcArray, "list_btcList", $("#btcList"))
        templateCoinList(cxbtcArray, "cxlist_btcList", $("#cxbtcList"))
        //  eth
        templateCoinList(ethArray, "list_ethList", $("#ethList"))
        templateCoinList(cxethArray, "cxlist_ethList", $("#cxethList"))
        //zx
        templateCoinList(defaultArray, "list_zxList", $("#zxList"))
        templateCoinList(cxdefaultArray, "cxlist_zxList", $("#cxzxList"))
        // 创新区

        /*
        * templateNameArray     // 模版数组
        * templateName          // 模版名
        * CoinNameId            // 展示数据的ID
        */
        function templateCoinList(templateNameArray, templateName, templateId){
            // 显示数据
            var da = { "list": templateNameArray };
            var _html = template(templateName, da);   //template("模版名","数据集")
            templateId.html(_html);

            // 是否显示标题
            var title = templateId.parent().find(".panel_title");
            if(templateNameArray.length > 0){
                title.show();
            }else{
                title.hide();
            }
        }
        // 自选为空时
        if(defaultArray.length == 0 && cxdefaultArray == 0){
            $("#nav-self").addClass("notContent");
            $("#zxList").html(langPkg.getI18N("zanwuneirong"));
        }else{
            $("#nav-self").removeClass("notContent");
        }

        // 弱化交易对
        $.weakenCoin($("#zxList .gay_name"));
    }
}


var marketCoinNumber = sessionStorage.marketNumber;
if (sessionStorage && sessionStorage.marketNumber == "" || typeof sessionStorage.marketNumber == "undefined"){
    setMarketActive(1)
}else{
    setMarketActive(marketCoinNumber)
}

function setMarketNumber(num){
    var sessionStorage;
    if(window.sessionStorage){
        sessionStorage = window.sessionStorage;
    }
    sessionStorage.marketNumber = num;
}
function setMarketActive(num){
    var leftMarket = $(".market_coin_area_wrap")
    var MarketNav = leftMarket.find(".market_nav .item");
    var Marketbox = leftMarket.find(".panel_list");
    MarketNav.eq(num).addClass("active").siblings().removeClass("active");
    Marketbox.eq(num).addClass("active").siblings().removeClass("active");
}

switchMarketList();
function switchMarketList(){
    var leftMarket = $(".market_coin_area_wrap")
    var MarketNav = leftMarket.find(".market_nav");
    var Marketbox = leftMarket.find(".panel_list");
    MarketNav.on("click", ".item", function(){
        var i = $(".market_nav .item").index($(this));
        $(this).addClass("active").siblings().removeClass("active");
        Marketbox.eq(i).addClass("active").siblings().removeClass("active");
    })
}
switchMarketbuysell();
function switchMarketbuysell(){
    $(".trans-box-nav a").on("click", function(){
        var idx = $(".trans-box-nav a").index($(this));
        $(this).addClass("active").siblings().removeClass("active");
        $(".trans-box-order .trans-box-list").eq(idx).addClass("active").siblings().removeClass("active");
    })
}

//  根据 交易市场 查询 交易市场数据
function getMarketInfo(marketID) {
    var param = {
        id: marketID
    };

    $.ajaxSendData(param, "/api/market/search", function(resData){
        marketInfoResultHandler(resData);
    });
    
}

function marketInfoResultHandler(resData){
    $("#nameEnKTitle").html(namtie = resData.data[0].name_en.split("/")[0] + "/<em class='gray'>"+ resData.data[0].name_en.split("/")[1] +"</em>");
    $("#nameEnKTitle2").html(resData.data[0].name_en);
    $("#nameEnKTitle3").html(resData.data[0].name_en);
    $("#newPricenKTitle").html(returnFloat(resData.data[0].newPrice, floatPrice));
    $("#maxPriceKTitle").html(resData.data[0].maxPrice);
    $("#minPriceKTitle").html(resData.data[0].minPrice);

    //  买入卖出 显示效果
    //  设置最大可买和最大可卖
    $("#maxBuyName").html(getCoinName(resData.data[0].name_en));
    $("#maxBuyNam2").html(getCoinName(resData.data[0].name_en));
    $("#maxSellName").html(getCoinName(resData.data[0].name_en));
    //  设置按钮显示效果
    $("#getCoinName1").html(getCoinName(resData.data[0].name_en));
    $("#getCoinName2, .getCoinName2").html(getCoinName(resData.data[0].name_en));
    $("#getCoinName3").html(getCoinName(resData.data[0].name_en));
    //  设置总价币种显示
    $("#getSellCoinName1").html(getSellCoinName(resData.data[0].name_en));
    $("#getSellCoinName2").html(getSellCoinName(resData.data[0].name_en));
    $("#getSellCoinName3").html(getSellCoinName(resData.data[0].name_en));
    $("#getSellCoinName4").html(getSellCoinName(resData.data[0].name_en));
    $("#getSellCoinName5").html(getSellCoinName(resData.data[0].name_en));
    $("#getSellCoinName6").html(getSellCoinName(resData.data[0].name_en));
    var change = resData.data[0].change;

    if ( change >= 0 ){
        $("#changeKTitle").html("+" + $.cutRoundNum(change,2) + "%").removeClass("sellcolor").addClass("buycolor");
        $(".chpris .rise").removeClass("sellcolor").addClass("buycolor");
    }else {
        $("#changeKTitle").html($.cutRoundNum(change,2) + "%").removeClass("buycolor").addClass("sellcolor");
        $(".chpris .rise").removeClass("buycolor").addClass("sellcolor");
    }

    /*var mum = resData.data[0].newPrice *  resData.data[0].volume;
    if ( mum > 10000 ){
        $("#volumeKTitle").html( returnFloat((mum / 10000), floatPrice) );
    }else {
        $("#volumeKTitle").html( returnFloat(mum , floatPrice));
    }*/

    $("#volumeKTitle").html(resData.data[0].volume);
}

// 收藏按钮
function collectFun(id){
    $(".collectCoin" + id).show().on("click", function(){
        if($(this).hasClass("active")){
            $(this).removeClass("active")
        }else{
            $(this).addClass("active")
        }
        setCookiesID(id);
    });
}


/**
 * 获取网站列表，只调用一次
 */
function getMarketInfoOnce(marketID) {
    var param = {
        id: ""
    };

    $.ajaxSendData(param, "/api/market/search", function(resData){
        var marketName = "";
        //  根据交易市场名称，去动态赋予样式
        for(var i = 0; i < resData.data.length; i++){
            if(resData.data[i].id == marketID){
                marketName = resData.data[i].name_en;
            }
        }
        //  获得专区名
        var partName = marketName.substr(marketName.indexOf('/')+1,marketName.length);

        //  获得专区对应的币种名称
        var partCoinName = marketName.substr(0,marketName.indexOf('/'));
        $("#nav-self").removeClass("am-active");
        $("#nav-btc").removeClass("am-active");
        $("#nav-eth").removeClass("am-active");
        $("#nav-qd").removeClass("am-active");
        $("#nav-usdt").removeClass("am-active");
        $("#tab-1").removeClass("am-active");
        $("#tab-2").removeClass("am-active");
        $("#tab-3").removeClass("am-active");
        $("#tab-4").removeClass("am-active");
        $("#tab-5").removeClass("am-active");
        // 查看更多的链接
        $("#showMore").attr("href", "../usercenter/entrustlist.html?marketName=" + marketName)
        if ( partName == "QD" ){
            var oTbody = $("#qdList");
            var lengths = oTbody.children().length;
            for (var i=0;i<lengths;i++ ){
                if ( oTbody.find("tr")[i].getAttribute("coinname") == partCoinName ){
                    oTbody.find("tr")[i].className += " active";
                }
            }
            $("#nav-qd").addClass("am-active");
            $("#tab-2").addClass("am-active");
            $("#div_tab").tabs();
            $(".markecoin").html(" (" + partName + ")")
        }else if ( partName == "USDT" ){
            var oTbody = $("#usdtList");
            var lengths = oTbody.children().length;
            for (var i=0;i<lengths;i++ ){
                if ( oTbody.find("tr")[i].getAttribute("coinname") == partCoinName ){
                    oTbody.find("tr")[i].className += " active";
                }
            }
            $("#nav-usdt").addClass("am-active");
            $("#tab-3").addClass("am-active");
            $("#div_tab").tabs();
            $(".markecoin").html(" (" + partName + ")")
        }else if ( partName == "BTC" ){
            var oTbody = $("#btcList");
            var lengths = oTbody.children().length;
            for (var i=0;i<lengths;i++ ){
                if ( oTbody.find("tr")[i].getAttribute("coinname") == partCoinName ){
                    oTbody.find("tr")[i].className += " active";
                }
            }
            $("#nav-btc").addClass("am-active");
            $("#tab-4").addClass("am-active");
            $("#div_tab").tabs();
            $(".markecoin").html(" (" + partName + ")")
        } else if (partName == "ETH") {
            var oTbody = $("#ethList");
            var lengths = oTbody.children().length;
            for (var i = 0; i < lengths; i++) {
                if (oTbody.find("tr")[i].getAttribute("coinname") == partCoinName) {
                    oTbody.find("tr")[i].className += " active";
                }
            }
            $("#nav-eth").addClass("am-active");
            $("#tab-5").addClass("am-active");
            $("#div_tab").tabs();
            $(".markecoin").html(" (" + partName + ")")
        }
    });
}


//  根据交易市场ID查询当前交易市场数据
function getMarketInfoById(marketID) {
    var param = {
        id: marketID
    };

    $.ajaxSendData(param, "/api/market/list", function(resData){
        marketInfoByIdResultHandler(resData);
    });
    
}

function marketInfoByIdResultHandler(resData){
    $("body").data("marketInfo",resData);
    var datas = resData.data[0];
    // console.log(datas);
    var coinName = datas.coinName;
    floatPointCoinName = resData.data[0].pointCoinName;
    floatCoinNames = resData.data[0].coinName;
    floatNumber = resData.data[0].floatNumber;
    floatPrice = resData.data[0].floatPrice;
    //  设置最佳买价，最佳卖价
    /*$("#buy_best_price").html(returnFloat(datas.sellPrice, floatPrice));
    $("#sell_best_price").html(returnFloat(datas.buyPrice, floatPrice));*/
    $("#buy_best_priceS").val(returnFloat(datas.sellPrice, floatPrice));
    $("#sell_best_priceS").val(returnFloat(datas.buyPrice, floatPrice));

    /* //  买入手续费
    if (datas.feeBuy == ''){
        $("#feeBuy").html(0);
    }else {
        $("#feeBuy").html(parseFloat(datas.feeBuy).toFixed(2));
    }
    //  卖出手续费
    if (datas.feeSell == '') {
        $("#feeSell").html(0);
    }else {
        $("#feeSell").html(parseFloat(datas.feeSell).toFixed(2));
    } */
}

//  根据交易市场ID查询对应的币种信息
function getCoinDetails(id){
    var hot = 1;
    var pageSize = 25;
    var pageTo = 1;

    var param = {
        hot: hot,
        marketId: id,
        keyword: "",
        pageSize: pageSize,
        pageTo: pageTo,
        sort: 3
    };

    $.ajaxSendData(param, "/api/market/details", function(resData){
        $("#coinJsEn1").html(langPkg.getI18N("liaojie") + resData.data.jsEn + langPkg.getI18N("bi"));
        //  这里需要设置默认图片
        // $("#coinImg").attr("src",$.imgFilePath() + resData.data.img);
        $("#coinJsEn2").html(langPkg.getI18N("guanyu")+resData.data.jsEn );
        $("#coinJsContent").html(resData.data.jsContent );
        $("#coinTitle").html(langPkg.getI18N("zhongwenming")+resData.data.title );
        $("#coinJsEn3").html(langPkg.getI18N("yinwengming")+resData.data.jsEn );
        $("#coinName").html(langPkg.getI18N("yingwenjiancheng")+resData.data.name );
        $("#coinCsDevelop").html(langPkg.getI18N("yanfazhe")+resData.data.csDevelop );
        $("#coinCsAlgorithm").html(langPkg.getI18N("hexinsuanfa")+resData.data.csAlgorithm );
        $("#coinCsReleaseTime").html(langPkg.getI18N("faburiqi")+resData.data.csReleaseTime );
        $("#coinCsBlockSpeed").html(langPkg.getI18N("qukuaisudu")+resData.data.csBlockSpeed );
        $("#coinCsCount").html(langPkg.getI18N("faxingzongliang")+resData.data.csCount );
        $("#coinCsStock").html(langPkg.getI18N("cunliang")+resData.data.csStock );
        $("#coinCsProve").html(langPkg.getI18N("zhengmingfangshi")+resData.data.csProve );
        $("#coinCsDifficulty").html(langPkg.getI18N("nandutiaozheng")+resData.data.csDifficulty );
        $("#coinCsReward").html(langPkg.getI18N("qukuaijiangli")+resData.data.csReward );
        $("#coinCsCharacter").html(langPkg.getI18N("zhuyaotese")+resData.data.csCharacter );
        $("#coinCsShort").html(langPkg.getI18N("buzuzhichu")+resData.data.csShort );
    });
}

//  实时成交
function getTransactionList(marketid) {
    var pageSize = "";
    var pageTo = 1;

    var param = {
        marketId: marketid,
        pageSize: pageSize,
        pageTo: pageTo
    };

    $.ajaxSendData(param, "/api/trade/log/list", function(resData){
        transactionListResultHandler(resData);
    })

    // $.ajax({
    //     type: "POST",
    //     url: $.getGateway() + "/api/trade/log/list",
    //     data: JSON.stringify({ "object": strObgect, "sign": strSign }),
    //     async: true,
    //     dataType: "json",
    //     contentType: "application/json;charset=UTF-8",
    //     beforeSend: function (xhr) {
    //         var Authorization = $.getToken();
    //         xhr.setRequestHeader("Access-Control-Allow-Origin", "*");
    //         xhr.setRequestHeader("Accept", "*/*");
    //         xhr.setRequestHeader("Access-Control-Max-Age", "3600");
    //         xhr.setRequestHeader("Authorization", "Bearer " + Authorization);
    //     },
    //     error: function (XMLHttpRequest, textStatus, errorThrown) {
    //         data = XMLHttpRequest.responseJSON;
    //     },
    //     success: function (resData) {
    //      transactionListResultHandler(resData);
    //     }
    // });
}

function transactionListResultHandler(resData){
    var buySellLength = resData.data.buys.length;
    if ( buySellLength > 0 ){
        //  买入实时成交
        var da1 = {"list": resData.data.buys }
        // console.log(da1);
        var _html1 = template('buy_list', da1);//top12
        $("#buyList").html(_html1)

        for(var i = 0; i < $(".reg-time-none").length; i++){
            var text1 = $(".reg-time-none").eq(i).html().split(/\s{1}/)[0];
            var text2 = $(".reg-time-none").eq(i).html().split(/\s{1}/)[1];
            $(".reg-time-none").eq(i).html(text2)
        }
        /*if($("#buyPrice").val() == "" || $("#buyPrice").val() == 0 || isNaN($("#buyPrice").val())){
            if(parseFloat($("#buy_best_price").text()) > 0){
                $("#buy_max").text(returnFloat((parseFloat($("#available_rm2").text()) / parseFloat($("#buy_best_price").text())), floatPrice))
            }
            
        }
        if($("#sellPrice").val() == "" || $("#sellPrice").val() == 0 || isNaN($("#sellPrice").val())){
            if(parseFloat($("#buy_best_price").text()) > 0){
                $("#sell_max").text($("#available_xn2").text())
            }
        }*/
        $("#buy_best_price, #sell_best_price").html(returnFloat(resData.data.buys[0].price, floatPrice));
    }

    /*var buyLength = resData.data.buys.length;
    var sellLength = resData.data.sells.length;
    if (resData.code == 200) {
        if ( buyLength > 0 || sellLength > 0 ){
            //  买入实时成交
            var da1 = {"list": resData.data.buys }
            var _html1 = template('buy_list', da1);//top12
            $("#buyList").html(_html1)

            //  卖出实时成交
            var da2 = {"list": resData.data.sells }
            var _html2 = template('sell_list', da2);//top12
            $("#sellList").html(_html2)

            for(var i = 0; i < $(".reg-time-none").length; i++){
                var text1 = $(".reg-time-none").eq(i).html().split(/\s{1}/)[0];
                var text2 = $(".reg-time-none").eq(i).html().split(/\s{1}/)[1];
                $(".reg-time-none").eq(i).html(text2)
            }
        }
    }*/
}


//  当前委托
function getLimitTradeList(marketID) {
    var param = {
        marketId:marketID,
        status: 0
    };


    $.ajaxSendData(param, "/api/trade/user/list", function(resData){
        limitTradeListResultHandler(resData);
    });

    
}

function limitTradeListResultHandler(resData){
        var limitList = new Array();
        var lengths = resData.data.length;
        var j = 0;
        for ( i = 0 ;i <lengths ; i++ ){
            if ( resData.data[i].status == 0 ){
                limitList[j] = resData.data[i];
                j++;
            }
        }
        var da = {"list": limitList}
        var _html = template('limit_tradeList', da);//top12
        $("#limitTradeList").html(_html);
        $.weakenText($("#limitTradeList .reg-text"));
        
        langPkg.loadLanguage("financial_first5_type2");
        langPkg.loadLanguage("financial_first5_type4");
        langPkg.loadLanguage("financial_first5_type5");
        langPkg.loadLanguage("financial_first5_type6");
        langPkg.loadLanguage("financial_first5_type3");
        langPkg.loadLanguage("chexiao");
}

//  历史委托
/*function getHistoryTradeList(marketID) {
    var param = {
        marketId:marketID
    };


    $.ajaxSendData(param, "/api/trade/user/list", function(resData){
        historyTradeListResultHandler(resData);
    });
    
}*/
function historyTradeListResultHandler(resData){
    var da = {"list": resData.data};
    var _html = template('history_tradeList', da);//top12
    $("#historyTradeList").html(_html)
    $.weakenText($("#historyTradeList .reg-text"));

    langPkg.loadLanguage("financial_first5_type2");
    langPkg.loadLanguage("financial_first5_type4");
    langPkg.loadLanguage("financial_first5_type5");
    langPkg.loadLanguage("financial_first5_type6");
    langPkg.loadLanguage("financial_first5_type3");
    langPkg.loadLanguage("chexiao");
    
}

//  撤销委托
function withdrawal(id) {
    layer.confirm(langPkg.getI18N("ningquedingyaochexiaoweituo"), {
        btn: [langPkg.getI18N("make_sure"),langPkg.getI18N("quxiao")] //按钮
    }, function(){
        var param = {
            tradeId: id
        };
        $.ajaxSendData(param, "/api/trade/entrust/revoke", function(resData){
            layer.closeAll();
            layer.msg(langPkg.getI18N("chexiaocaozuowancheng"), {icon: 1});
            reloadPage();
        });
    });
}

//  交易市场行情
var Max_Sell_Count = 0;     // 买最高价
var Max_Buy_Count = 0;      // 卖最高价
var Max_All_Count = 0;      // 总最高价
var tradeFlag = true;
function GetTradeingMarketList(marketid) {
    var hot = 1;
    var pageSize = 25;
    var pageTo = 1;

    var param = {
        hot: hot,
        marketId: marketid,
        keyword: "",
        pageSize: pageSize,
        pageTo: pageTo,
        sort: 3
    };

    var strObgect = $.toBase64(param);
    var strSign = $.toSign(strObgect);
    $.ajax({
        type: "POST",
        url: $.getGateway() + "/api/trade/quotation",
        data: JSON.stringify({ "object": strObgect, "sign": strSign }),
        async: true,
        dataType: "json",
        contentType: "application/json;charset=UTF-8",
        beforeSend: function (xhr) {
            var Authorization = $.getToken();
            xhr.setRequestHeader("Access-Control-Allow-Origin", "*");
            xhr.setRequestHeader("Accept", "*/*");
            xhr.setRequestHeader("Access-Control-Max-Age", "3600");
            xhr.setRequestHeader("Authorization", "Bearer " + Authorization);

            //  判断当前浏览器语言
            /*var currentLang = navigator.language;   //判断除IE外其他浏览器使用语言
            if (!currentLang) {//判断IE浏览器使用语言
                currentLang = navigator.browserLanguage;
            }
            currentLang = currentLang.toLowerCase();

            var name = getCookie("ATcoinAcceptLanguage");
            if ( name != "" ){
                xhr.setRequestHeader("Accept-language", name);
            } else {
                switch (currentLang){
                    case "zh-cn":
                        xhr.setRequestHeader("Accept-language", "zh-CN");
                        break;
                    case "zh-CN":
                        xhr.setRequestHeader("Accept-language", "zh-CN");
                        break;
                    case "en-us":
                        xhr.setRequestHeader("Accept-language", "en-US");
                        break;
                    case "en-US":
                        xhr.setRequestHeader("Accept-language", "en-US");
                        break;
                    default :
                        xhr.setRequestHeader("Accept-language", "zh-CN");
                        break;
                }
            }*/
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            data = XMLHttpRequest.responseJSON;

        },

        success: function (resData) {
            tradeingMarketListResultHandler(resData);
        }
    });
}

// 刷新实时成交价
function tradeingMarketListResultHandler(resData){
    $("body").removeClass("tradeloading");
    $(".list_tit").css("visibility","visible")
    $(".newprice-middle").css("visibility","visible")
    var sellList = new Array();
    var j = 0;
    Max_Sell_Count = resData.data.maxShell;
    Max_Buy_Count = resData.data.maxBuy;
    if(parseFloat(Max_Sell_Count) >= parseFloat(Max_Buy_Count)){
        Max_All_Count = Max_Sell_Count;
    }else{
        Max_All_Count = Max_Buy_Count;
    }
    var da = {"list": resData.data.tradeByShell};
    var _html = template('Sell2_List', da);//top12
    $("#marketselllist").html(_html);
    var da2 = {"list": resData.data.tradeByBuy};
    _html = template('Buy2_List', da2);//top12
    $("#marketbuylist").html(_html);
    langPkg.loadLanguage("mai1");
    langPkg.loadLanguage("mai");
    
    /*var tradeValue = parseInt($(".list_tit").find(".t1 span").attr("data-trade"));
    var fixedValue = parseInt($("#marketselllist").find("li").eq(0).height());
    $(".list_tit").off().on("click", ".t1", function(){
        if(tradeFlag){
            $(this).parent().find(".select_tt").show();
            tradeFlag = false;  
        }else{
            $(this).parent().find(".select_tt").hide();
            tradeFlag = true;  
        }
        
    })
    
    $(".select_tt").off().on("click", "a", function(){
        var idx = $(this).index();
        tradeValue = $(this).attr("data-trade");
        $(this).parents(".list_tit").find("span").attr("data-trade", tradeValue);
        $(this).parents(".list_tit").find("span").text($(this).text());
        $(".select_tt").hide();
        tradeFlag = true;
        // console.log(resData.data.tradeByShell.length, fixedValue * resData.data.tradeByShell.length)
        if(fixedValue * resData.data.tradeByShell.length > fixedValue * tradeValue){
            $(".newprice-sell").height(fixedValue * tradeValue);
        }else{
            $(".newprice-sell").height(fixedValue * resData.data.tradeByShell.length);
        }

        if(fixedValue * resData.data.tradeByBuy.length > fixedValue * tradeValue){
            $(".newprice-buy").height(fixedValue * tradeValue);
        }else{
            $(".newprice-buy").height(fixedValue * resData.data.tradeByBuy.length);
        }
        return false;
    })

    if(fixedValue * resData.data.tradeByShell.length > fixedValue * tradeValue){
        $(".newprice-sell").height(fixedValue * tradeValue);
    }else{
        $(".newprice-sell").height(fixedValue * resData.data.tradeByShell.length);
    }

    if(fixedValue * resData.data.tradeByBuy.length > fixedValue * tradeValue){
        $(".newprice-buy").height(fixedValue * tradeValue);
    }else{
        $(".newprice-buy").height(fixedValue * resData.data.tradeByBuy.length);
    }*/
}
// 切换买卖实时成交价
var realTime = ["all", "buy", "sell"];
$(".real-time-btn").on("click", "a", function(){
    var i = $(".real-time-btn a").index($(this))
    var parentObj = $(this).parents(".newprice-list");
    parentObj.attr("class", "newprice-list");
    parentObj.addClass("newprice-list-" + realTime[i])
})
function getCookie(key) {
    try {
        var value = $.cookie(key);
        return undefinedCheck(value);
    } catch (e) {
        return "";
    }
}


//  回车搜索事件
$("#search").bind('keyup change',function (e) {
    // 兼容FF和IE和Opera
    var theEvent = e || window.event;
    // if (e.keyCode == 13) {
        //  通过市场ID拿到当前市场信息
    searchKey = $("#search").val().toUpperCase();
        // getMarketList();
    // }
});

// 交易滑条
$("body").data("marketid",$.GetMarketId());
marketID = $("body").data("marketid");
/*$("body").data("marketInfo", $.GetMarketInfo())
var marketInfoResData = $("body").data("marketInfo");

var market_round = marketInfoResData.data[0].round;
var market_round_num = 8 - market_round;*/

//  输入框绑定
function toNum(num, round) {
    return Math.round(num * Math.pow(10, round) - 1) / Math.pow(10, round);
}

$('#buyPrice,#buyNum,#sellPrice,#sellNum').css("ime-mode", "disabled").bind('keyup change', function () { 
    var searchVal = $(this).val();
    if(searchVal == ""){
        return;
    }
    if((/[^\d^\.]+/g).test(searchVal)){
        $(this).val(searchVal.replace(/[^\d^\.]+/g, ""));
    }  
    if($(this).val() >= 999999999){
        $(this).val(999999999)
    }
    
    if($(this).val().indexOf(".") != -1){
        var strVal = $(this).val().split(".");
        if(strVal[1].length > 9){
           $(this).val( strVal[0] + "." + strVal[1].substring(0, 9))
        }
    }
    
    var tb_id = $(this).attr("id");
    if (tb_id == "buyPrice"){
        $("#buy_limit_math_price").html(returnFloat(new Decimal($("#buyPrice").val()).mul(new Decimal(recommendPrice)).toNumber(), floatPrice));
    }else if(tb_id == "sellPrice"){
        $("#sell_limit_math_price").html(returnFloat(new Decimal($("#sellPrice").val()).mul(new Decimal(recommendPrice)).toNumber(), floatPrice));
    }
    if (tb_id == "buyPrice" || tb_id == "buyNum") {
        var buyprice = $('#buyPrice').val();
        var buynum = $('#buyNum').val();
        var buymum = (new Decimal(Number($('#buyPrice').val())).mul(new Decimal(Number($('#buyNum').val())))).toNumber();
        var myrmb = $("#available_rmb").val();
        buymum = getFullNum(buymum);

        var buykenum = 0;
        if (myrmb > 0) {
            buykenum = (new Decimal(myrmb).div(new Decimal(buyprice))).toNumber();
        }
        if (buyprice != null && buyprice.toString().split(".") != null && buyprice.toString().split(".")[1] != null) {
            if (buyprice.toString().split('.')[1].length > floatPrice) {
                $('#buyPrice').val(returnFloat(buyprice, floatPrice));
            }
        }
        if (buynum != null && buynum.toString().split(".") != null && buynum.toString().split(".")[1] != null) {
            if (buynum.split('.')[1].length > floatNumber) {
                $('#buyNum').val(returnFloat(buynum, floatNumber));
            }
        }
        if (buymum != null && buymum > 0) {
            if(floatPointCoinName != "QD"){
                $('#buyMum').html(returnFloat(buymum, floatPrice));
            }else{
                $('#buyMum').html(returnFloat(buymum, 2));
            }
        }
        if (buykenum != null && buykenum > 0 && buykenum != 'Infinity') {
            $('#buy_max').html(returnFloat(buykenum, floatNumber));
        }
    }
    else {
        var sellprice = $('#sellPrice').val();
        var sellnum = $('#sellNum').val();
        var sellmum = (new Decimal(Number($('#sellPrice').val())).mul(new Decimal(Number($('#sellNum').val())))).toNumber();
        var myxnb = $("#available_xnb").val();
        sellmum = getFullNum(sellmum);
        var sellkenum = 0;
        if(myxnb>0 ){
            sellkenum = myxnb;
        }
        if (myxnb > 0) {
            sellkenum = (new Decimal(myxnb).div(new Decimal(sellprice))).toNumber();
        }
        if (sellprice != null && sellprice.toString().split(".") != null && sellprice.toString().split(".")[1] != null) {
            if (sellprice.toString().split('.')[1].length > floatPrice) {
                $('#sellPrice').val(returnFloat(sellprice, floatPrice));
            }
        }
        if (sellnum != null && sellnum.toString().split(".") != null && sellnum.toString().split(".")[1] != null) {
            if (sellnum.toString().split('.')[1].length > floatNumber) {
                $('#sellNum').val(returnFloat(sellnum, floatNumber));
            }
        }
        if (sellmum != null && sellmum > 0) {
            if(floatPointCoinName != "QD"){
                $('#sellMum').html(returnFloat((sellmum), floatPrice));
            }else{
                $('#sellMum').html(returnFloat((sellmum), 2));
            }
        }
        /*if (sellkenum != null && sellkenum > 0 && sellkenum != 'Infinity') {
            $('#sell_max').html(returnFloat(myxnb, floatPrice));
        }
        if(sellkenum!=null&&sellkenum>0&&sellkenum!='Infinity'){
            $('#sell_max').html(returnFloat(sellkenum, floatPrice));
        }*/
    }

    function getFullNum(num){
        //处理非数字
        if(isNaN(num)){return num};
        
        //处理不需要转换的数字
        var str = ''+num;
        if(!/e/i.test(str)){return num;};
        
        return (num).toFixed(18).replace(/\.?0+$/, "");
    }
}).bind("paste", function () {
    return false;
}).bind("blur", function () {
    if (this.value.slice(-1) == ".") {
        this.value = this.value.slice(0, this.value.length - 1);
    }
}).bind("keypress", function (e) {
    if($(this).val() == 0 && $(this).val().indexOf(".") == -1 && $(this).val().length > 9){
        $(this).val($(this).val().substring(0, 9));
    }
    var code = (e.keyCode ? e.keyCode : e.which); //兼容火狐 IE
    if (this.value.indexOf(".") == -1) {
        return (code >= 48 && code <= 57) || (code == 46) || code == 8;
    } else {
        return code >= 48 && code <= 57 || code == 8;
    }
});

template.helper('_imgPath', function (str) {
    if (str == '' || str == null) {
        return "../../logo.png";
    } else {
        return $.imgFilePath() + str;
    }
});

template.helper('_toUpperCase', function (str) {
    return str.toUpperCase();
});

//  计算显示比例
template.helper('_toBill', function (num, type) {
    if (type == "sell") {
        // return (100 - (num / Max_Sell_Count * 100).toFixed(2));
        return (num / Max_Sell_Count * 100).toFixed(0);
    } else {
        // return (100 - (num / Max_Buy_Count * 100).toFixed(2));
        return (num / Max_Buy_Count * 100).toFixed(0);
    }
});

template.helper('_getCoinName', function (str) {
    var index = str.indexOf("\/");
    str = str.substring(0,index);
    return str;
});

template.helper('_getFloatNumber', function (str) {
    var value = returnFloat(str, floatNumber);
    return value;
});

template.helper('_getFloatPrice', function (str) {
    var value = returnFloat(str, floatPrice);
    return value;
});


// function decimalbuy(th){
//     var regStrs = [
//         ['^0(\\d+)$', '$1'],
//         ['[^\\d\\.]+$', ''],
//         ['\\.(\\d?)\\.+', '.$1'],
//         ['^(\\d+\\.\\d{}).+', '$1']
//     ];
//     for(var i=0; i<regStrs.length; i++){
//         var reg = new RegExp(regStrs[i][0]);
//         th.value = th.value.replace(reg, regStrs[i][1]);
//     }
// }
function decimalbuy(value){
    var valueLen0 = 0;
    var valueLen1 = 0;
    var initValue = value.toString();
    var str = initValue.split(".");
    try{ valueLen0 += str[0].length; }catch(e){};
    try{ valueLen1 += str[1].length; }catch(e){};
    if(typeof str[1] == "undefined"){
        return (value = str[0]);
    }
    if(valueLen1 >= floatPrice){
        if(floatNumber == 0){
            return value = str[0];
        }
        value = str[0] + "." + str[1].substring(0, floatPrice);
    }
    // if(m > floatNumber){
    //     value = str[0] + "." + str[1].substring(0, floatNumber);
    // }
    // console.log(value);
    return value;
}

template.helper('_Bill', function (num, type) {
    // 买与卖一起计算
    return (100 -(num / Max_All_Count * 100).toFixed(0));


    /*if (type == "sell") {
        console.group("1组")
            console.log(("num的值：" + num))
            console.log(("type的值：" + type))
            console.log(("Max_Buy_Count的值：" + Max_Buy_Count))
            console.log("num / Max_Buy_Count：" + (num / Max_Buy_Count));
            console.log("返回值：" + (100 - (num / Max_Buy_Count * 100).toFixed(0)));
        console.groupEnd()
        return (100 -(num / Max_Sell_Count * 100).toFixed(0));
    } else {
        console.group("2组")
            console.log(("num的值：" + num))
            console.log(("type的值：" + type))
            console.log(("Max_Buy_Count的值：" + Max_Buy_Count))
            console.log("num / Max_Buy_Count：" + (num / Max_Buy_Count));
            console.log("返回值：" + (100 - (num / Max_Buy_Count * 100).toFixed(0)));
        console.groupEnd()
        return (100 - (num / Max_Buy_Count * 100).toFixed(0));
    }*/
});
template.helper('IsCookiesMarketId', function (id) {
    var CookiesID = $.cookie("coinname");
    if (CookiesID != null&&CookiesID!="") {
        CookiesID = $.cookie("coinname").split(",");
        for (var i = 0 ; i < CookiesID.length; i++) {
            if (CookiesID[i] == id) {
                return "c_blue2";
            }
        }
    }
    return "deep-gray";
});

template.helper('IsCookiesMarketId2', function (id) {
    var marketIDs = $("body").data("marketid");
    if (marketIDs != null&&marketIDs!="" && marketIDs == id) {
        return "markettr"
    }
});

template.helper('searchKeyIsNull', function (str) {
    if (searchKey != "") {
        if (str.toUpperCase().indexOf(searchKey)>=0) {
            return true;
        } else {
            return false;
        }
    } else {
        return true;
    }
});
template.helper('cutRoundNum', function ( value , num ) {
    var value = value.toString();
    value =  value.substr(0,value.indexOf('.')+1) + value.substr(value.indexOf('.')+1,num);

    var regx = value.match(/\d+\.\d+/g);
    for ( var index in regx) {
        value = value.replace(regx[index],parseFloat(regx[index]));
    }
    return value;
});
template.helper('dateFormat', function (time, ctStatus) {
    var date = new Date(time);
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var day = date.getDate();
    var hour = date.getHours();
    var min = date.getMinutes();
    var sec = date.getSeconds();
    var newTime = "";
    if(month < 10){
        month = "0" + month;
    }

    if(day < 10){
        day = "0" + day;
    }

    if(hour < 10){
        hour = "0" + hour;
    }

    if(min < 10){
        min = "0" + min;
    }

    if(sec < 10){
        sec = "0" + sec;
    }

    // 今年
    if(ctStatus == 1){
        newTime = month + '-' + day + ' ' + hour + ':' + min;
    }else if(ctStatus == 2){
        newTime = ' ' + hour + ':' + min;
    }else{
        newTime = year + '-' + month + '-' + day + ' ' + hour + ':' + min + ':' + sec;
    }
    return newTime;
});


function getCoinName(str) {
    var index = str.indexOf("\/");
    str = str.substring(0,index);
    return str;
}

function getSellCoinName(str) {
    var index = str.lastIndexOf("/");
    str = str.substring(index+1,str.length);
    return str;
}

function redictMarketId(id, obj) {
    setMarketNumber($(".panel_list").index($(obj).parents(".panel_list")));
    if(window.location.href.indexOf("fullmarket") != -1){
        window.location.href='fullmarket.html?marketid=' + id;
    }else{
        window.location.href='market.html?marketid=' + id;    
    }
}
function redictFullMarketId(id) {
    
}

function getCookiesID(id) {
    var CookiesID = $.cookie("coinname");
    if (CookiesID != null&&CookiesID!="") {
        CookiesID = $.cookie("coinname").split(",");
        for (var i = 0 ; i < CookiesID.length; i++) {
            if (CookiesID[i] == id) {
                $(".collectCoin" + id).addClass("active");
                return true;
            }
        }
    }
    return false;
}
function setCookiesID(id) {
    if(!$.TokenIsNull($.getToken())){
        for(var i = 0; i <= collectArr.length; i++){
            if(collectArr.indexOf(id.toString()) != -1){
                deleteCondig(id);
                break;
            }else{
                saveCondig(id);
            }

        }
        // getMarketList();
        
    }else{
        var CookiesID = $.cookie("coinname");
        if (CookiesID != null&&CookiesID!="") {
            var cookiesArray = new Array();
            var flag = true;
            CookiesID = $.cookie("coinname").split(",");
            for (var i = 0 ; i < CookiesID.length; i++) {

                if (CookiesID[i] == id) {
                    flag = false
                    continue;
                }
                cookiesArray.push(CookiesID[i])
                if (i == CookiesID.length - 1 && flag) {
                    cookiesArray.push(id)
                }
            }
            $.cookie("coinname", cookiesArray,{
                path: "/"
            });
            getMarketList();
        }
        else {
            $.cookie("coinname", id,{
                path: "/"
            })
            getMarketList();
        }
    }
    
}

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
        collectArr = (resData.data).sort(compare);
        for(var i = 0; i < collectArr.length; i++){
            if(collectArr[i] == marketids){
                $(".collectCoin" + marketids).addClass("active");
            }
        }
        getMarketList();
    });
    // console.log(collectArr)
    // return collectArr;
}
function compare(a, b) {
    if(a < b){
        return -1;
    }
    if(a > b){
        return 1;
    }
    return 0;
}

var marketWebSocket;
function initWebSocket(){
    var url = wssPoint + "/api/market/market";
    marketWebSocket = new WebSocket(url);   
    marketWebSocket.onopen = onOpen;  
    marketWebSocket.onmessage = onMessage;  
    marketWebSocket.onerror = onError;  
    marketWebSocket.onclose = onClose;  
}


function onOpen(openEvent) {  
     console.log("markets websocket onOpen...");
}  
function onMessage(event) {  
    //console.log("websocket onMessage:"+event.data);
    if(event.data=="connect_success"){
        doSend();
    }else{
        //paser json handler
        var result = JSON.parse(event.data);
        //用户资产信息
        if(result.assets){
            userAssetsResultHandler(result.assets);
        }
        //根据 市场ID 获得当前交易市场详情信息
        marketInfoByIdResultHandler(result.marketList);
        //实时成交记录
        transactionListResultHandler(result.logList);
        //交易市场列表
        marketListResultHandler(result.change);
        //根据交易市场ID查询交易市场数据
        marketInfoResultHandler(result.search);
        if(result.userList){
            //限时委托
            limitTradeListResultHandler(result.userList);
            //历史委托
            historyTradeListResultHandler(result.userList);
        }
        //实时刷新最新价
        tradeingMarketListResultHandler(result.quotation);
        //查询交易对推荐价格
        getafijewoResultHanlder(result.recommendPrice);

    }
}  
function onError() {  
    console.log("websocket onError. ready reconnect");
    reconnect();
}  
function onClose() {  
    console.log("websocket onClose");
}  

function doSend() {  
    if (marketWebSocket.readyState == 1) {  
        marketWebSocket.send(JSON.stringify(getQueryDimension()));  
    } else {  
          
    }  
}  
  
function disconnect(){  
    if (marketWebSocket != null) {  
        marketWebSocket.close();  
        marketWebSocket = null;  
    }  
}  
function reconnect(){  
    if (marketWebSocket != null) {  
        marketWebSocket.close();  
        marketWebSocket = null;  
    }  
    var url = wssPoint + "/api/market/market";
    marketWebSocket = new WebSocket(url);   
    marketWebSocket.onopen = onOpen;  
    marketWebSocket.onmessage = onMessage;  
    marketWebSocket.onerror = onError;  
    marketWebSocket.onclose = onClose;  
}  

function getQueryDimension(){
    var marketIDs = $("body").data("marketid");
    var tradeLogParam = {
            marketId: marketIDs,
            pageSize: "",
            pageTo: 1
    }
    var marketParam = {
        id: marketIDs,sort: 0,
    }
    var tradeListParam = {
        hot: 1,
        marketId: marketIDs,
        keyword: "",
        pageSize: 25,
        pageTo: 1,
        sort: 3
    }
    var marketByIdParam = {
            hot: 1,
            marketId: marketIDs,
            keyword: "",
            pageSize: 25,
            pageTo: 1,
            sort: 3
    }
    var token = "";
    if($.getToken()){
        token = "Bearer " + $.getToken();
    }
    var dimension = {
            token:token,
            marketId: marketIDs,
            tradeLogParam:tradeLogParam,
            marketParam:marketParam,
            tradeListParam:tradeListParam,
            marketByIdParam:marketByIdParam
        };
    return dimension;
}
