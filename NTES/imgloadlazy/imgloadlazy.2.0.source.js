/**
 * img图片数据延迟加载组件 2.0
 * @Author yansong@corp.netease.com
 * @Date： 2011-11-11
 * @For: if needs
 * @Desc:
 * 	对应的结构：<img data-src="真实地址" ... />
 * 	imgs只支持原生的数组、NTES的数组对象、JQuery的对象数组。如：document.getElementsByTagName('img')
 * 	对1.0版进行了改进。
 * 1. 删除自动模式，因为缺陷很多，目前没有任何网站使用这种方式，所以不需要这个功能以此减轻代码量；
 * 2. 优化js代码。
 * @examples:
 * 	1.有针对性的：
 * 		YS.imgLoadLazy({imgs: document.getElementById('js_Imgs').getElementsByTagName('img'))
 * 	2.通用性的(会自动过滤网页所有包含dataSrc(data-src)属性img):
 * 		YS.imgLoadLazy();
 * 	3.适用性：
 * 		YS.imgLoadLazy({imgs: jQuery('#js_Imgs img')}); // support jQuery lib
 * 		YS.imgLoadLazy({imgs: NTES('#js_Imgs img')}); // support ntes lib
 * 
 * 	<!- 建议加上placehold属性 -!> 如：
 * 		YS.imgLoadLazy({
 *			placehold: 'http://img1.cache.netease.com/sports/img11/dayun0720/space.png'
 *		});
 * 4.追加数据情况：
 *      var loadLazy = imgLoadLazy({imgs: jQuery('#js_Imgs img')})
 *      loadLazy.addImgs(jQuery('img.filter'));
 * @Updates:
 *  1. 增加addImgs函数，方便后期追加数据；
 * 	2. 增加_throttle函数，避免重复触发；
 */

