var searchKey = "";
var isWallet = false;
$(function () {
    $("#header").load("../common/commonHeader.html?version=" + $.version);
    $("#footer").load("../common/commonFooter.html?version=" + $.version);
    $("#left").load("./left.html");
    var cookieStr = $.getToken();
    //  如果已经登录，则取得财务中心数据
    if (!$.TokenIsNull(cookieStr)) {
        getCoinList();
        getCoinAll();
        hideZeroFun();
        // 转入
        getFinanceCoreintocoin();
    }else {
        $.toIndex1();
    }
});

function goCoinaddress(){
    $.beforePage();
}
/* 隐藏资财为0 */
function hideZeroFun(){
    var inputSearch = $(".input_wrap_search");
    var zeroBox = $("#hideZero");
    var hideZeroObj = null;
    var hideZe = sessionStorage.hideZero;

    if (sessionStorage && sessionStorage.hideZero == "" ){
        setHideZero(false)
    }else{
        if(hideZe == "false"){
            inputSearch.find(".switch-wrap").removeClass("active");
            zeroBox.attr("checked",false)
            setHideZero(false)
        }else{
            inputSearch.find(".switch-wrap").addClass("active");
            zeroBox.attr("checked",true)
            setHideZero(true)
        }

    }
    inputSearch.on("click", function(){
        if($(this).find(".switch-wrap").hasClass("active")){
            $(this).find(".switch-wrap").removeClass("active");
            zeroBox.attr('checked',false);
            setHideZero(false);
            getCoinList();
        }else{
            $(this).find(".switch-wrap").addClass("active");
            zeroBox.attr("checked",true)
            setHideZero(true);
            getCoinList();
        }
        return false;
    })

    function setHideZero(flag){
        var sessionStorage;
        if(window.sessionStorage){
            sessionStorage = window.sessionStorage;
        }
        sessionStorage.hideZero = flag;
        // console.log(sessionStorage.hideZero)
    }
}
//  获取财务中心数据
function getFinanceData() {
    $.ajaxSendData("", "/api/user/coin/total/assets", function(resData){
        var UserAssetsDto = resData.data;
        $("#cny_balance").html(parseFloat(UserAssetsDto.availableRMB).toFixed(2));
        $("#cny_lock").html(parseFloat(UserAssetsDto.frozenRMB).toFixed(2));
    });
}

//  获取币种列表
function getCoinList() {
    var param = { coinName: "" };
    $.ajaxSendData(param, "/api/user/coin/list", function(resData){
        // resData.data.list = []
        // resData.data.sum = 0;
        // console.log(resData)
        var showLength = resData.data.num;          // 可显示几条
        var lens = resData.data.list.length;        // 所有列表
        $("#cny_total").html((resData.data.sum));   // 资产
        if (lens > 0) {
            $(".fin_total_assets").show();
            if(parseFloat(resData.data.sum) == 0){
                $("#dataList").html("<div class='nodata'>您没有任何资产</div>");
                $(".finance_page_coin").addClass("notContent");
                $("#fin_total_graph").addClass("notImg");
                $(".notcanvas").css("display", "block");
                $(".fin_total_assets").hide();
            }
            var da = { "list": resData.data.list };
            var _html = template('CoinFinanceDtoList', da);
            var _html2 = template('CoinFinancepercent', da);
            $("#dataList").html(_html);
            $(".assets_coin").html(_html2);
            
            // ECharts , http://echarts.baidu.com/option.html#legend.itemGap
            var dom = document.getElementById("fin_total_graph");
            dom.style.display = "block";
            var myChart = echarts.init(dom);
            var app = {};
            var option = null;
            var data = genData(lens);

            option = {
                tooltip : {
                    trigger: 'item',
                    triggerOn: "click",     // 点击才显示
                    formatter: function(obj){
                        // console.log("调用" + obj.name + "币种的事件")
                        // hideSomethigCoin(obj.name);
                        for(var i = 0; i < lens; i++){
                            if(obj.name == data.beforeData[i].name){
                                return obj.name + ": " + data.beforeData[i].currentPrice + " CNY";
                            }
                        }
                    }
                },
                legend: {
                    type: 'plain',          // 普通图例
                    orient: 'horizontal',   // 水平
                    left:450,               // 左距离
                    top: 60,                // 上距离
                    bottom: 20,             // 下距离
                    width:500,              // 宽度
                    itemGap: 20,            // 间隔
                    itemWidth: 24,          // 图形宽度。
                    itemHeight: 24,         // 图形高度。
                    data: data.legendData,  // 数据
                    selected: data.selected,// true为可选
                    formatter: function (name) {
                        var target;
                        for(var i = 0; i < lens; i++){
                            if(i == showLength && parseFloat(data.seriesData[i].value * 100).toFixed(2) < parseFloat(0.01)){
                                target = " (<0.01"
                                break;
                            }
                            if(name == data.seriesData[i].name){
                                target = " (" + (data.seriesData[i].value * 100).toFixed(2) + ""
                                break;
                            }
                        }
                        var arr = [
                            '{a|' + name + target + '%)}',
                        ]
                        return arr.join('\n');
                    },
                    textStyle:{
                        rich:{
                            a:{
                                width: 200
                            }
                        }
                    }
                },
                emphasis  : {
                    label  :{

                    }
                },
                series : [
                    {
                        left:"left",
                        type: 'pie',
                        radius: ['30%', '70%'], // 中间白色圆周面积
                        center: ['18%', '50%'], // 左右距离
                        hoverAnimation:false,   // 是否开启 hover 在扇区上的放大动画效果。
                        data: data.seriesData,  // 数据
                        minAngle : 3,          // 防止某个值过小导致扇区太小影响交互。
                        itemStyle: {
                            emphasis: {
                                shadowBlur: 10,
                                shadowOffsetX: 0,
                                shadowColor: 'rgba(0, 0, 0, 0.5)'
                            }
                        },
                        color: data.colorArray
                    }
                ],
            };
            function genData(count) {
                var nameList = da;
                var legendData = [];
                var seriesData = [];
                var selected = {};
                var beforeData = []; //分割前的数组
                var afterData = [];  //分割后的数组
                var colorArray = ["#4A90E2", "#2DCCA9", "#9013FE", "#FF5D5D", "#FFBE53", "#4f0202", "#3E3F58"];// 数组颜色
                var otherPercent = 0;    // 显示其他的总项
                var otherCurrentPrice = 0;    // 显示其他的总项
                //循环需要处理的数组
                for(var i = 0; i < showLength; i++) {
                    //将nameList[i]添加到子数组
                    beforeData.push(nameList.list[i]);
                };
                for(var j = lens-1; showLength <= j; j--){
                    afterData.unshift(nameList.list[j])
                    otherPercent += parseFloat(nameList.list[j].percent);
                    otherCurrentPrice += parseFloat(nameList.list[j].currentPrice);
                }
                if(otherCurrentPrice != 0){
                    beforeData.push({
                        name: "其他",
                        percent: otherPercent,
                        currentPrice: otherCurrentPrice
                    })
                }
                for (var i = 0; i < beforeData.length; i++) {
                    name = beforeData[i].name;
                    // name = beforeData[i].name + " (" + (beforeData[i].percent * 100).toFixed(5) + "%)";
                    value = beforeData[i].percent;
                    legendData.push(name);
                    seriesData.push({
                        name: name,
                        value: value
                    });
                    selected[name] = i < lens;
                }
                return {
                    legendData: legendData,
                    seriesData: seriesData,
                    selected: selected,
                    beforeData: beforeData,
                    colorArray: colorArray
                };
            };
            if (option && typeof option === "object") {
                myChart.setOption(option, true);
            }
        }
        langPkg.loadLanguage("zhuanru");
        langPkg.loadLanguage("zhuanchu");
    });
}

