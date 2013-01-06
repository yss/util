/**
 *	Extend from NTES Lib
 * @Author yansong
 * @Date: 2012-01-10
 * @DESC:
 */
(function($){
	var doc = document;
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
			if(typeof t2 == 'object'){
				typeof t1 == 'object' ? mix(t1, t2, w, pro) : s[a] = t2;
			}
			// 是否覆盖, 原型是否存在a值，或者原型里对应的值为空
			if(w||!s.hasOwnProperty(a)||!t1)s[a] = t2;
		}
	}
	
	// 对链式调用进行扩展
	mix($.element, {
		// 过滤所需的节点
		_nodeFilter: function(sibling, selector){
			var t = this.get(0), tmp = t[sibling], filter = selector&&function(){
				return selector.indexOf('.') !==-1? new RegExp('\\b'+selector.substr(1)+'\\b').test(tmp.className) : tmp.tagName == selector.toUpperCase();
			};
			while(tmp&&(tmp.nodeType!=1||(selector&&!filter()))){
				tmp = tmp[sibling];
			}
			return tmp&&$(tmp);
		},
		
		// 父节点，支持tagname或者classname选择
		parent	:	function(selector){
			return this._nodeFilter('parentNode', selector);
		},
		
		// 上一个节点，支持tagname或者classname选择
		prev	:	function(selector){
			return this._nodeFilter('previousSibling', selector);
		},
		
		// 下一个节点，支持tagname或者classname选择
		next	:	function(selector){
			return this._nodeFilter('nextSibling', selector);
		},
		
		// 所有孩子节点
		child	: function(){
			return $(this.get(0).children);
		},	
		
		// 第一个孩子节点
		first	: function(){
			return $(this.get(0).children[0]);
		},
		
		// 最后一个孩子节点
		last	: function(){
			var child = this.get(0).children;
			return $(child[child.length-1]);
		},
		
		/*
		// 加上mix函数
		mix		: function(o, w){
			$.mix(this, o, w, true);
		},
		*/
		
		// 渐显
		fadeIn	: function(callback){
			//var self = this;
			// for support css transition
			//if(getTransitionName()){
				//self.addCss(($.style.getCurrentStyle(self, 'display')=='none'?'display:block':'visibility:visible')+';opacity:0');
			//}
			$.animate({node:this, css:{opacity:1}, duration: 1, delay: .2}, callback);
		},
		
		// 渐隐
		fadeOut	: function(callback){
			//var self = this;
			$.animate({node:this, css:{opacity:0}, duration: 1, delay: .2}, function(){
				this.addCss({display:'none'});
				callback&&callback.call(this);
			});
			
		},
		
		// 触发原生事件
		fire : function(type){
			$.fire(this, type);
		}
		
	});
	
	$.mix = mix;
	
	/**
	 * 触发元素的原生事件
	 *@param el <HTMLELEMENT|string> 节点元素
	 *@param type <string> 事件类型。如: click, blur, focus ...
	 *@return
	 */
	$.fire = function(el, type){
		el = $(el);
		var i = 0, len = el.length;
		if(undefined == len)f(el);
		else{
			while(i<len){
				f(el[i++]);
			}
		}
		function f(elem){
			var evt;
			if(doc.createEventObject){// IE浏览器支持fireEvent方法
				elem.fireEvent('on'+type);
			}else{// 其他标准浏览器使用dispatchEvent方法
				evt = doc.createEvent('HTMLEvents');
				// initEvent接受3个参数：
				// 事件类型，是否冒泡，是否阻止浏览器的默认行为
				evt.initEvent(type, true, true);
				elem.dispatchEvent(evt);
			}
		}
	}
	
	// 空函数
	$.noop = function(){};
	
	/**
	 * 判定函数 if ... else ...
	 * 使用： #ab可以为：.ab $('#ab') $('.ab')
	 * 1、当存在id=ab的元素时：$.doWhileExist('#ab', fn);
	 * 2、当存在id=ab的元素时执行fn1，不存在时执行fn2：$.doWhileExist('#ab', fn1, fn2)
	 * 3、当不存在id=ab的元素时执行fn：$.doWhileExist('#ab', '', fn)
	 */
	$.doWhileExist = function(selector, fn, fn2){
		var tmp = $(selector), len = tmp.length;
		len==undefined||len>0?fn&&fn(tmp):fn2&&fn2(tmp);
	}
	
	// 增加jsonp的方式调用，使用同importJs
	$.jsonp = $.ajax.jsonp = function(url, onComplete, charset, doc){
		var jsonp = 'jsonp'+Date.now();
		url += (url.indexOf('?')!==-1?'&':'?')+'callback='+jsonp;
		window[jsonp] = onComplete||$.noop;
		$.ajax.importJs(url, '', charset, doc);
	}
	
	/*
	//确定环境是否支持CSS3 Transition特性，并得到对应的TransitionName
	function getTransitionName(){
		var name = 'transition',
			tempStyle = doc.createElement('div').style,
			prefixs = ['O', 'Moz', 'Webkit'],
			l = 3;
		if (tempStyle[name] === undefined) {
			name = null;
			while(l--){
				if(tempStyle[prefixs[l] + 'Transition'] !== undefined){
					name = prefixs[l] + 'Transition';
					break;
				}
			}
		}
		getTransitionName = function(){return name;}
		return name;
	}
	*/
	/**
	 * 缓慢移动效果算法
	 *@param t {number} current time（当前时间）；
	 *@param b {number} beginning value（初始值） 置0，即b=0；
	 *@param c {number} change in value（变化量） 置1，即c=1；
	 *@param d {number} duration（持续时间）	  置1，即d=1。
	 */
	var Easing = { // Quad | Cubic | Quart | Quint |||| Sine | Expo | Circ
		'ease':function (t) {
			return ( -Math.cos(t * Math.PI) / 2 ) + 0.5; // (-Math.cos(pos*Math.PI)/2) + 0.5  (sinusoidal)
		},
		'linear':function (t) {
			return t;	//c*t/d + b;
		},
		'ease-in':function (t) {
			return t * t;	//c*(t/=d)*t + b
		},
		'ease-out':function (t) {
			return ( 2 - t) * t;	//-c *(t/=d)*(t-2) + b
		},
		'ease-in-out':function (t) {
			return (t *= 2) < 1 ?
				.5 * t * t :
				.5 * (1 - (--t) * (t - 2));	//(t/=d/2) < 1? c/2*t*t + b : -c/2 * ((--t)*(t-2) - 1) + b;
		},
		'ease-in-strong':function (t) {
			return t * t * t * t;	//c*(t/=d)*t*t*t + b  (quartEaseIn)
		},
		'ease-out-strong':function (t) {
			return 1 - (--t) * t * t * t;	//-c * ((t=t/d-1)*t*t*t - 1) + b
		},
		'ease-in-out-strong':function (t) {
			return (t *= 2) < 1 ?
				.5 * t * t * t * t :
				.5 * (2 - (t -= 2) * t * t * t);	//(t/=d/2) < 1) ? c/2*t*t*t*t + b : -c/2 * ((t-=2)*t*t*t - 2) + b
		}
		/*
		// for browser support transition
		'nativeExtend':{
			'ease-in':'ease-in',
			'ease-out':'ease-out',
			'linear':'linear',
			'ease-in-out':'ease-in-out',
			'ease':'ease',
			'ease-in-strong': 'cubic-bezier(0.9, 0.0, 0.9, 0.5)',
			'ease-out-strong': 'cubic-bezier(0.1, 0.5, 0.1, 1.0)',
			'ease-in-out-strong': 'cubic-bezier(0.9, 0.0, 0.1, 1.0)'
		}
		*/
	};
		
	/**
	 *	动画呈现
	 */
	function Transition(node, config, pointer){
		var t = this,
			nodeStyle = node.style,
			css = config.css,
			easing = config.easing,
			easingFn = 'string' === typeof easing?Easing[easing]:easing,
			duration = config.duration,
			delay = config.delay,
			callback = config.callback;
			//transitionName = getTransitionName();
		/*	too manay errors
		// for support transition browser and easing is string
		if(transitionName&&easeLen){
			css.hasOwnProperty('opacity')&&t._setOpacity(node);
			nodeStyle[transitionName] = 'all '+duration+'s '+easing+' '+delay+'s';
			//In Firefox, the event is transitionend, in Opera, oTransitionEnd, and in WebKit it is webkitTransitionEnd.
			var eventName = ~transitionName.indexOf('Moz')?'transitionend':(transitionName.replace(/(O|Webkit)/, function($0, $1){return $1.toLowerCase()}) + 'End');
			node.addEvent(eventName, function(){
				node.removeEvent(eventName, arguments.callee);
				nodeStyle[transitionName] = '';
				if(pointer){
					callback.call(pointer);
					// 由于每个属性都会执行一遍，防止多次执行
					callback = $.noop;
				}
			});
			// for some property cannot come into effect quickly
			setTimeout(function(){for(var p in css)nodeStyle[p]=css[p];}, 10);
		}else{ */
			var start, dur = duration * 1000, finish, isOpacity = undefined != nodeStyle.opacity; // 动画时间: 开始值、期间值、结束值
			css = t._format(css, node);
			function getChangeValue(oVal, cVal, pos, fix){
				return Number(oVal + cVal * easingFn(pos)).toFixed(fix);// 计算后的值：初始值+变动值
			}
			setTimeout(function(){
				start = +new Date; // 开始时间
				finish = start + dur; // 结束时间
				var timer = setInterval(function(){
					var time = +new Date, isFinish = finish<time, pos = isFinish?1:(time-start)/dur, p, val, t1, t2;
					for(p in css){
						val = css[p];
						t1 = val[0];
						t2 = val[1];
						if(p.indexOf('olor')!=-1){ // 颜色特殊处理 color or backgroundColor
							nodeStyle[p] = 'rgb('+getChangeValue(t1[0], t2[0], pos, 0)+','+getChangeValue(t1[1], t2[1], pos, 0)+','+getChangeValue(t1[2], t2[2], pos, 0)+')';
						}else if(p=='backgroundPosition'){
							nodeStyle[p] = getChangeValue(t1[0], t2[0], pos)+'px '+getChangeValue(t1[1], t2[1], pos)+'px';
						}else{
							val = getChangeValue(t1, t2, pos, 2);
							if(p=='opacity'){ // opacity特殊属性处理
								if(isOpacity) nodeStyle.opacity = val;
								else nodeStyle.filter = 'Alpha(opacity='+val+')';
							}else{
								nodeStyle[p] = val + 'px';
							}
						}
					}
					// 动画结束 当时时间>结束时间
					if(isFinish){
						clearInterval(timer);
						pointer&&callback.call(pointer);
					}
				}, 15);
			}, delay*1000);
		/* } */
	}
	
	Transition.prototype = {
		/**
		 * 将一串属性筛选出数字值类型，并把不能格式化的数据加载到node.style里
		 *@param props <object> css 属性
		 *@param node <HTMLELEMENT> 节点元素
		 */
		_format: function(props, node){
			var t = this,
				origin = {}, // 计算后的值
				nodeStyle = node.style,
				isHidden = t._setOpacity(node),
				getStyle = $.style.getCurrentStyle,
				tmp, p, val;  // 临时值;
			
			function computeBox(p, val){
				var tmp;
				tmp = getStyle(node, p);
				tmp = tmp == 'auto'? 0:parseInt(tmp);
				origin[p] = [tmp, parseInt(val)-tmp];
				if(nodeStyle.zoom == ''){
					nodeStyle.zoom = 1;
					node.parentNode.style.zoom = 1;
				}
			}
			function computeColor(p, val){
				var tmp;
				tmp = t._formatColor(val.trim());
				val = t._formatColor(getStyle(node, p));
				tmp[0] -= val[0];
				tmp[1] -= val[1];
				tmp[2] -= val[2];
				origin[p] = [val, tmp];
			}
			for(p in props){
				val = props[p];
				switch(true){
					case p=='width'||p=='height':
						tmp = isHidden?0:node[p=='width'?'offsetWidth':'offsetHeight'];
						origin[p] = [tmp, parseInt(props[p])-tmp];
						break;
					
					case p=='opacity':
						if(undefined != nodeStyle.opacity){
							tmp = getStyle(node, p)||1;
							origin[p] = [tmp, val-tmp];
						}else{
							tmp = /opacity=(\d+)/.test(getStyle(node, 'filter'))?parseInt(RegExp.$1):(isHidden?0:100);
							origin[p] = [tmp, val*100-tmp];
							nodeStyle.zoom=1;
						}
						break;
						
					// top, left, right, bottom, marginTop ... marginLeft, paddingTop ... paddingleft
					case /(?:top|right|bottom|left)/i.test(p): 
						computeBox(p, val);
						break;
					
					// 格式化 margin padding 不做计算
					case p=='margin'||p=='padding':
						tmp = val.trim().split(' ');
						var len = tmp.length, tmpArr = ['Top', 'Right', 'Bottom', 'Left'];
						if(len==1){
							tmp.push(tmp[0]);
							tmp.push(tmp[0]);
							tmp.push(tmp[0]);
						}else if(len==2){
							tmp.push(tmp[0]);
							tmp.push(tmp[1])
						}else if(len==3){
							tmp.push(tmp[1]);
						}// else if(len==4){}
						len=4;
						while(len--){
							//props[p+tmpArr[len]] = tmp[len];
							computeBox(p+tmpArr[len], tmp[len]);
						}
						break;
						
					case p.indexOf('olor') != -1: // backgroundColor, color
						computeColor(p, val);
						break;
						
					case p.indexOf('background') != -1: // background, backgroundPosition
						tmp = RegExp;
						var bg = 'backgroundPosition';
						// 之所以不整合在一起时考虑到background的属性写法不一致
						// backgroundPosition
						if(/(?: |)-?(\d+)(?:|px) -?(\d+)(?:|px)(?: |$)/.test(val)){
							var t1 = parseInt(tmp.$1)||0, t2 = parseInt(tmp.$2), tt = getStyle(node, bg).replace(/px/g,'').split(' ');
							origin[bg] = [[t1, t2], [t1-(parseInt(tt[0])||0), t2-(parseInt(tt[1])||0)]];
							if(p==bg)break;
						}
						// backgroundColor
						/(#\w+|rgb.*\))/.test(val)&&computeColor('backgroundColor', tmp.$1);
						// backgroundImage
						/\burl\((?:\"|\'|)(.+)(?:\"|\'|)\)\b/.test(val)&&(nodeStyle.backgroundImage = tmp.$1);
						// backgroundRepeat
						/((?:no-|)repeat(?:-x|-y|))/.test(val)&&(nodeStyle.backgroundRepeat = tmp.$1);
						// backgroundAttachment
						/(scroll|fixed)/.test(val)&&(nodeStyle.backgroundAttachment = tmp.$1);
						
						break;
					
					default:
						nodeStyle[p] = val;
				}
				
			}
			return origin;
		},
		
		// 格式化颜色
		_formatColor: function(color){
			var tmp, getColorValue = this._getColorValue;
			if(color.indexOf('#')!=-1){ // #aaa or #121212
				color = color.substr(1).split('');
				if(color.length==3)return [getColorValue(color[0]), getColorValue(color[1]), getColorValue(color[2])];
				return [getColorValue(color[0], color[1]), getColorValue(color[2], color[3]), getColorValue(color[4], color[5])];
			}else if(/\((.+)\)/.test(color)){ // rgb(222,222,222) rgba(222,222,222,.4)
				tmp = RegExp.$1.split(',');
				return [tmp[0].trim()*1, tmp[1].trim()*1, tmp[2].trim()*1];
			}else{ // default
				return [255,255,255];
			}
		},
		
		// 获取颜色值
		_getColorValue: function(a, b){
			var colorList = {a:10,b:11,c:12,d:13,e:14,f:15};
			// 当只有a时，代表a和b值一致	// #aaa			 // #121212
			return undefined == b? (colorList[a]||a)*17 : (colorList[a]||a)*16+(colorList[b]||b)*1;
		},
		
		// 设置元素的opacity属性
		_setOpacity: function(node){
			var nodeStyle = node.style,
				getStyle = $.style.getCurrentStyle,
				isHidden = getStyle(node, 'display')=='none'?1:(getStyle(node, 'visibility')=='hidden'?2:0);
			
			if(isHidden){
				undefined != nodeStyle.opacity?(nodeStyle.opacity = 0):(nodeStyle.filter = 'Alpha(opacity=0)');
				isHidden==1?(nodeStyle.display = 'block'):(nodeStyle.visibility='visible');
			}
			
			return isHidden;
		}
	}
	/**
	 * 增加动画 node, css, duration, easing, delay, callback
	 * @param: o <object>
	 * 		@attr: node <id> 节点 必须的
	 *		@attr: css <object> 属性值 必须的
	 *		@attr: duration <float> 运行时间 默认：0.5s
	 *		@attr: easing <string|function> 使用的动画效果，内置：'ease','ease-in','ease-out','ease-in-out','linear' 默认：'ease' 扩展：function(pos){...}
	 *		@attr: delay <float> 延迟运行时间 默认：0
	 *		//@attr: callback <function>
	 * @param: callback <function> 回调函数
	 */
	$.animate = function(o, callback){
		var node = $(o.node),
			len = node.length,
			defaultConfig = {
				duration: .5,
				easing: 'ease',
				delay: 0,
				callback: callback||$.noop
			};
			
		if(!o.css) return;
		/*
		o.duration = o.duration||.5;
		o.easing = o.easing||'ease';
		o.delay = o.delay||0;
		o.callback = callback||$.noop;
		*/
		$.mix(o, defaultConfig);
		
		if(undefined != len)while(--len)new Transition($(node[len]), o);
		// node[0]||node
		new Transition(node.$(0), o, node);
	}
	
	// 本地存储
	$.localStorage = function(){
		// 非IE浏览器使用localStorage、IE浏览器使用userData
		return window.localStorage || {
			_getData : function(){
				var userData = doc.createElement('input'), expires;
				userData.type = 'hidden';
				userData.style.display = 'none';
				userData.addBehavior('#default#userData');
				doc.body.appendChild(userData);
				// 设置过期时间
				expires = new Date();
				expires.setDate(expires.getDate()+365);
				userData.expires = expires.toUTCString();
				this._getData = function(){return userData;}
				return userData;
			},
			
			name : 'userData',
			
			setItem : function(key, value){
				var t = this, userData = t._getData();
				userData.load(t.name);
				userData.setAttribute(key, value);
				userData.save(t.name);
			},
			getItem : function(key){
				var userData = this._getData();
				userData.load(this.name);
				return userData.getAttribute(key);
			},
			removeItem : function(key){
				var t = this, userData = t._getData();
				userData.load(t.name);
				userData.removeAttribute(key);
				userData.save(t.name);
			}
		}
	}();
	
	/*
	 * 滚动卡盘，需要特定的css支持
	 *@param o <object>
	 *		@attr panel <selector> 内容栏
	 *		@attr addPanelEvent <string> 鼠标移动上去，卡盘停止 default: true
	 *		@attr tab <selector> 切换栏，可空
	 *		@attr tabEvent <string> 鼠标切换事件 default: mouseover 当为'none'是不设置事件
	 *		@attr cls <string> 用于切换的class
	 *		@attr direction <string> 轮播方向（上或左）top|left default: top
	 *		@attr easing <string> 动画函数 default: ease
	 *		@attr duration <number> 动画所用时间 default: 0.5(s)
	 *		@attr length <number> 每次轮播滚动子元素长度 default: 1
	 *		@attr interval <number> 轮播间隔时间 default: 3
	 *		@attr autoplay <boolean> 是否自动循环 default: true
	 *		@attr startPos <number> 开始位置 default: 0
	 *@param callback
	 *@return 
	 */
	function Slide(o, callback){
		return this instanceof Slide?
			this.init(o, callback):
			new Slide(o, callback);
	}
	var tt = 0;
	Slide.prototype = {
		init: function(o, callback){
			var t = this,
				panel = $(o.panel).$(0),
				panels = panel.child(),
				tab = o.tab&&$(o.tab).$(0),
				tabs = tab&&tab.child(),
				//tLen = tabs&&tabs.length,
				length = o.length||1, // 每次滚动的个数
				TOP = 'top',
				direction = o.direction||TOP,
				offsetValue = direction==TOP?'offsetHeight':'offsetWidth',
				props = {node:panel, easing: o.easing, duration: o.duration, css:{}};
			
			// 设置每次滚动的距离
			props.css[direction]=parseInt($.style.getCurrentStyle(panel, direction))||0;
			
			//t.show = 0;
			t.panel = panel;
			t.interval = (o.interval||3)*1000; // 一次轮播的时间
			t.account = o.startPos||0; // 当前的次数
			t.times = Math.ceil(panels.length/length)-1; // 一次轮播的次数
			t.props = props;
			t.direction = direction;
			t.size = panels[0][offsetValue]*length;
			t.cls = o.cls;
			t.tabs = tabs;
			t.autoplay = o.autoplay||true,
			t.callback = callback||$.noop;
			
			t._panelControll(panel, length, offsetValue, o.addPanelEvent||true);
			
			if(tabs){
				t._addTabEvent(tabs, o.tabEvent);
			}
			// run
			t.start();
			return t;
		},
		
		// 面板处理
		_panelControll: function(panel, len, offsetValue, setEvent){
			var panels = panel.child(), i = 0, tmp, t = this;
			if(len==1)panel.appendChild(panels[0].cloneNode(true));
			else{
				// 并排情况处理
				tmp = panel.parentNode[offsetValue];
				tmp<t.size&&(t.size=tmp);
				// 复制child，让卡盘一直往一个方向走
				while(i<len){
					panel.appendChild(panels[i++].cloneNode(true));
				}
			}
			t.props.css[t.direction] = panel.style[t.direction] = -t.account*t.size+'px';
		
			// set panels and tabs mouserover and mouseout event
			setEvent&&panel.addEvent('mouseover', function(){t.stop()}).addEvent('mouseout', function(){t.start()});
		},
		
		// 
		_addTabEvent: function(tabs, event){
			var t = this, NStyle = $.style, cls = t.cls;
			tabs.each(function(i, node){
				$(node).addEvent(event||'mouseover', function(){
					t.stop();
					if(t.account != i){
						NStyle.removeCss(tabs[t.account], cls);
						NStyle.addCss(tabs[i], cls)
						t.account = i;
						t.props.css[t.direction] = -t.size*i + 'px';
						$.animate(t.props);
					};
				}).addEvent('mouseout', function(){t.start()});
			});
			NStyle.hasClass(tabs[t.account], cls)||NStyle.addCss(tabs[t.account], cls);
		},
		
		start: function(){
			var t = this;
			t.show = setTimeout(function(){t._run()}, t.interval);
		},
		
		stop: function(){
			clearTimeout(this.show);
		},
		
		_run: function(){
			var t = this,
				isEnd = t.times =< t.account,
				cls = t.cls,
				direction = t.direction,
				tabs = t.tabs;
			if(isEnd){ //一次轮回结束 
				if(!t.autoplay){
					clearInterval(t.timer);
					return;
				}
				t.callback.call(t.panel);
			}
			
			t.props.css[direction] = parseInt(t.props.css[direction]) - t.size + 'px';
			
			// 动画效果
			$.animate(t.props, function(){
				// 当为最后一个时
				if(t.account==0){
					t.props.css[direction] = 0;
					this.style[direction]=0; // t.panel.style[direction]=0; 
				}
				t.start();
			});
			// 存在tab及class的情况
			if(tabs&&cls){
				$.style.removeCss(tabs[t.account++], cls);
				if(t.times<t.account)t.account=0;
				$.style.addCss(tabs[t.account], cls);
			}else{
				if(isEnd)t.account=0;else t.account++;
			}
		}
	}
	$.slide = Slide;
})(NTES);

