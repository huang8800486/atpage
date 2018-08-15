(function ($) {
    //扩展jQuery对象本身
    jQuery.extend({
        /// <summary>
        /// 判断Token是否为空
        ///</summary>
        "TokenIsNull": function (tokenStr) {
            if (tokenStr == "undefined" || tokenStr == "null" || tokenStr == "") {
                return true;
            }
            else {
                return false;
            }
        },

        /// <summary>
        /// 登录
        ///</summary>
        "UserLogin": function () {
            var cookieStr = $.getToken();

            //判断token值是否为空
            if ($.TokenIsNull(cookieStr)) {
                //iframe层-父子操作
                layer.open({
                    type: 2,
                    area: ['270px', '260px'],
                    fixed: true, //不固定
                    resize: false,
                    move: false,
                    title: '会员登录',
                    cancel:function(){location.href = "../index.html"},
                    content: ['../../login.html','no'],
                    end: function () {
                        location.reload();
                    }
                });
            }
        },

        /// <summary>
        /// 登录
        ///</summary>
        "UserLoginToC2c": function () {
            var cookieStr = $.getToken();

            //判断token值是否为空
            if ($.TokenIsNull(cookieStr)) {
                //iframe层-父子操作
                layer.open({
                    type: 2,
                    area: ['270px', '260px'],
                    fixed: true, //不固定
                    resize: false,
                    move: false,
                    title: '会员登录',
                    cancel:function(){location.href = "./qd.html"},
                    content: ['../../login.html','no'],
                    end: function () {
                        location.reload();
                    }
                });
            }
        },

        /// <summary>
        /// 登录
        ///</summary>
        "centerLogin": function () {
            var cookieStr = $.getToken();
            //  判断token值是否为空
            if ($.TokenIsNull(cookieStr)) {
                layer.msg("您尚未登录，正在为您跳转到登录页面...", { time: 1500, icon: 6 }, function () {
                    window.location.href = "./login.html";
                })
            }
        },

        /// <summary>
        /// 返回首页
        ///</summary>
        "ToIndex": function () {
            window.location.href = "../index.html";
        },

        /// <summary>
        /// 获取交易市场ID
        ///</summary>
        "GetMarketId":function(callback){
            var marketId = $.getUrlParam("marketid");

            if (isNaN(marketId) || marketId == "" || marketId == null)//判断marketId是否不为数字
            {
                var id = "";
                var param = {
                    id: id
                };

                $.ajaxSendData(param, "/api/market/list", function(resData){
                    if (resData.data.length > 0) {
                        var marketList = resData.data;
                        if (marketList == "")//判断交易市场列表是否为空
                        {
                            $.ToIndex();//跳转到首页
                        }
                        marketId = marketList[0].id;
                        if(callback){
                            callback(marketId);
                        }
                    }
                });
            }else{
                if(callback){
                    callback(marketId);
                }
            }
        },

        /// <summary>
        /// 获取当前交易市场信息
        ///</summary>
        "GetMarketInfo":function(marketId){
            var param = {
                id: marketID
            };

            $.ajaxSendData(param, "/api/market/list", function(resData){
                return resData;
            });
        },

        /// <summary>
        /// 只提取汉字
        ///</summary>
        "GetChinese": function (str) {
            if (str != null && str != "" && str != "null" && str != "undefined") {
                var reg = /[\u4e00-\u9fa5]/g;
                return str.match(reg).join("");
            }
            return "";
        },

        /// <summary>
        /// 去除汉字
        ///</summary>
        "RemoveChinese":function(str){
            if (str != null && str != "" && str != "null" && str != "undefined") {
                var reg = /[\u4e00-\u9fa5]/g;   
                return str.replace(reg, "");
            }  
            return ""; 
        }

    })


    //  获得交易市场列表
    function getNavMarketList() {
        var id = "";
        var param = {
            id: id
        };

        $.ajaxSendData(param, "/api/market/list", function(resData){
            if (resData.data.length > 0) {
                return resData.data;
            }
            return "";
        });
    }
})(window.jQuery);