var pageSizeWater = 20;
function pageWater(counts, pageTo) {
    $('.wlwpageList').jqPaginator('option', {
        totalCounts: counts,
        currentPage: pageTo
    });
    if (counts <= 1) {
        $(".wlwpageList").hide();
    }
}

//初始化分页器
$('.wlwpageList').jqPaginator({
    totalCounts: 1,
    visiblePages: 10,
    pageSize: pageSizeWater,
    currentPage: 1,
    activeClass: 'am-active',

    //first: '<a href="javascript:void(0)">首页</a>',
    prev: '<li><a href="javascript:void(0)">&laquo;</a></li>  ',
    next: '<li><a href="javascript:void(0)">&raquo;</a></li> ',
    //last: '<a href="javascript:void(0)">最后一页</a>',
    page: ' <li ><a href="javascript:void(0)">{{page}}</a></li>',
    onPageChange: function (num, status) {
        if (status == "change") {
            checkWater(num);
        }
    }
});
// 用户点击流水
function clickWater(coinId, name, balance, frozen, currentPrice){
    $("#clickWaterCoinIdValue").val($("#hid_coin_" + name).val());
    $(".coname").text(name);
    $(".cobalance").text(balance);
    $(".cofrozen").text(frozen);
    $(".cocurrentPrice").text(currentPrice);
    $(".coin_fin").attr("class", "coin_fin");
    $(".user-list-append").html("")
    checkWater(1);
}
// 获取流水记录
function checkWater(pageTo){
    var coinId = $("#clickWaterCoinIdValue").val();
    var param = {
        coinId: coinId,
        pageTo: pageTo
    }
    $("body").addClass("bodyloading");
    $.ajaxSendData(param, "/api/finance/singleCoin", function(resData){
        console.log(resData);
        var datas = resData.data;
        if(datas.length > 0){
            $("body").removeClass("bodyloading");
            pageWater(resData.total, pageTo);
            var da = { "list": resData.data};
            var _html = template('wlwCoinContent', da);
            $("#wlw_coin_content").html(_html);
            $(".finance_page_coin").hide();
            $(".finance_page_water").addClass("active").show();
            langPkg.loadLanguage("chakanxiangqing");
        }else{
            $(".finance_page_water").removeClass("active").hide();
            setTimeout(function(){
                $("body").removeClass("bodyloading");
                layer.msg("暂无流水记录", { time: 1000});
            }, 2000)
            return;
        }
        if(resData.total > pageSizeWater){
            $(".wlwpageList").show();
        }
    });
}
// 返回所有币种
function retrunWater(){
    $(".finance_page_water").removeClass("active").hide();
    $(".finance_page_coin").show();
}

