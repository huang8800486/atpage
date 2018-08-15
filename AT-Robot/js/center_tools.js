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
                    cancel:function(){location.href = "index.html"},
                    content: ['login.html','no'],
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
                //  进行登录判断操作
                var pathname = window.location.pathname;
                var domian = window.location.host;
                var protocol = window.location.protocol;
                var loginUrl = protocol + "//" + domian + "/zh_cn/login.html?redirectUrl=" + $.base64Encrypt(pathname);
                window.location.href = loginUrl;
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
        "GetMarketId":function(){
            var marketId = $.getUrlParam("marketid");

            if (isNaN(marketId) || marketId == "" || marketId == null)//判断marketId是否不为数字
            {
                var marketList = getNavMarketList();

                if (marketList == "")//判断交易市场列表是否为空
                {
                    $.ToIndex();//跳转到首页
                }
                marketId = marketList[0].id;
            }
            return marketId;
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
        var strObgect = $.toBase64(param);
        var strSign = $.toSign(strObgect);

        var resData = $.sendData(strObgect, strSign, "/api/market/list");

        if (resData.code == 200 || resData.data.length > 0) {
            return resData.data;
        }
        return "";
    }

})(window.jQuery);