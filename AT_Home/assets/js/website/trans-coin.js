function init() {
    var cookieStr = $.getToken();
    //判断token值是否为空
    if (!$.TokenIsNull(cookieStr)) {
        getFinanceCoreintocoin();
        // 转入
        getCoininList();   

        // 转出
        getCoinoutList();   
    }else {
        $.toIndex1();
    }
}

/*
* 获取转入的coin表
*/
// 切换
$(".coin_category_nav").on("click", ".ecn", function(){
    var i = $(".coin_category_nav .ecn").index($(this));
    $(".coin_category_nav").find(".ecn").eq(i).addClass("active").siblings().removeClass("active");
    $(".coin_category_wrap").find(".coin_category").eq(i).addClass("active").siblings().removeClass("active");
})

// 获得币种列表
function getCoininList() {
    var param = { coinName: "" };
    $.ajaxSendData(param, "/api/coin/list", function(resData){
        if (resData.data.length > 0) {
            var da = { "list": resData.data };
            $("body").data("in_coin_list", resData.data);//获取到的数据存入data，方便后面使用
            var _html = template('in_coin_list', da);
            $("#in_ul_coin_list").html(_html);

            //  设置默认数据
            setCoinInfoin(resData.data[0].name);
        }
    });
}
//  设置币种信息
function setCoinInfoin(name) {
    var coinList = $("body").data("in_coin_list");
    for (var i = 0; i < coinList.length; i++) {
        if (name == coinList[i].name) {
            $("#coinID").val(coinList[i].id);
            //  设置虚拟币名称
            myInListintocoin(1);
            return;
        }
    }
}
//  转入虚拟币列表
function myInListintocoin(pageTo) {
    if (pageTo == 1) {
        $("#in_tb_list").html("");
    }
    var coidID = Number($("#coinID").val());

    var param = {
        coinId: coidID,    // BTC
        pageSize: pageSizeIn,
        pageTo: pageTo
    };



    $.ajaxSendData(param, "/api/asset/transfer/in/list", function(resData){
        $("#pageListintocoin").hide();
        if (resData.data.length > 0) {
            //动态处理分页器
            pagein(resData.total, pageTo)
            var da = { "list": resData.data }
            var _html = template('rollInListintocoin', da);   //template("模版名","数据集")
            $("#in_tb_list").html(_html);
            $.weakenText($("#in_tb_list .reg-text"));
            langPkg.loadLanguage("financial_first318")
            langPkg.loadLanguage("financial_first42")
            langPkg.loadLanguage("zhuanruchenggong")
            langPkg.loadLanguage("zhuanruzhong")
        }
        else {
            $("#tb_list").html("<tr><td colspan='7' style='text-align:center;'>"+ langPkg.getI18N("zanwuzhuanrujilu") +"</td></tr>");
            $("#pageListintocoin").hide();
            pagein(1, 1)
        }

        if(resData.total > pageSizeIn){
            $("#pageListintocoin").show();
        }
    });
    
}
function getFinanceCoreintocoin() {
    $.ajaxSendData("", "/api/finance/core", function(resData){
        $("body").data("financ_core", resData.data.userCoinFinanceDtoList);//获取到的数据存入data，方便后面使用
    });
}

var pageSizeIn = 10;
function pagein(counts, pageTo) {
    $('#pageListintocoin').jqPaginator('option', {
        totalCounts: counts,
        currentPage: pageTo
    });
    if (counts <= 1) {
        $("#pageListintocoin").hide();
    }
}

//初始化分页器
$('#pageListintocoin').jqPaginator({
    totalCounts: 1,
    visiblePages: 10,
    pageSize: pageSizeIn,
    currentPage: 1,
    activeClass: 'am-active',

    //first: '<a href="javascript:void(0)">首页</a>',
    prev: '<li><a href="javascript:void(0)">&laquo;</a></li>  ',
    next: '<li><a href="javascript:void(0)">&raquo;</a></li> ',
    //last: '<a href="javascript:void(0)">最后一页</a>',
    page: ' <li ><a href="javascript:void(0)">{{page}}</a></li>',
    onPageChange: function (num, status) {
        if (status == "change") {
            myInListintocoin(num);
        }
    }
});


/*
* 获取转出的coin表
*/
// 获得币种列表
function getCoinoutList() {
    var param = { coinName: "" };
    $.ajaxSendData(param, "/api/coin/list", function(resData){
        if (resData.data.length > 0) {
            var da = { "list": resData.data };
            $("body").data("out_coin_list", resData.data);//获取到的数据存入data，方便后面使用
            var _html = template('out_coin_list', da);
            $("#out_ul_coin_list").html(_html);

            //  设置默认数据
            setCoinInfoOut(resData.data[0].name);
        }
    });
}
//  设置币种信息
function setCoinInfoOut(name) {
    var coinList = $("body").data("out_coin_list");
    for (var i = 0; i < coinList.length; i++) {
        if (name == coinList[i].name) {
            $("#coinID").val(coinList[i].id);
            //  设置虚拟币名称
            myOutListintocoin(1);
            return;
        }
    }
}

function myOutListintocoin(pageTo) {
    if (pageTo == 1) {
        $("#out_tb_list").html("");
    }
    var coidID = Number($("#coinID").val());

    var param = {
        coinId: coidID,    // BTC
        pageSize: pageSizeIn,
        pageTo: pageTo
    };
    $.ajaxSendData(param, "/api/asset/transfer/out/list", function(resData){
        $("#pageListouttocoin").hide();
        if (resData.data.length > 0) {
            //动态处理分页器
            pageOut(resData.total, pageTo)
            var da = { "list": resData.data }
            var _html = template('rollInListouttocoin', da);   //template("模版名","数据集")
            $("#out_tb_list").html(_html);
            $.weakenText($("#out_tb_list .reg-text"));
            langPkg.loadLanguage("financial_first318")
            langPkg.loadLanguage("financial_first42")
            langPkg.loadLanguage("zhuanchuzhong")
            langPkg.loadLanguage("security_first212")
            langPkg.loadLanguage("security_first213")
        }
        else {
            $("#out_tb_list").html("");
            $("#pageListouttocoin").hide();
            pageOut(1, 1)
        }

        if(resData.total > pageSizeOut){
            $("#pageListouttocoin").show();
        }
    });
    
}


var pageSizeOut = 10;
function pageOut(counts, pageTo) {
    $('#pageListouttocoin').jqPaginator('option', {
        totalCounts: counts,
        currentPage: pageTo
    });
    if (counts <= 1) {
        $("#pageListouttocoin").hide();
    }
}

//初始化分页器
$('#pageListouttocoin').jqPaginator({
    totalCounts: 1,
    visiblePages: 10,
    pageSize: pageSizeOut,
    currentPage: 1,
    activeClass: 'am-active',

    //first: '<a href="javascript:void(0)">首页</a>',
    prev: '<li><a href="javascript:void(0)">&laquo;</a></li>  ',
    next: '<li><a href="javascript:void(0)">&raquo;</a></li> ',
    //last: '<a href="javascript:void(0)">最后一页</a>',
    page: ' <li ><a href="javascript:void(0)">{{page}}</a></li>',
    onPageChange: function (num, status) {
        if (status == "change") {
            myOutListintocoin(num);
        }
    }
});