// 单个币种的流水
function buyTypeWater(id, type, obj){
    if($(obj).parents(".finance_user").hasClass("active")){
        $(".user-list-append").html("");
        $(obj).parents(".finance_user").removeClass("active")
        return false;
    }
    $("body").addClass("bodyloading");
    var sClass = "";
    switch (type){
        case '3':
            sClass = ".trans_in_water";     //转入虚拟币流水
            break;
        case '4':
            sClass = ".trans_out_water";    //转出虚拟币流水
            break;
        case '5':
            sClass = ".trade_buy_water";    //买入成交流水
            break;
        case '6':
            sClass = ".trade_sell_water";   //卖出成交流水
            break;
        case '25':
            sClass = ".c2c_buy_water";      //C2C买入流水
            break;
        case '26':
            sClass = ".c2c_sell_water";     //C2C卖出流水
            break;
        case '41':
            sClass = ".fee_water";          //手续费
            break;
        case '34':
        case '35':
        case '36':
        case '37':
        case '38':
        case '42':
            sClass = ".presented_water";    //赠送流水
            break;
        default:
            sClass = ".default_water";    //默认流水
            break;
    }

    var param = {
        financeRecordId: id,
    }
    $.ajaxSendData(param, "/api/finance/getDetailByRecord", function(resData){
        console.log(resData);
        setTimeout(function(){
            $("body").removeClass("bodyloading");
        }, 200)
        $(".user-list-append").html("")
        if($(obj).parents(".finance_user").hasClass("active")){
            $(obj).parents(".finance_user").removeClass("active")
            $(obj).parents(".finance_user").find(".user-list-append").html("")
        }else{
            $(".finance_user").removeClass("active");
            $(obj).parents(".finance_user").addClass("active")
            $(obj).parents(".finance_user").find(".user-list-append").append($(sClass).html());
        }
        // 重置
        $(".empty_value").text("");
        switch (type){
            //转入虚拟币流水
            case '3':
                $(".trans_in_flowing_text").text(resData.data.tradeTypeDesc)
                $(".water-coin").text(resData.data.data.finalCoinName)
                $(".trans_in_flowing_time").text(resData.data.data.finalCreateTime)
                $(".trans_in_flowing_address").text(resData.data.data.roinAddress)
                $(".trans_in_txid").text(resData.data.data.roinTxid)
                $(".trans_in_flowing_orderno").text(resData.data.data.out_order_no)
                $(".trans_in_flowing_fee").text(resData.data.data.roinFee)
                $(".trans_in_num").text(resData.data.data.roinNum)
                $(".trans_in_amount").text(resData.data.data.finalBalance)
                break;
            //转出虚拟币流水
            case '4':
                $(".trans_out_flowing_text").text(resData.data.tradeTypeDesc)
                $(".water-coin").text(resData.data.data.finalCoinName)
                $(".trans_out_flowing_time").text(resData.data.data.finalCreateTime)
                $(".trans_out_flowing_address").text(resData.data.data.rooutAddress)
                $(".trans_out_txid").text(resData.data.data.rooutTxid)
                $(".trans_out_flowing_orderno").text(resData.data.data.out_order_no)
                $(".trans_out_flowing_fee").text(resData.data.data.rooutFee)
                $(".trans_out_num").text(resData.data.data.rooutNum)
                $(".trans_out_amount").text(resData.data.data.finalBalance)
                break;
            //买入成交流水
            case '5':
                $(".trade_buy_flowing_text").text(resData.data.tradeTypeDesc)
                $(".water-coin").text(resData.data.data.finalCoinName)
                $(".water-pair-coin").text(resData.data.data.market)
                $(".last-coin").text(resData.data.data.market.split("/")[1])
                $(".trade_buy_flowing_time").text(resData.data.data.tradeCreateTime)
                $(".trade_buy_pr").text(resData.data.data.tradePrice)
                $(".trade_buy_flowing_orderno").text(resData.data.data.tradeOrderNo)
                $(".trade_buy_flowing_fee").text(resData.data.data.tradeDealFeeNum)
                $(".trade_buy_price").text(resData.data.data.tradeAverage)
                $(".trade_buy_num").text(resData.data.data.tradeDeal)
                $(".trade_buy_amount").text(resData.data.data.tradeTotalMum)
                $(".trade_buy_balance").text(resData.data.data.finalBalance)
                var da = { "list": resData.data.list };
                var _html = template('waterBuySon', da);
                $(".son_dis").html(_html);
                break;
            //卖出成交流水
            case '6':
                $(".trade_sell_flowing_text").text(resData.data.tradeTypeDesc)
                $(".water-coin").text(resData.data.data.finalCoinName)
                $(".water-pair-coin").text(resData.data.data.market)
                $(".last-coin").text(resData.data.data.market.split("/")[1])
                $(".trade_sell_flowing_time").text(resData.data.data.tradeCreateTime)
                $(".trade_sell_pr").text(resData.data.data.tradePrice)
                $(".trade_sell_flowing_orderno").text(resData.data.data.tradeOrderNo)
                $(".trade_sell_flowing_fee").text(resData.data.data.tradeDealFeeNum)
                $(".trade_sell_price").text(resData.data.data.tradeAverage)
                $(".trade_sell_num").text(resData.data.data.tradeDeal)
                $(".trade_sell_amount").text(resData.data.data.tradeTotalMum)
                $(".trade_sell_balance").text(resData.data.data.finalBalance)
                var da = { "list": resData.data.list };
                var _html = template('waterSellSon', da);
                $(".son_dis").html(_html);
                break;
            //C2C买入流水
            case '25':
                $(".c2cbuyflowing_text").text(langPkg.getI18N("c2cmairu"))
                $(".water-coin").text(resData.data.data.finalCoinName)
                $(".c2cbuyflowing_time").text(resData.data.data.c2cCreateTime)
                $(".c2cbuyupdateTime").text(resData.data.data.finalCreateTime)
                $(".c2cbuyflowing_orderno").text(resData.data.data.out_order_no)
                $(".c2cbuyname").text(resData.data.data.c2cTrueName)
                $(".c2cbuybankCard").text(resData.data.data.c2cBankCard)
                $(".c2cbuybank").text(resData.data.data.c2cBankName)
                $(".c2cbuyprice").text(resData.data.data.c2cPrice)
                $(".c2cbuynum").text(resData.data.data.c2cNum)
                $(".c2cbuyamount").text(resData.data.data.c2cAmount)
                $(".c2cbuybalance").text(resData.data.data.finalBalance)
                break;
            //C2C卖出流水
            case '26':
                $(".c2csellflowing_text").text(langPkg.getI18N("c2cmaichu"))
                $(".water-coin").text(resData.data.data.finalCoinName)
                $(".c2csellflowing_time").text(resData.data.data.c2cCreateTime)
                $(".c2csellflowing_orderno").text(resData.data.data.out_order_no)
                $(".c2csellbankCard").text(resData.data.data.c2cBankCard)
                $(".c2csellprice").text(resData.data.data.c2cPrice)
                $(".c2csellnum").text(resData.data.data.c2cNum)
                $(".c2csellamount").text(resData.data.data.c2cAmount)
                $(".c2csellbalance").text(resData.data.data.finalBalance)
                break;
            //手续费
            case '41':
                $(".fee_flowing_text").text(resData.data.tradeTypeDesc)
                $(".water-coin").text(resData.data.data.finalCoinName)
                $(".fee_flowing_time").text(resData.data.data.finalCreateTime)
                $(".fee_flowing_orderno").text(resData.data.data.out_order_no)
                $(".fee_flowing_pr").text(resData.data.data.tradePrice)
                $(".fee_flowing_flowing_fee").text(resData.data.data.finalNum)
                $(".fee_flowing_price").text(resData.data.data.tradeAverage)
                $(".fee_flowing_num").text(resData.data.data.tradeDeal)
                $(".fee_flowing_amount").text(resData.data.data.tradeTotalMum)
                $(".fee_flowing_balance").text(resData.data.data.finalBalance)
                break;
            //赠送流水
            case '34':
            case '35':
            case '36':
            case '37':
            case '38':
            case '42':
                $(".presented_flowing_text").text(resData.data.tradeTypeDesc)
                $(".water-coin").text(resData.data.data.finalCoinName)
                $(".presented_flowing_time").text(resData.data.data.gmt_create_time)
                $(".presented_flowing_orderno").text(resData.data.data.out_order_no)
                $(".presented_flowing_title").text(resData.data.data.activity_name)
                $(".presented_flowing_no").text(resData.data.data.actId)
                $(".presented_amount").text(resData.data.data.finalNum)
                $(".presented_balance").text(resData.data.data.finalBalance)
                break;
            //默认流水
            default:
                $(".default_flowing_text").text(resData.data.tradeTypeDesc)
                $(".water-coin").text(resData.data.data.finalCoinName)
                $(".default_flowing_time").text(resData.data.data.finalCreateTime)
                $(".default_flowing_orderno").text(resData.data.data.out_order_no)
                $(".default_amount").text(resData.data.data.finalNum)
                $(".default_balance").text(resData.data.data.finalBalance)
                break;
        }     
        if(resData.data.list){
            if(resData.data.list.length > 0){
                $(obj).parents(".finance_user").find(".user-list-append .son_wrap").show();
            } 
        }
    }, function(resData){
        setTimeout(function(){
            $("body").removeClass("bodyloading");
        }, 200)
    });
}

