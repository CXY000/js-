//广告图点击删除
var advert=document.getElementById("advert");
var btn=advert.getElementsByTagName("button")[0];
btn.onclick=function(){
	advert.setAttribute("class","hide");
//	点击之前 点击之后
}
//广告图点击删除取消