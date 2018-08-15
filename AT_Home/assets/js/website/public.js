/*
* 公共头部与底部的js
*/
/*语言下拉*/
var num = 0;
function dropDownList() {
    if ( num == 0 ){
        $("#dropDownList").addClass("am-active");
        $("#dropDownList2").addClass("am-active");
        num = 1;
    }else {
        $("#dropDownList").removeClass("am-active");
        $("#dropDownList2").removeClass("am-active");
        num = 0;
    }
}

/*设置用户名隐藏*/
function formatPhone(str) {
    return str.substr(0, 3) + '****' + str.substr(7, 11);
}

/*设置用户名隐藏*/
function formatUsername(str) {
    return str.substr(0, 3) + '****' + str.substr(str.length-3);
}

//  设置全局信息, 头部与底部
$(function(){
    $.ajaxSendData("", "/api/home/getJyConfig", function(resData){
        // 头部
        // $("#webLogo").attr("src",$.imgFilePath() + resData.data.webLogo);
        $("#webLogoBottom").attr("src",$.imgFilePath() + resData.data.webLogoBottom);

        // 底部
        $("#operateTime").html(resData.data.operateTime);
        $("#qq").html(resData.data.qq);
        $("#qqGroup").html(resData.data.qqGroup);
        $("#qqKefu").attr("href","http://wpa.qq.com/msgrd?v=3&uin=" + resData.data.qq + "&site=qq&menu=yes");
        $(".footer-copyright").html(resData.data.caseNumber);
        getBannerImg();

        $(".investment").on("click", function(){
            $('#pop_inv_recharge').modal({
                relatedTarget: this 
            });
        })
        $(".share_btn").on("click", function(){
            $(".show_share").hide();
            $(this).find(".show_share").show();
        })
        $(document).on("click", function (e) {
            if ($(e.target).parents(".share_btn").is(".share_btn")) return;
            else{ 
                $(".show_share").hide();
            }
        })
    });
})
/**
 * 获取用户信息
 * @constructor
 */
function Getassets() {
    $.ajaxSendData("", "/api/user/details", function(resData){
        var username = resData.data.username;
        $("#userName").html(formatUsername(resData.data.nickname))
    });
}

/* 右边的活动图片 */
var bannerLength = 1;
function getBannerImg() {

    var parm = {
        pageSize: 0,
        pageTo: 0,
        languageType : langPkg.getAdLanguage()
    };
    $.ajaxSendData(parm, "/api/adver/getAdverList", function(resData){
        var list = resData.data;
        for(var i = 0; i < list.length; i++){
            if(list[i].locationType == 4){
                var imgs = $.getLogo + list[i].img;
                $("#pop_inv_recharge .imgs img").attr("src", imgs);
            }
        }
    });
}
/*底部的分享链接*/
getShare();
function getShare(){
    $.ajaxSendData("", "/api/home/getJyLinkList", function(resData){
        var dalist = resData.data;
        for(var i = 0; i < dalist.length; i++){
            if(dalist[i].type == 1){
                $(".share_01 a").attr("href", dalist[i].url);
            }

            if(dalist[i].type == 2){
                $(".share_03 a").attr("href", dalist[i].url);
            }

            if(dalist[i].type == 3){
                $(".share_05 a").attr("href", dalist[i].url);
            }
        }
    });
}

//  动态设置头部导航样式
navStyles();
function navStyles(){
    var urlArray = ["index", "trade", "c2c", "usercenter", "invite", "candies"]
    var topLi = $(".top_header_wrap .nav").find("li");
    var pathname = window.location.pathname;
    var str = pathname.split("/");
    var name = str[str.length-2];
    var namelast = str[str.length-1];
    for(var i = 0; i < urlArray.length; i++){
        if(namelast == "c2c_explain.html" || namelast == "assetDetails.html"){
            topLi.eq(2).addClass("curr").siblings().removeClass("curr")
            break;
        }else if(namelast == "candies.html" || namelast == "candies_content.html"){
            topLi.eq(topLi.length-1).addClass("curr").siblings().removeClass("curr")
            break;
        }else if(name == urlArray[i]){
            topLi.eq(i).addClass("curr").siblings().removeClass("curr")
        }
    }
}
/*客服*/
(function(a,h,c,b,f,g){a["UdeskApiObject"]=f;a[f]=a[f]||function(){(a[f].d=a[f].d||[]).push(arguments)};g=h.createElement(c);g.async=1;g.charset="utf-8";g.src=b;c=h.getElementsByTagName(c)[0];c.parentNode.insertBefore(g,c)})(window,document,"script","https://assets-cli.udesk.cn/im_client/js/udeskApi.js","ud");
ud({
    "code": "29i6k45k",
    "link": "https://at3.udesk.cn/im_client/?web_plugin_id=49439"
}); 

/*commonHeader调用*/
/**
 *  跳转到注册页面
 */
function toRegister() {
    $.beforePage();
    window.location.href = "../../register.html";
}


/**
 *  跳转到登录页面
 */
function toLogins() {
    $.beforePage();
    window.location.href = "../../login.html";
}

/**
 *  退出登录
 */
function signOut() {
    $.loginOut();
    window.location.href = "../../login.html";
}

/*commonHeader调用End*/

/*indexHeader调用*/
/**
 *  跳转到注册页面
 */
function indextoRegister() {
    $.beforePage();
    window.location.href = "./register.html";
}


/**
 *  跳转到登录页面
 */
function indextoLogins() {
    $.beforePage();
    window.location.href = "./login.html";
}

/**
 *  退出登录
 */
function indexsignOut() {
    $.loginOut();
    window.location.href = "./login.html";
}
/*indexHeader调用End*/

/*
* 百度浏量代码
*/
var _hmt = _hmt || [];
(function() {
  var hm = document.createElement("script");
  hm.src = "https://hm.baidu.com/hm.js?4113045353d1cd89124cda1104bef85d";
  var s = document.getElementsByTagName("script")[0]; 
  s.parentNode.insertBefore(hm, s);
})();