//  回车搜索事件
function EnterPress(e){
    var e = e || window.event;
    var searchVal = $("#search").val();
    if((/[\u4e00-\u9fa5]/).test(searchVal)){
        $("#search").val(searchVal.replace(/[\u4e00-\u9fa5]/i, ""));
        searchVal = $("#search").val();
    }  
    var param = { coinName: searchVal };
    $.ajaxSendData(param, "/api/user/coin/list", function(resData){
        if (resData.data.list.length > 0) {
            var da = { "list": resData.data.list };
            var _html = template('CoinFinanceDtoList', da);
            $("#dataList").html(_html);
        }else{
            $("#dataList").html("<tr><td colspan='6' style='text-align:center;'>暂无数据!</td></tr>");
        }
    });
}
// 隐藏某币种
function hideSomethigCoin(name){
    name = (name == "其他") ? "" : name;
    var param = { coinName: name };
    $.ajaxSendData(param, "/api/user/coin/list", function(resData){
        if (resData.data.list.length > 0) {
            var da = { "list": resData.data.list };
            var _html = template('CoinFinanceDtoList', da);
            $("#dataList").html(_html);
        }else{
            $("#dataList").html("<tr><td colspan='6' style='text-align:center;'>暂无数据!</td></tr>");
        }
    });
}

// 获得币种总列表

function getCoinAll(){
    var param = { coinName: "" };
    $.ajaxSendData(param, "/api/coin/list", function(resData){
        if (resData.data.length > 0) {
            $("body").data("coin_listintocoin", resData.data);//获取到的数据存入data，方便后面使用
        }
    });
}