/*
window.onload = function(){
	
}

function log(a){
	if(window.console)window.console.log(a);	
	//window.console?window.console.log(a):alert(a);	
}
*/
(function(win){
    var toString = Object.prototype.toString,
        isObject = function(val) {
            toString.call(val) === '[object object]'
        };
    win.YS = win.YS || {};
	/**
	 * 对象复制和替换 MIN version 如果对应的s里的值为0, null, undefined也会覆盖
	 * @param s {object} 需要加载的对象
	 * @param o {object} 加载到s上的对象
	 * @param w {boolean} 是否覆盖原有的方法 默认：false
	 //* @param pro {boolean} 是否为原型链加载 默认：false
	 * @return
	 */
	function mix(s, o, w, pro){
		var t1, t2, a;
		if(s === undefined || o === undefined)return {};
		w = w || 0;
		for(a in o){
			t1 = s[a];
			t2 = o[a];
            if(typeof t2 === 'object'){
				typeof t1 === 'object' ? mix(t1, t2, w, pro) : s[a] = t2;
			}
			// 是否覆盖, 原型是否存在a值，或者原型里对应的值为空
			if(w||!s.hasOwnProperty(a)||!t1)s[a] = t2;
		}
	}	
	/**
	 * 图片延迟加载组件
	 *@param config {object}
		*@attr placehold {url} 用于替换图片src
		//(已去掉) *@attr manual {boolean} default: true 手动模式，默认是手动模式，即填充imgs
		*@attr dataSrc {string} default: data-src 存放真实的图片地址
		*@attr tops {array} <private>所有需要加载的图片相对于body的最上方高度
		*@attr imgs {array} <protect>所有需要加载的图片 eg: jQuery('img'), NTES('img'),document.getElementsByTagName('img')
		*@attr screenValue {number} default: 1.5 相对于屏幕高度的倍数
		*@attr screenH {number} <private>default: 1.5倍的屏幕高度 图片距离浏览器屏幕上方高度的临界值，小于这个高度就加载。
	 *@undo:
	 *	不适合情况：有js大变动的改变body高度。
	 *@Description:
	 *	
	 *@return: null
	 */
	function imgLoadLater(o){
		var self = this;
		if(!(self instanceof imgLoadLater)){
			return new imgLoadLater(o);
		}
		config = self._config;
		//config.screenH = self._getScreen();
		/*
		if(o !== undefined && !o.screenH){
			//config = {};
			config.isHold = true;
		}
		*/
		// 强制合并config属性
		mix(config, o, true);
		
		config.screenH = self._getScreen();
		
		self._config = config;
		
		//log(self._config)
		// 初始化函数
		self._init();
        return this;
	}
	mix(imgLoadLater.prototype , {
		_config: {//配置文件
			//placehold: null,
			//manual: true, //手动模式，默认为true 即用户自己填充imgs
			dataSrc: 'data-src',
			//tops: [],//存放每个元素相对于document的高度值
			//imgs: [],//存放每个img元素
			screenValue: 1.5 //距离浏览器当前屏幕的高度所需的距离
		},
		_getTop: function(elem){
			// 返回元素相对于当前浏览器屏幕顶部的高度
			return elem.getBoundingClientRect().top;
		},
		_imgLoad: function(){
			var self = this,
				config = self._config,
				imgs = config.imgs || [],
				tops = config.tops || [],
				dataSrc = config.dataSrc,
				l = imgs.length,
				winH = config.screenH + self._getScrollTop(),
				arrImgs=[],
				arrTops=[],
				attr, top, img;
			if(l < 1) return;
			while(l--){
				top = tops[l];
				img = imgs[l];
				// 小于对应的winH值则加载
				if(tops[l] <= winH){
					attr = img.getAttribute(dataSrc);
					attr&&(img.src = attr);
				}else{
					arrImgs.push(img);
					arrTops.push(top);
				}
			}
			//log(arrTops);
			self._config.imgs = arrImgs;
			self._config.tops = arrTops;
		},
		_getScreen: function(){
			// 距离浏览器框的高度
			return document.documentElement.clientHeight * this._config.screenValue;
		},
		_getScrollTop: function(){
			// 获取scrollTop
	　　　　return Math.max(document.body.scrollTop, document.documentElement.scrollTop);
		},
		addImgs: function(newImgs){
			var self = this,
				config = self._config,
				tops = config.tops || [],
				imgs = newImgs || config.imgs || [],
				dataSrc = config.dataSrc,
				placehold = config.placehold,
				scrollTop = self._getScrollTop(),
				winH = config.screenH + scrollTop,
				arrImgs = imgs.length ? imgs : document.getElementsByTagName('img'),
				//isManual = config.manual,
				len = arrImgs.length,
				tmp;
				
            imgs = newImgs ? config.imgs : [];
			// 插入需要加载的imgs和tops
			while(len--){
				tmp = arrImgs[len];
				if(tmp.getAttribute(dataSrc)){
					// top = img相对浏览器屏幕的高度 + 滚动条高scroll top
					tops.push(self._getTop(tmp) + scrollTop);
					imgs.push(tmp);
                    placehold&&(tmp.src = placehold);
				}
			}
            if (!newImgs) {
                config.imgs = imgs;
                config.tops = tops;
            } else {
                self._imgLoad();
            }
		},
		_addEvent: function(elem, type, fn, b){
			if(elem.addEventListener){
				elem.addEventListener(type, fn, b || false);
			}else if(elem.attachEvent){
				elem.attachEvent('on'+type, fn);
			}else{
				elem['on'+type] = fn;
			}
		},
        // 避免多次触发 节流器？
        _throttle: function(handler, time) {
            var timer = null;
            time = time || 10;

            return function() {
                if (timer) return;
                timer = window.setTimeout(function() {
                    handler();
                    timer = null;
                }, time);
            }
        },
        // 追加img

		// 初始化函数
		_init: function(){
			var self = this;
			//self._mix(config, o);
			// 初始化需要加载的Imgs
			self.addImgs();
			// 对应的scroll和resize事件加载
			self._addEvent(win, 'scroll', self._throttle(function() {
                // 加载img
                self._imgLoad();
            }));
			self._addEvent(win, 'resize', self._throttle(function() {
				// 重新获取screenH
				self._config.screenH = self._getScreen();
				self._imgLoad();
            }));
		    
			// 第一次加载：
            self._imgLoad();
		}
	});

	YS._mix = mix;
	YS.imgLoadLazy = imgLoadLater;
})(window);
