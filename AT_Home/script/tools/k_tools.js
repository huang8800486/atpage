var gateways = null;
var kTokenKey = null;
(function ($) {
    var Token_key = "at_user_authentication";
    var user_key = "at_user_key";
    // var gateway = "http://192.168.88.3:8089"; 
    // var gateway = "https://www.at3.com"; 
    // var gateway = "http://192.168.88.221";
    var gateway = "https://www2.at3.com";
    // var gateway = "http://192.168.88.50:8089";
    // var gateway = "http://192.168.88.18:8089";
    gateways = gateway;
    wssPoint = "wss://" + (gateways.split("//")[1]);
    if(gateways.indexOf("https") == -1){
    	wssPoint = "ws://" + (gateways.split("//")[1]);
    }
    kTokenKey = Token_key;
    //扩展jQuery对象本身
    jQuery.extend({
        /// <summary>
        /// 图片目录
        ///</summary>
        "getLogo": "https://www2.at3.com/",

        "version": "1",

        "imgFilePath": function () {
            return "https://www2.at3.com/";
            // return gateway;
            // return "http://test.fengfengke.com/api/file/get?fileName=";
             //return "http://localhost:8089/api/file/get/";
            // return "http://192.168.1.100:8012";
        },
        /// <summary>
        /// 图片目录
        ///</summary>
        "getGateway": function () {
            return gateway;
        },
        /// <summary>
        /// 字母+数字，字母+特殊字符，数字+特殊字符
        ///</summary>
        "verifyPwd": function (str) {
            var patrn = /^(?![a-zA-z]+$)(?!\d+$)(?![!@#$%^&*.><]+$)[a-zA-Z\d!@#$%^&*.><]+$/;
            if (!patrn.exec(str)) return false
            return true;
        },
        ///<summary>
        /// 生成签名
        ///</summary>
        "toSign": function (str) {
            try {
                str = str + getKey();
                return CryptoJS.MD5(str).toString();
            } catch (e) {
                return "";
            }

        },
        ///<summary>
        /// json对象转码Base64
        ///</summary>
        "toBase64": function (obj) {
            try {
                if ("payPwd" in obj) {
                    obj["payPwd"] = passWord(obj["payPwd"]);
                }
                if ("paypwd" in obj) {
                    obj["paypwd"] = passWord(obj["paypwd"]);
                }
                if ("password" in obj) {
                    obj["password"] = passWord(obj["password"]);
                }
                if ("pwd" in obj) {
                    obj["pwd"] = passWord(obj["pwd"]);
                }
                if ("paypass" in obj) {
                    obj["paypass"] = passWord(obj["paypass"]);
                }
                if ("newPwd" in obj) {
                    obj["newPwd"] = passWord(obj["newPwd"]);
                }
                if ("oldPwd" in obj) {
                    obj["oldPwd"] = passWord(obj["oldPwd"]);
                }
                var str = JSON.stringify(obj);

                return CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(str));
            } catch (e) {
                return "";
            }
        },
        ///<summary>
        /// Base64解码成json对象
        ///</summary>
        "Base64ToObj": function (str) {
            try {
                var words = CryptoJS.enc.Base64.parse(str);
                var jsonStr = words.toString(CryptoJS.enc.Utf8);

                return JSON.parse(jsonStr);
            } catch (e) {
                return null;
            }

        },
        ///<summary>
        /// Base64解码成str
        ///</summary>
        "Base64ToStr": function (str) {
            try {
                var words = CryptoJS.enc.Base64.parse(str);
                var jsonStr = words.toString(CryptoJS.enc.Utf8);

                return JSON.stringify(jsonStr);
            } catch (e) {
                return "";
            }

        },
        ///<summary>
        /// 登录写入鉴权
        ///</summary>
        "loginSet": function (token, userKey) {
            setCookie(Token_key, token);
            setCookie(user_key, userKey);
        },
        ///<summary>
        /// 读取鉴权信息
        ///</summary>
        "getToken": function () {
            return getCookie(Token_key);
        },
        ///<summary>
        /// 读取用户key
        ///</summary>
        "getUserKey": function () {
            return getCookie(user_key);
        },
        ///<summary>
        /// 登出
        ///</summary>
        "loginOut": function () {
            $.beforePage();
            delCookie(user_key);
            delCookie(Token_key);
            // window.location.reload();
        },
        ///<summary>
        /// 请求数据
        ///</summary>
        "sendData": function (strObgect, strSign, strApi, callback) {
            var _this = this;
            var data;
            $.ajax({
                type: "POST",
                timeout: 30000, //超时时间设置，单位毫秒
                url: gateway + strApi,
                data: JSON.stringify({ "object": strObgect, "sign": strSign }),
                async: false,
                // async: true,
                dataType: "json",
                contentType: "application/json;charset=UTF-8",
                beforeSend: function (xhr) {
                    var Authorization = getCookie(Token_key);
                    xhr.setRequestHeader("Access-Control-Allow-Origin", "*");
                    xhr.setRequestHeader("Accept", "*/*");
                    xhr.setRequestHeader("Access-Control-Max-Age", "3600");
                    xhr.setRequestHeader("Authorization", "Bearer " + Authorization);

                    if (langPkg.now_lang == "zh_CN"){
                        xhr.setRequestHeader("Accept-language", _this.language.zh_CN);
                    }else{
                        xhr.setRequestHeader("Accept-language", _this.language.en_US);
                    }
                    
                    //  判断当前浏览器语言
                    /*var currentLang = navigator.language;   //判断除IE外其他浏览器使用语言
                    if (!currentLang) {//判断IE浏览器使用语言
                        currentLang = navigator.browserLanguage;
                    }
                    currentLang = currentLang.toLowerCase();

                    var url = window.location.href;
                    var language = "";
                    var zh = "zh_cn";
                    var en = "en_us";
                    if ( url.indexOf(zh) != -1 ){
                        language = "zh_CN";
                    }
                    if ( url.indexOf(en) != -1 ){
                        language = "en_US";
                    }

                    $.setAcceptLanguage(language);

                    /*var name = getCookie("ATcoinAcceptLanguage");

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
                            case "ko-kr":
                                xhr.setRequestHeader("Accept-language", "ko-KR");
                                break;
                            default :
                                xhr.setRequestHeader("Accept-language", "zh-CN");
                                break;
                        }
                    }*/
                },
                complete: function (XMLHttpRequest, status) { //请求完成后最终执行参数
                    if (status == 'timeout') {//超时,status还有success,error等值的情况
                        return { code: -101, msg: "请求超时" }
                    }
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    data = XMLHttpRequest.responseJSON;
                },
                success: function (resdata) {
                    if ( resdata.code == 401 || resdata.code == 402 || resdata.code == 403 || resdata.code == 203  ) {
                        $.loginOut();
                        return;
                    }
                    if ( resdata.code == 504 ){
                        window.location.reload();
                        return;
                    }else {
                        data = resdata;
                    }
                    
                    if(callback){
                        callback(resdata);
                    }
                }
            });

            return data;
        },

        "ajaxSendData": function (dataobj, strApi, callback, errorback) {
            var _this = this;
            var data;
            var strObgect = $.toBase64(dataobj);
            var strSign = $.toSign(strObgect);
            $.ajax({
                type: "POST",
                timeout: 30000, //超时时间设置，单位毫秒
                url: gateway + strApi,
                data: JSON.stringify({ "object": strObgect, "sign": strSign }),
                // async: false,
                async: true,
                dataType: "json",
                contentType: "application/json;charset=UTF-8",
                beforeSend: function (xhr) {
                    var Authorization = getCookie(Token_key);
                    xhr.setRequestHeader("Access-Control-Allow-Origin", "*");
                    xhr.setRequestHeader("Accept", "*/*");
                    xhr.setRequestHeader("Access-Control-Max-Age", "3600");
                    if(Authorization != ""){
                        xhr.setRequestHeader("Authorization", "Bearer " + Authorization);
                    }else{
                        xhr.setRequestHeader("Authorization", "Bearer" + Authorization);
                    }
                    

                    if (langPkg.now_lang == "zh_CN"){
                        xhr.setRequestHeader("Accept-language", _this.language.zh_CN);
                    }else{
                        xhr.setRequestHeader("Accept-language", _this.language.en_US);
                    }
                },
                complete: function (XMLHttpRequest, status) { //请求完成后最终执行参数
                    if (status == 'timeout') {//超时,status还有success,error等值的情况
                        return { code: -101, msg: "请求超时" }
                    }
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    data = XMLHttpRequest.responseJSON;
                },
                success: function (resdata) {
                    if ( resdata.code == 401 || resdata.code == 402 || resdata.code == 403 || resdata.code == 203  ) {
                        $.loginOut();
                        return;
                    }
                    if ( resdata.code == 504 ){
                        window.location.reload();
                        return;
                    }else {
                        data = resdata;
                    }
                    
                    if(callback){
                        if(resdata.code == 200){
                            callback(resdata);
                        }else{
                            if(errorback){
                                errorback(resdata);
                            }else{
                                layer.msg( resdata.msg, { icon: 2, time: 1500 });
                            }
                        }
                        
                    }
                }
            });

            return data;
        },
        language: {
            zh_CN: "zh-CN",
            en_US: "en-US"
        },
        "getUrlParam": function (name) {
            var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
            var r = window.location.search.substr(1).match(reg);
            if (r != null) {
                return unescape(r[2]);
            } else {
                return null;
            }
        },
        ///<summary>
        /// 获取cookie
        ///</summary>
        "getCookies": function (key) {
            try {
                var value = $.cookie(key);
                return undefinedCheck(value);
            } catch (e) {
                return "";
            }
        },
        //  用户登录
        "userLogin": function () {
            var username = $("#username").val();
            var password = $("#password").val();
            var code = $("#moble_verify").val();

            $("#login").attr("disabled", "disabled");
            if ( username === "" ){
                layer.msg("用户名不能为空", { icon: 2, time: 2000 }, function () {
                    $("#login").removeAttr("disabled");
                });
                return false;
            }

            if ( password === "" ){
                layer.msg("密码不能为空", { icon: 2, time: 2000 }, function () {
                    $("#login").removeAttr("disabled");
                });
                return false;
            }
            if ( code === "" ){
                layer.msg("验证码不能为空", { icon: 2, time: 2000 }, function () {
                    $("#login").removeAttr("disabled");
                });
                return false;
            }



            if ( isSlider === false ){
                var resData = $.sendData(strObgect, strSign, "/api/aliVerificaCode");
                isSlider = resData.data;
                if(isSlider === false) {
                    layer.msg("拖动滑动验证", {icon: 2, time: 1500}, function () {
                        $("#login").removeAttr("disabled");
                    });
                    return false;
                }
            }else {
                //  将数据拼接成字符串
                var param = {userName:username,password:password,code:code};
                $.ajaxSendData(param, "/api/auth", function(resData){
                    var datas = resData.data;
                    var token = datas.token;
                    var key = datas.randomKey;
                    $.loginSet(token, key);
                    var cookies = $.getToken();
                    // history.back();
                    window.location.href = "./index.html";
                }, function(resData){
                    layer.msg( resData.msg, { icon: 2, time: 1500 }, function () {
                        $("#login").removeAttr("disabled");
                    });
                    return false;
                });
            }
        },
        //  用户登录(英文版)
        "userLoginEn": function () {
            var username = $("#username").val();
            var password = $("#password").val();
            var code = $("#moble_verify").val();

            $("#login").attr("disabled", "disabled");
            if ( username === "" ){
                layer.msg("Username can not be empty", { icon: 2, time: 2000 }, function () {
                    $("#login").removeAttr("disabled");
                });
                return false;
            }

            if ( password === "" ){
                layer.msg("Password can not be blank", { icon: 2, time: 2000 }, function () {
                    $("#login").removeAttr("disabled");
                });
                return false;
            }

            if ( code === "" ){
                layer.msg("验证码不能为空", { icon: 2, time: 2000 }, function () {
                    $("#login").removeAttr("disabled");
                });
                return false;
            }
            if ( isSlider === false ){
                layer.msg( "Drag and drop verification", { time: 1500 }, function () {
                    $("#login").removeAttr("disabled");
                });
                return false;
            }else {
                //  将数据拼接成字符串
                var param = {userName:username,password:password};
                var resData = $.ajaxSendData(param, "/api/auth", function(resData){
                    var datas = resData.data;
                    var token = datas.token;
                    var key = datas.randomKey;
                    $.loginSet(token, key);
                    var cookies = $.getToken();
                    // history.back();
                    window.location.href = "./index.html";
                }, function(resData){
                    layer.msg( resData.msg, { time: 1500 }, function () {
                        $("#login").removeAttr("disabled");
                    });
                    return false;
                });
            }
        },
        //  BASE64 加密
        "base64Encrypt":function (str) {
            var wordArray = CryptoJS.enc.Utf8.parse(str);
            var base64 = CryptoJS.enc.Base64.stringify(wordArray);
            return base64;
        },
        //  BASE64 解密
        "base64Decrypt":function (str) {
            var parsedWordArray = CryptoJS.enc.Base64.parse(str);
            var parsedStr = parsedWordArray.toString(CryptoJS.enc.Utf8);
            return parsedStr;
        },
        //  输入款只允许输入数字和小数
        "onlyNumber":function (obj) {
            //得到第一个字符是否为负号
            var t = obj.value.charAt(0);
            //先把非数字的都替换掉，除了数字和.
            obj.value = obj.value.replace(/[^\d\.]/g, '');
            //必须保证第一个为数字而不是.
            obj.value = obj.value.replace(/^\./g, '');
            //保证只有出现一个.而没有多个.
            obj.value = obj.value.replace(/\.{2,}/g, '.');
            //保证.只出现一次，而不能出现两次以上
            obj.value = obj.value.replace('.', '$#$').replace(/\./g, '').replace(
                '$#$', '.');
            obj.value = obj.value.replace(/^(\-)*(\d+)\.(\d\d).*$/,'$1$2.$3'); // 只能输入两个小数
            //如果第一位是负号，则允许添加
            if (t == '-') {
                obj.value = '-' + obj.value;
            }
        },
        //  输入款只允许输入数字和小数,如果小数点后的数字全为0，则清除掉
        "onlyNumberSubstrZero":function (obj) {
            //得到第一个字符是否为负号
            var t = obj.value.charAt(0);
            //先把非数字的都替换掉，除了数字和.
            obj.value = obj.value.replace(/[^\d\.]/g, '');
            //必须保证第一个为数字而不是.
            obj.value = obj.value.replace(/^\./g, '');
            //保证只有出现一个.而没有多个.
            obj.value = obj.value.replace(/\.{2,}/g, '.');
            //保证.只出现一次，而不能出现两次以上
            obj.value = obj.value.replace('.', '$#$').replace(/\./g, '').replace(
                '$#$', '.');
            obj.value = obj.value.replace(/^(\-)*(\d+)\.(\d\d).*$/,'$1$2.$3'); // 只能输入两个小数

            var regx = obj.match(/\d+\.\d+/g);
            for ( var index in regx) {
                obj = obj.replace(regx[index],parseFloat(regx[index]));
            }

            //如果第一位是负号，则允许添加
            if (t == '-') {
                obj.value = '-' + obj.value;
            }
        },
        // num：待四舍五入数值，len：保留小数位数
        "getRound":function (num,len) {
            return Math.round(num * Math.pow(10, len)) / Math.pow(10, len);
        },
        "cutStr":function (s, type) {
            if (/[^0-9\.]/.test(s))
                return "0";
            if (s == null || s == "")
                return "0";
            s = s.toString().replace(/^(\d*)$/, "$1.");
            s = (s + "00").replace(/(\d*\.\d\d)\d*/, "$1");
            s = s.replace(".", ",");
            var re = /(\d)(\d{3},)/;
            while (re.test(s))
                s = s.replace(re, "$1,$2");
            s = s.replace(/,(\d\d)$/, ".$1");
            if (type == 0) {// 不带小数位(默认是有小数位)
                var a = s.split(".");
                if (a[1] == "00") {
                    s = a[0];
                }
            }
            return s;
        },
        "zhCnRedirect1":function (url) {
            window.location.href = "../../" + url;
        },
        "zhCnRedirect2":function (url) {
            window.location.href = "../../../" + url;
        },
        //  切割相应小数点后位数，并将小数点后多余的0 清空
        "cutRoundNum":function ( value , num ) {
            var value = value.toString();
            value =  value.substr(0,value.indexOf('.')+1) + value.substr(value.indexOf('.')+1,num);

            var regx = value.match(/\d+\.\d+/g);
            for ( var index in regx) {
                value = value.replace(regx[index],parseFloat(regx[index]));
            }
            return value;
        },
        "passwordStrength": function(objvalue){
            var chckeStrengthreg = /^(?:(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])).{6,20}$/;
            if(chckeStrengthreg.test(objvalue) && objvalue.length >= 6){
                return true;
            }else{
                return false;
            }
        },
        "beforePage": function(){
            var url = ""
            if(window.location.href.indexOf("/main") != -1){
                url = window.location.href.split("/main")[1];
            }
            var sessionStorage;
            if(window.sessionStorage){
                sessionStorage = window.sessionStorage;
            }
            sessionStorage.beforeUrl = url;
        },
        "weakenText": function(obj){
            for(var i = 0; i < obj.length; i++){
                var text1 = obj.eq(i).html().split(/\s{1}/)[0];
                var text2 = obj.eq(i).html().split(/\s{1}/)[1];
                obj.eq(i).html(text1 + " <strong class='weaken_text'>" + text2 + " </strong>")
            }
        },

        "weakenCoin": function(obj){
            for(var i = 0; i < obj.length; i++){
                var text1 = obj.eq(i).find("span").html().split(/\//)[0];
                var text2 = obj.eq(i).find("span").html().split(/\//)[1];
                obj.eq(i).find("span").html(text1 + "<strong class='weaken_coin'>/" + text2 + " </strong>")
            }
        },

        "toIndex1":function () {
            var index = layer.load(2, {
                time: 10*1000,
                shade: [0.75,'#000'] //0.1透明度的白色背景
            });
            layer.msg(langPkg.getI18N("ningshangweidenglu..."), { time: 1000, icon: 6 }, function () {
                $.beforePage();
                layer.close(index);
                delCookie(user_key);
                delCookie(Token_key);
                window.location.href = "../../login.html";
            })
        },
        "toIndexEn1":function () {
            var index = layer.load(2, {
                time: 10*1000,
                shade: [0.75,'#000'] //0.1透明度的白色背景
            });
            layer.msg("You are not logged in. You are now jumping to the login page...", { time: 1000, icon: 6 }, function () {
                layer.close(index);
                delCookie(user_key);
                delCookie(Token_key);
                window.location.href = "../../login.html";
            })
        },
        "toIndex2":function () {
            var index = layer.load(2, {
                time: 10*1000,
                shade: [0.75,'#000'] //0.1透明度的白色背景
            });
            layer.msg(langPkg.getI18N("ningshangweidenglu..."), { time: 1500, icon: 6 }, function () {
                layer.close(index);
                delCookie(user_key);
                delCookie(Token_key);
                window.location.href = "../../login.html";
            })
        },
        "toIndexEn2":function () {
            var index = layer.load(2, {
                time: 10*1000,
                shade: [0.75,'#000'] //0.1透明度的白色背景
            });
            layer.msg("You are not logged in. You are now jumping to the login page...", { time: 1500, icon: 6 }, function () {
                layer.close(index);
                delCookie(user_key);
                delCookie(Token_key);
                window.location.href = "../../login.html";
            })
        },
        "toIndex3":function () {
            var index = layer.load(2, {
                time: 10*1000,
                shade: [0.75,'#000'] //0.1透明度的白色背景
            });
            layer.msg(langPkg.getI18N("ningshangweidenglu..."), { time: 1500, icon: 6 }, function () {
                layer.close(index);
                delCookie(user_key);
                delCookie(Token_key);
                window.location.href = "../../../login.html";
            })
        },
        "toIndexEn3":function () {
            var index = layer.load(2, {
                time: 10*1000,
                shade: [0.75,'#000'] //0.1透明度的白色背景
            });
            layer.msg("You are not logged in. You are now jumping to the login page...", { time: 1500, icon: 6 }, function () {
                layer.close(index);
                delCookie(user_key);
                delCookie(Token_key);
                window.location.href = "../../../login.html";
            })
        },
        "loadDefaultImg1":function ( obj ) {
            obj.src = "../images/default/defaultIndexImg.jpg";
        },
        "loadDefaultImg2":function ( obj ) {
            obj.src = "../../images/default/defaultMarketImg.jpg";
        },
        "loadDefaultImg3":function ( obj ) {
            obj.src = "../../images/default/defaultIndexImg.jpg";
        },
        //  设置浏览器默认语言，并且将其存入到cookie当中
        "setAcceptLanguage":function (name) {
            // setCookieOneDay("ATcoinAcceptLanguage",name);
        },
        //  国际化切换，将当前语言的字符串切换成对应语言字符串并实现跳转操作。
        "setLanguageToLogin":function ( url , name ) {
            var arr = ['zh_cn','en_us','ko_kr','zh_CN','en_US','ko_KR'];

            for ( var i = 0 ; i < arr.length ; i++ ){
                if ( url.indexOf(arr[i]) != -1 ){
                    url = url.replace(arr[i],name.toLowerCase());
                }
            }
            return url;
        },
        "usernameType":function ( str ) {
            var username = "";
            //  判断是否是手机号
            var phoneRegx = /^(13[0-9]|14[579]|15[0-3,5-9]|16[6]|17[0135678]|18[0-9]|19[89])\d{8}$/;
            var isPhone = phoneRegx.test(str);
            //  将其用 * 号替换
            if ( isPhone ){
                username = str.replace(/(\d{3})\d{4}(\d{4})/, "$1****$2");
                return username;
            }

            //  判断是否是邮箱
            var emailRegx = /^([a-z0-9A-Z]+[-|\.]?)+[a-z0-9A-Z]@([a-z0-9A-Z]+(-[a-z0-9A-Z]+)?\.)+[a-zA-Z]{2,}$/;
            var isEmail = emailRegx.test(str);
            //  将其用 * 号替换
            if ( isEmail ){
                username = str.replace(/(\w?)(\w+)(\w)(@\w+\.[a-z]+(\.[a-z]+)?)/,"$1****$3$4");
                return username;
            }
        },
        /**
         * 手机号验证
         * @param phone
         * @returns {boolean}
         */
        "phoneNumberIsTrue": function (phone) {
            //  判断是否是手机号
            var phoneRegx = /^(13[0-9]|14[579]|15[0-3,5-9]|16[6]|17[0135678]|18[0-9]|19[89])\d{8}$/;
            var isPhone = phoneRegx.test(phone);
            return isPhone;
        },
        /**
         * 是否是正确的邮箱格式
         * @param email
         * @returns {boolean}
         */
        "emailIsTrue": function (email) {
            var emailRegx = /^([a-z0-9A-Z]+[\_|\-|\.]?)+[a-z0-9A-Z]@([a-z0-9A-Z]+(-[a-z0-9A-Z]+)?\.)+[a-zA-Z]{2,}$/;
            var isEmail = emailRegx.test(email);
            return isEmail;
        },
        /**
         * 将手机号格式化
         * @param phone
         * @returns {*}
         */
        "phoneToStar": function ( phone ) {
            return phone.replace(/(\d{3})\d{4}(\d{4})/, "$1****$2");
        },
        "emailToStar": function ( email ) {
            return email.replace(/(\w?)(\w+)(\w)(@\w+\.[a-z]+(\.[a-z]+)?)/,"$1****$3$4");
        },
        "luhmCheck":function (bankno) {
            var lastNum=bankno.substr(bankno.length-1,1);//取出最后一位（与luhm进行比较）

            var first15Num=bankno.substr(0,bankno.length-1);//前15或18位
            var newArr=new Array();
            for(var i=first15Num.length-1;i>-1;i--){    //前15或18位倒序存进数组
                newArr.push(first15Num.substr(i,1));
            }
            var arrJiShu=new Array();  //奇数位*2的积 <9
            var arrJiShu2=new Array(); //奇数位*2的积 >9

            var arrOuShu=new Array();  //偶数位数组
            for(var j=0;j<newArr.length;j++){
                if((j+1)%2==1){//奇数位
                    if(parseInt(newArr[j])*2<9)
                        arrJiShu.push(parseInt(newArr[j])*2);
                    else
                        arrJiShu2.push(parseInt(newArr[j])*2);
                }
                else //偶数位
                    arrOuShu.push(newArr[j]);
            }

            var jishu_child1=new Array();//奇数位*2 >9 的分割之后的数组个位数
            var jishu_child2=new Array();//奇数位*2 >9 的分割之后的数组十位数
            for(var h=0;h<arrJiShu2.length;h++){
                jishu_child1.push(parseInt(arrJiShu2[h])%10);
                jishu_child2.push(parseInt(arrJiShu2[h])/10);
            }

            var sumJiShu=0; //奇数位*2 < 9 的数组之和
            var sumOuShu=0; //偶数位数组之和
            var sumJiShuChild1=0; //奇数位*2 >9 的分割之后的数组个位数之和
            var sumJiShuChild2=0; //奇数位*2 >9 的分割之后的数组十位数之和
            var sumTotal=0;
            for(var m=0;m<arrJiShu.length;m++){
                sumJiShu=sumJiShu+parseInt(arrJiShu[m]);
            }

            for(var n=0;n<arrOuShu.length;n++){
                sumOuShu=sumOuShu+parseInt(arrOuShu[n]);
            }

            for(var p=0;p<jishu_child1.length;p++){
                sumJiShuChild1=sumJiShuChild1+parseInt(jishu_child1[p]);
                sumJiShuChild2=sumJiShuChild2+parseInt(jishu_child2[p]);
            }
            //计算总和
            sumTotal=parseInt(sumJiShu)+parseInt(sumOuShu)+parseInt(sumJiShuChild1)+parseInt(sumJiShuChild2);

            //计算Luhm值
            var k= parseInt(sumTotal)%10==0?10:parseInt(sumTotal)%10;
            var luhm= 10-k;

            if(lastNum==luhm && lastNum.length != 0){
                return true;
            }
            else{
                return false;
            }
        },
        "pwdVerifyCN": function ( pwd ) {
            var flag = false;
            if ( pwd.length < 6 ){
                flag = true;
                layer.msg("密码位数请大于6位！");
                return flag;
            }
            return flag;
        },
        "pwdVerifyEN": function ( pwd ) {
            var flag = false;
            if ( pwd.length < 6 ){
                flag = true;
                layer.msg("Password number more than 6！");
                return flag;
            }
            return flag;
        }
    });

    //获取用户key
    function getKey() {
        try {
            var key = getCookie(user_key);
            return key;
        } catch (e) {
            return "";
        }

    }
    ///<summary>
    /// 创建一个cookie(会话级别)
    ///</summary>
    function setCookie(key, value) {
        $.cookie(key, value,{path:'/'});
    }
    ///<summary>
    /// 创建一个cookie(时间限制 1 天)
    ///</summary>
    function setCookieOneDay(key, value) {
        $.cookie(key, value,{path:'/',expires: 1});
    }
    ///<summary>
    /// 获取cookie
    ///</summary>
    function getCookie(key) {
        try {
            var value = $.cookie(key);
            return undefinedCheck(value);
        } catch (e) {
            return "";
        }
    }
    ///<summary>
    /// 删除cookie
    ///</summary>
    function delCookie(key) {
        return $.cookie(key, null,{path:'/'});
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

    function passWord(str) {
        try {
            str = CryptoJS.MD5(str).toString();
            return CryptoJS.MD5(str).toString();
        } catch (e) {
            return "";
        }
    }
})(window.jQuery);

