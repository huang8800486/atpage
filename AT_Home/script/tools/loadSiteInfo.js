/*$(function () {
    // $("footer").attr("style","margin-top:33px;");
    $.ajaxSendData("", "/api/home/getJyConfig", function(resData){
        $("title").html(resData.data.webTitle);
        $(".copyright").html(resData.data.caseNumber);
        //  设置LOGO
        // $("#webLogo").attr("src",$.imgFilePath()+resData.data.webLogo);
        //  设置底部LOGO
        $("#webLogoBottom").attr("src",$.imgFilePath()+resData.data.webLogoBottom);
        //  设置小LOGO
        $("#webLogoSmall").attr("src",$.imgFilePath()+resData.data.webLogoSmall);
    });
});

function logout() {
    $.loginOut();
    window.location.href = '../index.html';
}*/
