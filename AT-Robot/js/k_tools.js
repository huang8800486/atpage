var gateways = null;
var kTokenKey = null;
var ZH_CN = "/zh_cn/";
(function ($) {
    var Token_key = "user_authentication_ai";
    var user_key = "user_key_ai";
    // var gateway = "http://192.168.1.114:8089";
    //var gateway = "https://test.at3.com";
    var gateway = "http://localhost:8089";
    gateways = gateway;
    kTokenKey = Token_key;
    //扩展jQuery对象本身
    jQuery.extend({
        /// <summary>
        /// 图片目录
        ///</summary>
        "imgFilePath": function () {
            // return "http://58.64.132.212:8089/api/file/get/";
             return "https://test.at3.com/";
            // return "http://192.168.1.114:8089/api/file/get/";
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
            delCookie(user_key);
            delCookie(Token_key);
            var resData = $.sendData("","/api/automatic/logout")
            window.location.href = "login.html"  
        },
        ///<summary>
        /// 请求数据
        ///</summary>
        "sedDatas": function (obj, strApi) {        	
            var data;
            $.ajax({
                type: "POST",
                timeout: 10000, //超时时间设置，单位毫秒
                url: gateway + strApi,
                data:obj,
                async: false,
                dataType: "Json",
                contentType: "application/x-www-form-urlencoded;charset=UTF-8",
                beforeSend: function (xhr) {
                    var Authorization = getCookie(Token_key);
                    xhr.setRequestHeader("Access-Control-Allow-Origin", "*");
                    xhr.setRequestHeader("Accept", "*/*");
                    xhr.setRequestHeader("Access-Control-Max-Age", "3600");
                    xhr.setRequestHeader("Authorization", "Automatic ");
                },
                complete: function (XMLHttpRequest, status) { //请求完成后最终执行参数
                    if (status == 'timeout') {//超时,status还有success,error等值的情况
                        return { code: -101, msg: "请求超时" }
                    }
                    //console.log(123);
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    data = XMLHttpRequest.responseJSON;
					/*console.log(XMLHttpRequest);
					console.log(textStatus);
					console.log(errorThrown);*/
					//console.log(123);
                },
                success: function (resdata) {
                    data = resdata;
                    //console.log(resdata);
                }
            });

            return data;
        },
         
        "sendData": function (obj, strApi) {
        	
            var data;
            $.ajax({
                type: "POST",
                timeout: 10000, //超时时间设置，单位毫秒
                url: gateway + strApi,
                data:obj,
                async: false,
                dataType: "Json",
                contentType: "application/x-www-form-urlencoded;charset=UTF-8",
                beforeSend: function (xhr) {
                    var Authorization = getCookie(Token_key);
                    xhr.setRequestHeader("Access-Control-Allow-Origin", "*");
                    xhr.setRequestHeader("Accept", "*/*");
                    xhr.setRequestHeader("Access-Control-Max-Age", "3600");
                    xhr.setRequestHeader("Authorization", "Automatic " + Authorization);
                },
                complete: function (XMLHttpRequest, status) { //请求完成后最终执行参数
                    if (status == 'timeout') {//超时,status还有success,error等值的情况
                        return { code: -101, msg: "请求超时" }
                    }
                    //console.log(123);
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    data = XMLHttpRequest.responseJSON;
					/*console.log(XMLHttpRequest);
					console.log(textStatus);
					console.log(errorThrown);*/
					//console.log(123);
                },
                success: function (resdata) {
                    data = resdata;
                    //console.log(resdata);
                }
            });

            return data;
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
            //  将数据拼接成字符串
            var str = {userName:username,password:$.md5Encrypt(password)};
            var resData = $.sedDatas(str,"/api/automatic/login")
            /*console.log(str);
            console.log(resData);*/
           if($('#checkbox-1').prop("checked") == true) { //这里要使用is(":checked")判断是否勾选
                $.cookie("rmbUser", "true", {
                    expires: 7
                }); //存储一个带7天期限的cookie
                $.cookie("username", username, {
                    expires: 7
                });
                $.cookie("password", password, {
                    expires: 7
                });
            } else {
                $.cookie("rmbUser", "false", {
                    expire: -1
                });
                $.cookie("username", "", {
                    expires: -1
                });
                $.cookie("password", "", {
                    expires: -1
                });
            }           
            if (resData.code == 200) {
                var datas = resData.data;
                var token = datas.token;
                var key = datas.randomKey;
                $.loginSet(token, key);
                setCookie("deployname",username);
                setCookie("deploypwd",password);
                window.location.href = "index.html"                
            } else {
                layer.msg(resData.msg);
              /*alert("账号密码错误")*/
            }
        },
        //  md5 加密
        "md5Encrypt":function (str) {
        	var str1 = CryptoJS.MD5(str).toString();
        	var str2 = CryptoJS.MD5(str1).toString();
        	console.log(str2);
        	return str2;
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
    /// 创建一个cookie
    ///</summary>
    function setCookie(key, value) {
        $.cookie(key, value, {
            path: "/"
        });
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
        return $.cookie(key, null, {
            path: "/"
        });
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