/*
* 转入
*/
//  获得币种列表
function getCoinListintocoin(name, obj) {
    setCoinInfointocoin(name, obj);
}
//  设置币种信息
function setCoinInfointocoin(name, obj) {
    // layer.load();
    $("body").addClass("bodyloading");
    var coinList = $("body").data("coin_listintocoin");
    for (var i = 0; i < coinList.length; i++) {
        if (name == coinList[i].name) {
            $("#coinName").val(coinList[i].name);
            $("#coinIDintocoin").val(coinList[i].id);
            $("#name").html(coinList[i].name.toUpperCase());
            //  设置虚拟币名称
            $(".coinName").html(coinList[i].name.toUpperCase());
            $("#rollInNum").html(coinList[i].rollInNum);
            coinPathintocoin(obj);
            getCoinNumintocoin(coinList[i].name);
            return;
        }
    }
}
//  获取虚拟币地址
function coinPathintocoin(obj) {
    var coinID = Number($("#coinIDintocoin").val());

    var param = {
        coinId: coinID,
    };
    $(".walletAddr").html("");
    $.ajaxSendData(param, "/api/asset/transfer/in", function(resData){
        $(".walletAddr").html(resData.data.coinAddr);
        $(".copy_walletAddr").attr("data-clipboard-text", resData.data.coinAddr);
        $(".qrcode").attr("src",resData.data.qrCode);
        $(".qrcode").attr("data-address",resData.data.coinAddr);
        // layer.closeAll('loading');
        setTimeout(function(){
            $("body").removeClass("bodyloading");
        }, 200)
        //$("#purse_two_dimensional_code").attr("src",resData.data.qrCode);
        $(".user-list-append").html("")
        $(obj).parents(".coin_fin").removeClass("out")
        if($(obj).parents(".coin_fin").hasClass("in")){
            $(obj).parents(".coin_fin").removeClass("in")
            $(obj).parents(".finance_user").find(".user-list-append").html("")
        }else{
            $(".coin_fin").removeClass("in");
            $(obj).parents(".coin_fin").addClass("in")
            $(obj).parents(".coin_fin").find(".user-list-append").append($("#intocoin-modal").html());
        }

        $(".copy_click").on("click", function(){
            var obj = $(this).find(".finance-money-code");
            if(obj.hasClass("active")){
                obj.removeClass("active");
            }else{
                obj.addClass("active");
            }
            return false;
        })

        $(document).on("click", function (e) {
            if (!$(e.target).find(".finance-money-code").is(".active")) return;
            else{ 
                $(e.target).find(".finance-money-code").removeClass("active");
            }
        })


        langPkg.loadLanguage("financial_first318")
        langPkg.loadLanguage("financial_first42")
        langPkg.loadLanguage("zhuanruchenggong")
        langPkg.loadLanguage("zhuanruzhong")
    }, function(resData){
        setTimeout(function(){
            $("body").removeClass("bodyloading");
        }, 200)
        $(".user-list-append").html("")
        $(".walletAddr").html("");
        layer.msg(resData.msg, { time: 2000, icon: 5 });
        // layer.closeAll('loading');
    });
    // 转入富文本
    var param = {
        coinId: 96,
        languageType : "zh_CN",
        bizType: 1
    }
    $.ajaxSendData(param, "/api/adver/getTipsList", function(resData){
        var da = { "list": resData.data };
        var _html = template('inCoinrich', da);
        $(obj).parents(".coin_fin").find(".finance-tip").html(_html)
    });
}
var clipboard = new ClipboardJS('.copy_walletAddr');
    clipboard.on('success', function(e) {
    layer.msg(langPkg.getI18N("fuzhichenggong"), { time: 2000, icon: 1 });
});
clipboard.on('error', function(e) {
    console.log(e);
});

function getFinanceCoreintocoin() {
    $.ajaxSendData("", "/api/finance/core", function(resData){
        $("body").data("financ_core", resData.data.userCoinFinanceDtoList);//获取到的数据存入data，方便后面使用
    });
}

//  获得相应币种数量
function getCoinNumintocoin(coinName) {
    var FinanceCore = $("body").data("financ_core");
    for (var i = 0; i < FinanceCore.length; i++) {
        if (coinName == FinanceCore[i].name) {
            $("#num").html(parseFloat(FinanceCore[i].balance).toFixed(6));
            return;
        }
    }
    $("#FinanceCore").html(parseFloat(0).toFixed(6));
}


/*
* 转出
*/
var cardrzCopy = null;
function init() {
    var cookieStr = $.getToken();
    
    var status = null;
    var cardrz = null;
    //
    function getUserInfo() {
        $.ajaxSendData("", "/api/user/details", function(){
            status = resData.data.status;
            cardrz = resData.data.cardrz;
            cardrzCopy = cardrz;
        });
    }
    //  如果已经登录，则取得财务中心数据
    if (!$.TokenIsNull(cookieStr)) {
        getUserInfo();
        //  如果用户未实名认证，也不允许到达财务中心
        if ( cardrz == 0 || cardrz == 3 || cardrz == 4){
            var index = layer.load(1, {
                time: 10*1000,
                shade: [0.75,'#000'] //0.1透明度的白色背景
            });
            layer.msg(langPkg.getI18N("ningshangweishimingrenzheng_zhengzai"), { time: 1500, icon: 6 }, function () {
                layer.close(index);
                window.location.href = "../security/cardinfo.html";
            })
        }
        else if ( cardrz == 2 ){
            var index = layer.load(1, {
                time: 10*1000,
                shade: [0.75,'#000'] //0.1透明度的白色背景
            });
            layer.msg(langPkg.getI18N("ningdeshenfenxinxizhengzaishenhe"), { time: 1500, icon: 6 }, function () {
                layer.close(index);
                window.location.href = "../security/cardinfo.html";
            })
        }
        else {
            getFinanceCoreoutocoin();
            getCoinList();
        }
    }
}

