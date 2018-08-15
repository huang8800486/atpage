$(function(){
    if(window.localStorage.getItem("now_new_lang")){
        langPkg.loadProperties(window.localStorage.getItem("now_new_lang"));
        if(langPkg.now_lang == "zh_CN"){

        }else{

        }
    }else{
        langPkg.loadProperties("zh_CN");
    }
    
    // 切换图标语言
    $(".lang_wrap_btn").on("click", function(){
        var i = $(".lang_wrap_btn").index($(this))
        var language = $(this).find(".lang_btn").attr("language");
        langPkg.loadProperties(language);

        var langText = $(this).find(".la_text").text();
        var langImg = $(this).find(".la_img").html();
        window.location.reload();
        setLang(langText, langImg);
    })
    
    initLang(langPkg.now_lang);

    // 初始化图标语言
    function initLang(lang){
        $(".lang_text").text($("." + lang + "_la_text").text());
        $(".lang_btn_img").html($("." + lang + "_la_img").html());
    }

    // 设置图标语言
    function setLang(langText, langImg){
        $(".lang_text").text(langText);
        $(".lang_btn_img").html(langImg);
    }
});

//  页面初始化加载
$(function () {
    //  判断用户登录状态
    var LoginInfo = $.getToken();
    if (LoginInfo == "") {
        // $("#NotLogin").show();
        $(".userafter").show();
        $(".userbefore").hide();
    } else {
        Getassets();
        // $("#Islogin").show();
        $(".userafter").hide();
        $(".userbefore").show();
    }

    var _win = $(window);
    _win.on("scroll", function(){
        var top = $(document).scrollTop();
        if(top >= 62){
            $("#header").addClass("fixed_bar")
        }else{
            $("#header").removeClass("fixed_bar")
        }
    })
});
var flagSwitch = true;
function switchFun(){
    if ( flagSwitch ){
        $(".personal_center").addClass("active");
        flagSwitch = false;
    }else {
        $(".personal_center").removeClass("active");
        flagSwitch = true;
    }
}

var flagSwitchApp = true;
function switchFunApp(){
    if ( flagSwitchApp ){
        $(".app_center").addClass("active");
        flagSwitchApp = false;
    }else {
        $(".app_center").removeClass("active");
        flagSwitchApp = true;
    }
}
$(document).on("click", function (e) {
    if ($(e.target).parents(".dowload_top_app").find(".app_center").is(".active")) {
        flagSwitchApp = false;
        return;
    }
    else{ 
        $(".app_center").removeClass('active')
        flagSwitchApp = true;
    }
})