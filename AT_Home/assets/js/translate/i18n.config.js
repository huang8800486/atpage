/**
 * i18n打语言包配置文件
 */
(function(window){
	var language = window.localStorage.getItem("now_new_lang");
	var langPkg = {
		map: {},
		now_lang : language?language:'zh_CN', // 0:zh,1:en
		loadProperties : function(new_lang){
			var _this = this;
			window.localStorage.setItem("now_new_lang",new_lang);
			var self = this;
			$.i18n.properties({//加载资浏览器语言对应的资源文件
				name: 'lang', //资源文件名称
				path:'/assets/js/translate/i18n/', //资源文件路径
				language: new_lang,
				cache: false,
				mode:'map', //用Map的方式使用资源文件中的值
				callback: function() {//加载成功后设置显示内容
					_this.map = $.i18n.map;
					for(var i in $.i18n.map){
						$('[translate="'+i+'"]').text($.i18n.map[i]);
					}
                    
                    // input的placeholder
                    try {
                        
                        $('[data-i18n-placeholder]').each(function () {
                            $(this).attr('placeholder', $.i18n.prop($(this).data('i18n-placeholder')));
                        });
                    }

                    catch(ex){}
				}
			});
			self.now_lang = new_lang;
		},
		getI18N: function(key) {
			if(jQuery.isEmptyObject(this.map)){
				this.loadProperties(this.now_lang);
			}
			return this.map[key];
		},
		loadLanguage: function(key) {
			$('[translate="'+key+'"]').text($.i18n.map[key]);
		},
        getAdLanguage: function(){
            switch(langPkg.now_lang){
                case "zh_CN":
                    return 1;
                case "en_US":
                    return 2;
                case "ru":
                    return 3;
                case "fr":
                    return 4;
                case "kr":
                    return 5;
                case "ja":
                    return 6;
                case "es":
                    return 7;
                default:
                    return 1;
            }
        }
	}
	window.langPkg = langPkg;
})(window);