//  可以允许小数和整数
function onlyNumber(obj) {
    obj.value = obj.value.replace(/[^\d.]/g,"");  //清除“数字”和“.”以外的字符
    obj.value = obj.value.replace(/^\./g,"");  //验证第一个字符是数字而不是.
    obj.value = obj.value.replace(/\.{2,}/g,"."); //只保留第一个. 清除多余的.
    obj.value = obj.value.replace(".","$#$").replace(/\./g,"").replace("$#$",".");

    var val = obj.value;

    if ( obj.value.indexOf(".") != -1 ){
        var lastStr = val.substr(val.indexOf(".")+1,val.length);

        if ( lastStr.length > 8 ){
            var firstStr = val.substr(0,val.indexOf("."));
            lastStr = lastStr.replace(lastStr,val.substr(val.indexOf(".")+1,val.indexOf(".")+7));
            var str = firstStr + "." + lastStr;
            obj.value = str;
        }else {
            obj.value = obj.value;
        }
    }
    if((val > parseFloat($("#money").text()))){
        $(obj).addClass("v_error_new")
        $(".s_fee_tips").show();
    }else{
        $(obj).removeClass("v_error_new")
        $(".s_fee_tips").hide();
    }
    
    
}

//  不允许有小数
function onlyInt(obj) {
    obj.value = obj.value.replace(/[^0-9]/g,'')
}

//  获得币种列表
getFinanceCoreoutocoin();
function getCoinListoutocoin(name, obj) {
    $(this).parents(".coinAddress_wrap").find(".add_text").hide();
    var coinList = $("body").data("coin_listintocoin");
    for (var i = 0; i < coinList.length; i++) {
        if (name == coinList[i].name) {
            $("#coinIDintocoin").val(coinList[i].id);
        }
    }
    var coinID = Number($("#coinIDintocoin").val());

    var param = {
        coinId: coinID,
    };
    // layer.load();
    $("body").addClass("bodyloading");

    $.ajaxSendData(param, "/api/asset/transfer/outforbid", function(resData){
        getoutCoinlistwrap(name, obj)
        setTimeout(function(){
            $("body").removeClass("bodyloading");
        }, 200)
    }, function(resData){
        layer.msg(resData.msg, { time: 2000, icon: 5 });
        layer.closeAll('loading');
        setTimeout(function(){
            $("body").removeClass("bodyloading");
        }, 200)
        return;
    });


}

function getoutCoinlistwrap(name, obj){
    layer.closeAll();
    var param = { coinName: "" };
    $.ajaxSendData(param, "/api/coin/list", function(resData){
        if (resData.data.length > 0) {
            var da = { "list": resData.data };
            $("body").data("coin_list", resData.data);//获取到的数据存入data，方便后面使用
            var _html = template('coin_list', da);
            $("#ul_coin_list").html(_html);

            //  设置默认数据
            setCoinInfooutocoin(name, obj);
        }
    });
}

//  设置币种信息
function setCoinInfooutocoin(name, obj) {
    $(".user-list-append").html("")
    $(obj).parents(".coin_fin").removeClass("in")
    if($(obj).parents(".coin_fin").hasClass("out")){
        $(obj).parents(".coin_fin").removeClass("out")
        $(obj).parents(".finance_user").find(".user-list-append").html("")
    }else{
        $(".coin_fin").removeClass("out");
        $(obj).parents(".coin_fin").addClass("out")
        $(obj).parents(".coin_fin").find(".user-list-append").append($("#outocoin-modal").html());
    }
    // layer.closeAll();
    setTimeout(function(){
        $("body").removeClass("bodyloading");
    }, 200)
    var coinList = $("body").data("coin_list");
    for (var i = 0; i < coinList.length; i++) {
        if (name == coinList[i].name) {
            $("#coinName").val(coinList[i].name);
            $("#coinID").val(coinList[i].id);
            $("#name").html(coinList[i].name.toUpperCase());

            var status = coinList[i].rollOutType;
            $("#rollOutType").val(status);

            var rollOutZdNum = coinList[i].rollOutZdNum;
            var rollOutDayNum = coinList[i].rollOutDayNum;
            var rollOutMax = coinList[i].rollOutMax;

            var oRollOutZdNum = $("#rollOutZdNum, #rollOutZdNum_copy");
            var oRollOutZdNumBox = $("#rollOutZdNumBox");

            var oRollOutDayNum = $("#rollOutDayNum");
            var oRollOutMax = $("#rollOutMax");
            var oRollOutDayNumBox = $("#rollOutDayNumBox");

            var name2 = $("#name2, .name2_copy, #name4");
            var name3 = $("#name3");

            oRollOutZdNumBox.hide();
            oRollOutDayNumBox.hide();

            if ( rollOutZdNum > 0 ){
                name2.html(coinList[i].name.toUpperCase());
                oRollOutZdNum.html(parseFloat(rollOutZdNum));
                oRollOutZdNumBox.show();
            }

            if ( rollOutDayNum > 0 ){
                oRollOutDayNum.html(parseFloat(rollOutDayNum));
                name3.html(coinList[i].name.toUpperCase());
                oRollOutDayNumBox.show();
            }
            oRollOutMax.html(parseFloat(rollOutMax));
            $("#s_fee").html(langPkg.getI18N("financial_first66") + " <span class='newcolor'>" + coinList[i].rollOutFee + "</span> " + coinList[i].name.toUpperCase())
            getCoinNum(coinList[i].name);
            //获取转出地址列表
            getBankList();
            // coinPath();
            
            return;
        }
    }

    // 转出富文本
    var param = {
        coinId: 96,
        languageType : "zh_CN",
        bizType: 2
    }
    $.ajaxSendData(param, "/api/adver/getTipsList", function(resData){
        var da = { "list": resData.data };
        var _html = template('outCoinrich', da);
        $(obj).parents(".coin_fin").find(".finance-tip").html("_html")
    });

}
function selectwalletAddress(obj){
    $(obj).addClass("active").siblings().removeClass("active")
    $(obj).parents(".coinAddress_wrap").find(".add_input input").val($(obj).attr("ref"))
    $(obj).parent(".add_text").hide();
    return false;
}

