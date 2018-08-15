(function ($) {
    //扩展jQuery对象本身
    jQuery.extend({
        /// <summary>
        /// 判断Token是否为空
        ///</summary>
        "MarketTitle": function (marketId) {
            var id = marketId;
            var param = {
                id: id
            };
            var strObgect = $.toBase64(param);
            var strSign = $.toSign(strObgect);

            var resData = $.sendData(strObgect, strSign, "/api/market/list");

            if (resData.code == 200) {
                return resData.data[0].title+"("+resData.data[0].name.toUpperCase().replace("_","/") + ")";
            }
        }

    })

})(window.jQuery);