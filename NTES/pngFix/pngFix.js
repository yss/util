/**
 * png fix by yansong@corp.netease.com at 2011-12-07
 * for ntes lib
 *
 * @example $.ready(function(){$.ui.pngFix();});
 * @desc Fixes all PNG's in the document on document.ready
 *
 * NTES(function(){NTES(document).pngFix();});
 * @desc Fixes all PNG's in the document on document.ready when using noConflict
 *
 * @example $.ready(function(){$.ui.pngFix('#examples');});
 * @desc Fixes all PNG's within div with class examples
 *
 */

$.ui.pngFix = function(elem) {

	//var ie55 = (navigator.appName == "Microsoft Internet Explorer" && parseInt(navigator.appVersion) == 4 && navigator.appVersion.indexOf("MSIE 5.5") != -1);
	//var ie6 = (navigator.appName == "Microsoft Internet Explorer" && parseInt(navigator.appVersion) == 4 && navigator.appVersion.indexOf("MSIE 6.0") != -1);
	// IE 6
	if (document.uniqueID && !window.XMLHttpRequest) {
		if(elem !== undefined){
			if(elem.tagName == 'IMG'){
				fixImg(elem);
				return;
			}
			if(elem.tagName == 'INPUT'){
				fixInput(elem);
				return;
			}
			fixBg([elem]);
		}else{
			elem = document;
		}
		var reg1 = new RegExp().compile('url[\(][\'\"]?'),
			reg2 = new RegExp().compile('[\'\"]?[\)]');
		
		// fix img
		function fixImg(elem){
			var imgs = elem.getElementsByTagName('img'),
				len = imgs.length,
				img,
				spanP,
				span,
				spanStyle,
				width,
				height;
			//console.log(len)
			while(len--){
				img = imgs[len];
				width = img.width || img.currentStyle.width;
				height = img.height || img.currentStyle.height;
					//console.log(1);
				if(img.src.indexOf('.png') !== -1){
					// parent node
					spanP = document.createElement('span');
					spanStyle = spanP.style;
					spanStyle.position = 'relative';
					spanStyle.display = 'inline';
					spanStyle['float'] = img.currentStyle['float']||'none'; // float can not compress
					spanStyle.border = img.currentStyle.border||'none';
					spanStyle.padding = img.currentStyle.padding||'0';
					spanStyle.margin = img.currentStyle.margin||'0';
					spanStyle.cursor = img.parentNode.currentStyle.cursor;
					// chidren node
					span = document.createElement('span');
					spanP.appendChild(span);
					spanStyle = span.style;
					spanStyle.cssText = 'position:relative;white-space:pre-line;display:inline;background:none;filter:progid:DXImageTransform.Microsoft.AlphaImageLoader(src=\'' + img.src + '\', sizingMethod=\'crop\');';
					spanStyle.width = width;
					spanStyle.height = height;
					span.id = img.id;
					span.className = img.className;
					span.title = img.title;
					span.alt = img.alt;
					
					// do change
					img.parentNode.replaceChild(spanP, img);
				}
			}
		}
		
		// fix css background pngs
		function fixBg(elems){
			var len = elems.length, elem, bg;
			while(len--){
				elem = elems[len];
				bg = elem.currentStyle.backgroundImage;//console.log(bg);
				if(bg.indexOf('.png') != -1){
					elem.style.backgroundImage = 'none';
					// url('......') | url("...") | url(...)
					elem.runtimeStyle.filter = "progid:DXImageTransform.Microsoft.AlphaImageLoader(src='" + bg.replace(reg1, '').replace(reg2, '') + "',sizingMethod='crop')";
				}
			}
		}
		
		//fix input with png-source
		function fixInput(elem){
			var inputs = elem.getElementsByTagName('input'), len = inputs.length, input, src;
			while(len--){
				input = inputs[len];
				src = input.src;
				if(src&&src.indexOf('.png')!=-1){
					input.runtimeStyle.filter = 'progid:DXImageTransform.Microsoft.AlphaImageLoader' + '(src=\'' + src + '\', sizingMethod=\'crop\');';
					input.src = 'blank.gif';
				}
			}
		}
		
		fixBg(elem.all);
		fixImg(elem);
		fixInput(elem);
		
	}

};
