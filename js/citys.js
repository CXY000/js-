
$.ajax({
//	var citys=[]
    url: 'aa/ar/getLongitudeAndLatitude',
    type: 'GET',
    success: function(pointa) {
	if(pointa.code == 200){
		console.log(pointa.data)
	}else{
		
	}
   },
    cache: false
});
//
//	{"lnglat":[116.258446,37.686622],"name":"景县","style":2},
//	{"lnglat":[116.5267180000,39.9051770000],"name":"景县","style":2},
//	
//]