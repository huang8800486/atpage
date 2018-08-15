$(function(){	
	$(".name_ul").hide();
	$(".name").mouseover(function(){
		$(".name_ul").show()
	});
	$(".name").mouseout(function(){
		$(".name_ul").hide()
	})/*个人资料显示隐藏*/
	
	$('.inactive').click(function(){
		if($(this).siblings('ul').css('display')=='none'){
			$(this).parent('li').siblings('li').removeClass('inactives');
			$(this).addClass('inactives');
			$(this).siblings('ul').slideDown(100).children('li');
			if($(this).parents('li').siblings('li').children('ul').css('display')=='block'){
				$(this).parents('li').siblings('li').children('ul').parent('li').children('a').removeClass('inactives');
				$(this).parents('li').siblings('li').children('ul').slideUp(100);

			}
		}else{
			//控制自身变成+号
			$(this).removeClass('inactives');
			//控制自身菜单下子菜单隐藏
			$(this).siblings('ul').slideUp(100);
			//控制自身子菜单变成+号
			$(this).siblings('ul').children('li').children('ul').parent('li').children('a').addClass('inactives');
			//控制自身菜单下子菜单隐藏
			$(this).siblings('ul').children('li').children('ul').slideUp(100);

			//控制同级菜单只保持一个是展开的（-号显示）
			$(this).siblings('ul').children('li').children('a').removeClass('inactives');
		}
	});/*导航菜单*/
		
	function ListOperate(){
		var tr =$('#tbList').find('tr');  
	    var len = tr.length;      
	    for(var i = 0;i < len;i++){   
	    	var tdArr = tr.eq(i).find("td");
	        var firstTdText = tdArr.eq(5).html();
	        console.log(firstTdText);
	    };
	    for(var i = 0;i < len;i++){   
	    	var tdArr = tr.eq(i).find("td");
	        var TdText = tdArr.eq(6);
	        console.log(TdText);
	    }	    
	    if (firstTdText=="未完成") {
			$(this).siblings(TdText).show();
		} else{
			$(this).siblings(TdText).hide();
		}
	};
	ListOperate();
	
})