$(".finance_center_view_body").on('click', ".add_input", function (e) {
    $(this).parents(".coinAddress_wrap").find(".add_text").show();
    return false;
});
$(".finance_center_view_body").on('keyup', ".walletsearch", function (e) {
    // 兼容FF和IE和Opera
    var theEvent = e || window.event;
    searchKey = $(this).val();
    getBankList()
    isWallet = true;
    return false;
});

template.helper('searchwalletAddress', function (str) {
    if (searchKey != "") {
        if (str.indexOf(searchKey)>=0) {
            return true;
        } else {
            return false;
        }
    } else {
        return true;
    }
});
//  转出虚拟币
function zhangecu(obj){
    $.ajaxSendData("", "/api/user/details", function(resData){
        if(resData.data.cardrz == 0 || resData.data.cardrz == 3 || resData.data.cardrz == 4){
            layer.msg(langPkg.getI18N("ningshangweishimingrenzheng_zhengzai"), { time: 2000, icon: 6 }, function () {
                window.location.href = "../security/cardinfo.html";
            })
            return false;
        }else{
            var phonesendcodes = "";
            var emailsendcodes = "";
            if(resData.data.moble != ""){
                phonesendcodes = resData.data.moble;
                $("#moble_verify").attr("placeholder", ($.usernameType(phonesendcodes) + langPkg.getI18N("financial_first410")));
                $("#hid_mobile").val(phonesendcodes);
                $("#lastNumphone").html($.usernameType(phonesendcodes));
                $(".selectCodePhone").show();
            }

            if(resData.data.email != ""){
                emailsendcodes = resData.data.email;
                $("#moble_verify_email").attr("placeholder", ($.usernameType(emailsendcodes) + langPkg.getI18N("financial_first410")));
                $("#hid_email").val(emailsendcodes);
                $("#lastNumemail").html($.usernameType(emailsendcodes));
                $(".selectCodeEmial").show();
            }
            var addrID = $('.walletsearch').val();
            var address = $('.add_input').find('.walletsearch').val();
            var amount = Number($("#numout").val());
            var coidID = $("#coinID").val();
            if (coidID <= 0 || coidID == null) {
                layer.tips(langPkg.getI18N("qingxuanzexunibi"), '#ul_coin_list', { tips: [3, "#0e9e80"], time: 2000, end: function () { $("#btn_submit").removeAttr("disabled"); } });
                return false;
            }

            if (addrID == "" || addrID == null) {
                layer.tips(langPkg.getI18N("qingxuanzeqianbaojieshoudizhi"), '.add_input', { tips: [3, "#0e9e80"], time: 2000, end: function () { $("#btn_submit").removeAttr("disabled"); } });
                return false;
            }

            if (amount == "" || amount == null) {
                layer.tips(langPkg.getI18N("financial_first4_placeholder2"), '#numout', { tips: [3, "#0e9e80"], time: 2000, end: function () { $("#btn_submit").removeAttr("disabled"); } });
                return false;
            }

            $(".outocoin").removeClass("active");
            $(obj).parents(".outocoin").find(".pop_trade_secret").show()
            setTimeout(function(){
                $(obj).parents(".outocoin").addClass("active");
            }, 300)
        }
    });
}
// 忘记交易密码跳回
function goTandPage(obj){
    $.beforePage();
    window.location.href = "../security/update_trade_pwd.html"
}
$(".finance-list").on("click",".tra-close", function(){
    $(".outocoin").removeClass("active");
    $(".outocoin").find(".pop_trade_secret").hide()
})
function Update() {
    $("#btn_submit").attr("disabled", "");
    var addrID = $('.walletsearch').val();
    var address = $('.add_input').find('.walletsearch').val();
    var amount = Number($("#numout").val());
    var coidID = $("#coinID").val();
    var moble_verify = $("#moble_verify").val();
    var moble_verify_email = $("#moble_verify_email").val();
    var paypassword = $("#paypassword").val();

    if (coidID <= 0 || coidID == null) {
        layer.tips(langPkg.getI18N("qingxuanzexunibi"), '#ul_coin_list', { tips: [3, "#0e9e80"], time: 2000, end: function () { $("#btn_submit").removeAttr("disabled"); } });
        return false;
    }

    if (addrID == "" || addrID == null) {
        layer.tips(langPkg.getI18N("qingxuanzeqianbaojieshoudizhi"), '.add_input', { tips: [3, "#0e9e80"], time: 2000, end: function () { $("#btn_submit").removeAttr("disabled"); } });
        return false;
    }

    if (amount == "" || amount == null) {
        layer.tips(langPkg.getI18N("financial_first4_placeholder2"), '#numout', { tips: [3, "#0e9e80"], time: 2000, end: function () { $("#btn_submit").removeAttr("disabled"); } });
        return false;
    }
    if (paypassword == "" || paypassword == null) {
        layer.tips(langPkg.getI18N("financial_first4_placeholder3"), '#paypassword', { tips: [3, "#0e9e80"], time: 2000, end: function () { $("#btn_submit").removeAttr("disabled"); } });
        return false;
    }

    if($(".selectCodePhone").css("display") != "none"){
        if (moble_verify == "" || moble_verify == null) {
            layer.tips(langPkg.getI18N("mobile_verify_placeholder"), '#moble_verify', { tips: [3, "#0e9e80"], time: 2000, end: function () { $("#btn_submit").removeAttr("disabled"); } });
            return false;
        }
    }
    if($(".selectCodeEmial").css("display") != "none"){
        if (moble_verify_email == "" || moble_verify_email == null) {
            layer.tips(langPkg.getI18N("mobile_verify_placeholder"), '#moble_verify_email', { tips: [3, "#0e9e80"], time: 2000, end: function () { $("#btn_submit").removeAttr("disabled"); } });
            return false;
        }
    }

    var balance = Number($("#coinBalance").val());
    if (amount > balance) {
        layer.msg(langPkg.getI18N("yuebuzu"), { time: 2000, icon: 2 }, function () {
            $("#btn_submit").removeAttr("disabled");
        });
        return false;
        /*layer.tips(langPkg.getI18N("yuebuzu"), '#money', { tips: [3, "#0e9e80"], time: 2000, end: function () { $("#btn_submit").removeAttr("disabled"); } });*/
    }

    var status = $("#rollOutType").val();
    if ( status == 2 ){
        layer.tips(langPkg.getI18N("dangqianbizhongjinzhizhuanchu"), '#money', { tips: [3, "#0e9e80"], time: 2000, end: function () { $("#btn_submit").removeAttr("disabled"); } });
        return false;
    }

    var param = {
        address: address,
        amount: amount,
        coinId: coidID,
        mailCode: moble_verify_email,
        password: paypassword,
        smsCode: moble_verify
    }
    $.ajaxSendData(param, "/api/asset/transfer/out", function(resData){
        layer.msg(resData.msg, { time: 2000, icon: 1 }, function () {
            //$('.add_input option:selected').val(0);
            $("#num").val("");
            $("#moble_verify").val("");
            $("#moble_verify_email").val("");
            $("#paypassword").val("");
            $("#numout").val("");
            $("#btn_submit").removeAttr("disabled");
            $(".btn_sendCode").removeAttr("disabled");
            window.location.reload();
        });
        getFinanceCoreoutocoin();
        var coinName = $("#coinName").val();
        getCoinNum(coinName);
    }, function(resData){
        layer.msg(resData.msg, { time: 2000, icon: 5 }, function () {
            $("#btn_submit").removeAttr("disabled");
        });
    });

}

