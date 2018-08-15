    var nc = null;
    var isNC = {};

    function createNCToWEB(_this,username, smsType, obj, callback){
    	if(isNC[username]){
    		SendCode(_this, username, smsType, obj, callback);
    		return;
    	}
        //阿里验证码
        //获取随机参数
        var nc_token = ["FFFF0N000000000060CB", (new Date()).getTime(), Math.random()].join(':');
        var NC_Opt = {
            renderTo: "#aliSliderBox",
            appkey: "FFFF0N000000000060CB",
            scene: "nc_register",
            token: nc_token,
            customWidth: 310,
            trans:{"key1":"code0"},
            elementID: ["usernameID"],
            is_Opt: 0,
            language: "cn",
            isEnabled: true,
            timeout: 3000,
            userName: username,
            times:5,
            apimap: {
            },
            callback: function (data) {
                var username = this.opt.userName;
                var parm = {
                    nc_token: nc_token,
                    csessionid: data.csessionid,
                    sig:data.sig,
                    appkey: "FFFF0N000000000060CB",
                    username: username,
                    scene: "nc_register"
                };
                $.ajaxSendData(parm, "/api/aliVerificaCode", function(resData){
                    isSlider = resData.data;
                    if(isSlider){
                    	isNC[username] = true;
                        SendCode(_this, username, smsType, obj, callback);
                    }else{
                        layer.msg( resData.msg, { time: 1500 } );
                    }
                    __nc.reset();

                    $("#modelBox").modal('close');
                });
            },
            error: function (s) {
                alert(s)
            }
        }

        nc = new noCaptcha(NC_Opt)
        nc.upLang('cn', {
            _startTEXT: langPkg.getI18N("huasdong"),
            _yesTEXT: langPkg.getI18N("yanzhengtongguo"),
            _error300: langPkg.getI18N("chucuol"),
            _errorNetwork: langPkg.getI18N("wanglluobugeili"),
        })
    }

    function createNCToH5(_this,username, smsType, obj, callback){
    	if(isNC[username]){
    		SendCode(_this, username, smsType, obj, callback);
    		return;
    	}
        var nc_token = ["FFFF0N000000000060CB", (new Date()).getTime(), Math.random()].join(':');
        nc=NoCaptcha.init({
            renderTo: '#aliSliderBox',
            appkey: 'FFFF0N000000000060CB',
            scene: 'nc_register_h5',
            token: nc_token,
            trans: {"key1": "code200"},
            elementID: ["usernameID"],
            is_Opt: 0,
            language: "cn",
            timeout: 10000,
            userName: username,
            retryTimes: 5,
            errorTimes: 5,
            inline:false,
            apimap: {
                // 'analyze': '//a.com/nocaptcha/analyze.jsonp',
                // 'uab_Url': '//aeu.alicdn.com/js/uac/909.js',
            },
            bannerHidden:false,
            initHidden:false,
            callback: function (data) {
                var username = this.userName;
                var parm = {
                    nc_token: nc_token,
                    csessionid: data.csessionid,
                    sig:data.sig,
                    appkey: "FFFF0N000000000060CB",
                    username: username,
                    scene: "nc_register"
                };
                $.ajaxSendData(parm, "/api/aliVerificaCode", function(resData){
                    isSlider = resData.data;

                    if(isSlider){
                    	isNC[username] = true;
                        SendCode(_this, username, smsType, obj, callback);
                    }else{
                        layer.msg( resData.msg, { time: 1500 } );
                    }
                    nc.reset();

                    $("#modelBox").modal('close');
                });
                
            },
            error: function (s) {
                alert(s)
            }
        });
        NoCaptcha.setEnabled(true);
        nc.reset();//请务必确保这里调用一次reset()方法
        NoCaptcha.upLang('cn', {
            'LOADING':"加载中...",//加载
            'SLIDER_LABEL': "请向右滑动验证",//等待滑动
            'CHECK_Y':"验证通过",//通过
            'ERROR_TITLE':"非常抱歉，这出错了...",//拦截
            'CHECK_N':"验证未通过", //准备唤醒二次验证
            'OVERLAY_INFORM':"经检测你当前操作环境存在风险，请输入验证码",//二次验证
            'TIPS_TITLE':"验证码错误，请重新输入"//验证码输错时的提示
        });
    }

    function OpenAliValidate(_this, username, smsType, obj, callback){
        var system = {};
        var p = navigator.platform;
        system.win = p.indexOf("Win") == 0;
        system.mac = p.indexOf("Mac") == 0;
        system.x11 = (p == "X11") || (p.indexOf("Linux") == 0);
        if(system.win||system.mac||system.xll){
            //电脑执行web pc滑动解锁
            createNCToWEB(_this, username, smsType, obj, callback);
        }else{
            //手机执行H5滑动解锁
            createNCToH5(_this, username, smsType, obj, callback);
        }
        if(!isNC[username]){
        	$("#modelBox").modal({
                width : 360,
                height : 200,
                closeViaDimmer : false,
            });
        }
    }


    //  获取短信验证码
    function SendCode(aliButton, username, smsType, obj, callback) {
        //  如果滑动条已经验证通过
        // var email = $.emailIsTrue(username);//邮箱正则表达式
        var phone = /^1[3456789]\d{9}$/;//手机正则表达式
        if($.emailIsTrue(username)){

        }else if(phone.test(username)){

        }else{
            layer.msg(langPkg.getI18N("username_right"), { icon: 2, time: 1500 });
            return false;
        }
        var param = {
            username: username,
            type: smsType
        };

        $(aliButton).attr("disabled", "disabled");
        var strObgect = $.toBase64(param);
        var strSign = $.toSign(strObgect);
        $.ajax({
            type: "POST",
            url: $.getGateway() + "/api/user/sendCode",
            data: JSON.stringify({ "object": strObgect, "sign": strSign }),
            async: true,
            dataType: "json",
            contentType: "application/json;charset=UTF-8",
            beforeSend: function (xhr) {
                var Authorization = $.getToken();
                xhr.setRequestHeader("Access-Control-Allow-Origin", "*");
                xhr.setRequestHeader("Accept", "*/*");
                xhr.setRequestHeader("Access-Control-Max-Age", "3600");
                if(Authorization != ""){
                    xhr.setRequestHeader("Authorization", "Bearer " + Authorization);
                }else{
                    xhr.setRequestHeader("Authorization", "Bearer" + Authorization);
                }
                xhr.setRequestHeader("Access-Control-Max-Age", "3600");
                if (langPkg.now_lang == "zh_CN"){
                    xhr.setRequestHeader("Accept-language", $.language.zh_CN);
                }else{
                    xhr.setRequestHeader("Accept-language", $.language.en_US);
                }
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                data = XMLHttpRequest.responseJSON;
            },
            success: function (resData) {
                if (resData.code == 200) {
                    isGetVerificationCode = 1;
                    var wait = 60;
                    var interval = setInterval(function () {
                        obj.html(wait + langPkg.getI18N("miaohoufasong"));
                        $(aliButton).addClass("no_sendCode")
                        wait--;
                        if (wait < 0) {
                            clearInterval(interval);
                            obj.html(langPkg.getI18N("mobile_verify_get"));
                            $(aliButton).removeClass("no_sendCode").removeAttr("disabled");
                        }
                    }, 1000);
                    if (callback) {
                        callback(username);
                    }
                    /*$(".login-group-setp-code").show();
                    $(".login-group-setp-username").hide();
                    $("#sendId").html($.usernameType(username))*/
                    // $("#slider").slider("restore");
                } else {
                    layer.msg(resData.msg, { icon: 2, time: 2000 }, function () {
                        $(aliButton).removeAttr("disabled");
                    });
                }
            }
        });
    }