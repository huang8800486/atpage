//  获得公告信息
var noticeArray = [];
getNoticeList();
function getNoticeList() {
	var parm = {
		pageSize : 1,
		pageTo : 1,
		type : "notice",
        adaptationtype: 2,
		languageType : 1
	}
	$.ajaxSendData(parm, "/api/article/getArticleList", function(resData) {
		// 获得公告列表的长度
		var noticeLength = resData.data.length;
		if (noticeLength > 0) {
			
			for (i = 0; i < noticeLength; i++) {
				if (resData.data[i].index == 1) {
					noticeArray.push(resData.data[i]);
				}
			}
			var da = {
				"list" : noticeArray
			};
			var _html = template('list_Notice', da); // template("模版名","数据集")
			$("#div_noticeList").html(_html);
			//判断用户是否点击关闭
			if(localStorage.isCloseNotice == 'close'){
                if(noticeArray[0].createTime == localStorage.oldNoticeCreateTime){
                    $(".top_wrap-article").hide();
                    $(".view_body").removeClass("active");
                    return false;
                }else{
                    localStorage.oldNoticeCreateTime = noticeArray[0].createTime;
                    localStorage.isCloseNotice = '';
                    $(".top_wrap-article").show();
                    $(".view_body").addClass("active");
                }
			}else{
				$(".top_wrap-article").show();
                $(".view_body").addClass("active");
			}
		} else {
			$(".top_wrap-article").hide();
		}
		langPkg.loadLanguage("gengduo");
	});
}

function closeNotice(){
	localStorage.isCloseNotice = 'close';
    localStorage.oldNoticeCreateTime = noticeArray[0].createTime;
}

jQuery(document).ready(function () {
    $(".top-article").on("click",".btn-close", function(){
        $(".top_wrap-article").hide();
        $(".view_body").removeClass("active");
    })
});