//  获取财务中心数据
function getFinanceCoreoutocoin() {
    $.ajaxSendData("", "/api/finance/core", function(resData){
        $("body").data("financ_core", resData.data.userCoinFinanceDtoList);//获取到的数据存入data，方便后面使用
    });
}

//  获得相应币种数量
function getCoinNum(coinName) {
    var FinanceCore = $("body").data("financ_core");
    for (var i = 0; i < FinanceCore.length; i++) {
        if (coinName == FinanceCore[i].name) {
            $("#money").html(parseFloat(FinanceCore[i].balance).toFixed(6));
            $("#coinBalance").val(parseFloat(FinanceCore[i].balance).toFixed(6));
            return;
        }
    }
    $("#FinanceCore").html(parseFloat(0).toFixed(6));
}

//  获得转出地址列表
function getBankList() {
    var coin_ID = $("#coinID").val();

    var param = {
        coinId: coin_ID,
    };
    $.ajaxSendData(param, "/api/assets/wallet/list", function(resData){
        var da = { "list": resData.data }
        var _html = template('list_Address', da);   //template("模版名","数据集")
        $("#myzc_addr").html(_html);
        langPkg.loadLanguage("qingxuanzeqianbaojieshoudizhi")
        if(isWallet){
            $(".finance_center_view_body").find(".add_text").show();
        }
    });
}
//  获取验证码，只是为了弹出框
function getCode(_this, type) {
     var amount = Number($("#money").text());
     var balance = Number($("#coinBalance").val());
     var addrID = $('.walletsearch').val();
     var coidID = $("#coinID").val();

     if (coidID <= 0 || coidID == null) {
         layer.tips(langPkg.getI18N("qingxuanzeqianbao"), '#moremoney', { tips: [3, "#0e9e80"]});
         return false;
     }

     if (addrID == "" || addrID == null) {
         layer.tips(langPkg.getI18N("qingxuanzeqianbaojieshoudizhi"), '.add_input', { tips: [3, "#0e9e80"]});
         return false;
     }
     if (amount > balance) {
         layer.tips(langPkg.getI18N("yuebuzu"), '#money', { tips: [3, "#0e9e80"] });
         return false;
     }
    if(type == "phone"){
        var moble = $("#hid_mobile").val();
        OpenAliValidate(_this, moble, 6, $("#" + _this.id));
    }else if(type == "email"){
        var moble = $("#hid_email").val();
        OpenAliValidate(_this, moble, 6, $("#" + _this.id));
    }
     
}

$("#at_modlog").off('closed.modal.amui').click(function(){
    $(".btn_sendCode").removeAttr("disabled");
    $("#slider").slider("restore");
})

