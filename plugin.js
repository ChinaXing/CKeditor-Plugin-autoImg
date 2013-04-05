CKEDITOR.plugins.add('autoImg',
{
   requires: ['ajax'],
   init : function(editor)
   {
        var config = editor.config;
        var autoImg_url = config['autoImgUrl'] || '/autoImg/';	
        editor.addCommand('autoImg',
	{
	     exec: function(editor)
	     {
	          var content=editor.getData();
		  var imgUrls = content.match(/<img +([^>\s]+ +)*src=[^>\s]+(\/|>|\s+)/g)||[];
		  var url_set = {};
		  var url_array = [];
		  for(var i=0;i<imgUrls.length;i++){
		      var url=imgUrls[i].match(/ +src=([^>\s]+)/)[1];
		      if(!url.match(/^("|')?http:\/\//)){
			  continue;
		      }
		      if(!url_set[url]){
		         url_set[url] = 1;
			 url_array.push(url);
		      }
		  }

		  if(0 == url_array.length) return true;
		  // 请求server端进行转换
                  var new_url_array=[];
		  var dummy_DOM=document.createElement();

		  for(var i=0;i<url_array.length;i++){
		      var url=url_array[i];
		      dummy_DOM.innerHTML=url;
		      var clean_url = escape(dummy_DOM.innerText);
		      var result=CKEDITOR.ajax.load(autoImg_url+'?imgsrc='+clean_url);
                      var result_json = eval('(' + result + ')');
		      if(result_json.result == "error"){
		          alert("convert error for: " +url + ' ( ' + result_json.data + ')');
		      }else{
			url_set[url]=result_json.data.url;
		      }
		  }

		  //对文章内容中的图片地址进行替换
		  for(var i=0;i<url_array.length;i++){
		      var url=url_array[i];
		      if (url_set[url] == 1){
		          continue;
		      }
		      content=content.replace(url,url_set[url]);
		  }
                  //更新内容
	          editor.setData(content);
	     }
	});

	editor.ui.addButton('autoImg',
	{
	     label:'auto upload image',
	     command: 'autoImg',
	     icon: this.path + 'images/autoImg.png'
	});
   }
});
