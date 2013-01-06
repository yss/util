/**
 *	Extend from NTES Lib
 * @Author yansong
 * @Date: 2012-01-10
 * @DESC:
 */
(function($){
	var doc = document;
	/**
	 * �����ƺ��滻 MIN version �����Ӧ��s���ֵΪ0, null, undefinedҲ�Ḳ��
	 * @param s {object} ��Ҫ���صĶ���
	 * @param o {object} ���ص�s�ϵĶ���
	 * @param w {boolean} �Ƿ񸲸�ԭ�еķ��� Ĭ�ϣ�false
	 //* @param pro {boolean} �Ƿ�Ϊԭ�������� Ĭ�ϣ�false
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
			// �Ƿ񸲸�, ԭ���Ƿ����aֵ������ԭ�����Ӧ��ֵΪ��
			if(w||!s.hasOwnProperty(a)||!t1)s[a] = t2;
		}
	}
	
	// ����ʽ���ý�����չ
	mix($.element, {
		// ��������Ľڵ�
		_nodeFilter: function(sibling, selector){
			var t = this.get(0), tmp = t[sibling], filter = selector&&function(){
				return selector.indexOf('.') !==-1? new RegExp('\\b'+selector.substr(1)+'\\b').test(tmp.className) : tmp.tagName == selector.toUpperCase();
			};
			while(tmp&&(tmp.nodeType!=1||(selector&&!filter()))){
				tmp = tmp[sibling];
			}
			return tmp&&$(tmp);
		},
		
		// ���ڵ㣬֧��tagname����classnameѡ��
		parent	:	function(selector){
			return this._nodeFilter('parentNode', selector);
		},
		
		// ��һ���ڵ㣬֧��tagname����classnameѡ��
		prev	:	function(selector){
			return this._nodeFilter('previousSibling', selector);
		},
		
		// ��һ���ڵ㣬֧��tagname����classnameѡ��
		next	:	function(selector){
			return this._nodeFilter('nextSibling', selector);
		},
		
		// ���к��ӽڵ�
		child	: function(){
			return $(this.get(0).children);
		},	
		
		// ��һ�����ӽڵ�
		first	: function(){
			return $(this.get(0).children[0]);
		},
		
		// ���һ�����ӽڵ�
		last	: function(){
			var child = this.get(0).children;
			return $(child[child.length-1]);
		},
		
		/*
		// ����mix����
		mix		: function(o, w){
			$.mix(this, o, w, true);
		},
		*/
		
		// ����
		fadeIn	: function(callback){
			//var self = this;
			// for support css transition
			//if(getTransitionName()){
				//self.addCss(($.style.getCurrentStyle(self, 'display')=='none'?'display:block':'visibility:visible')+';opacity:0');
			//}
			$.animate({node:this, css:{opacity:1}, duration: 1, delay: .2}, callback);
		},
		
		// ����
		fadeOut	: function(callback){
			//var self = this;
			$.animate({node:this, css:{opacity:0}, duration: 1, delay: .2}, function(){
				this.addCss({display:'none'});
				callback&&callback.call(this);
			});
			
		},
		
		// ����ԭ���¼�
		fire : function(type){
			$.fire(this, type);
		}
		
	});
	
	$.mix = mix;
	
	/**
	 * ����Ԫ�ص�ԭ���¼�
	 *@param el <HTMLELEMENT|string> �ڵ�Ԫ��
	 *@param type <string> �¼����͡���: click, blur, focus ...
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
			if(doc.createEventObject){// IE�����֧��fireEvent����
				elem.fireEvent('on'+type);
			}else{// ������׼�����ʹ��dispatchEvent����
				evt = doc.createEvent('HTMLEvents');
				// initEvent����3��������
				// �¼����ͣ��Ƿ�ð�ݣ��Ƿ���ֹ�������Ĭ����Ϊ
				evt.initEvent(type, true, true);
				elem.dispatchEvent(evt);
			}
		}
	}
	
	// �պ���
	$.noop = function(){};
	
	/**
	 * �ж����� if ... else ...
	 * ʹ�ã� #ab����Ϊ��.ab $('#ab') $('.ab')
	 * 1��������id=ab��Ԫ��ʱ��$.doWhileExist('#ab', fn);
	 * 2��������id=ab��Ԫ��ʱִ��fn1��������ʱִ��fn2��$.doWhileExist('#ab', fn1, fn2)
	 * 3����������id=ab��Ԫ��ʱִ��fn��$.doWhileExist('#ab', '', fn)
	 */
	$.doWhileExist = function(selector, fn, fn2){
		var tmp = $(selector), len = tmp.length;
		len==undefined||len>0?fn&&fn(tmp):fn2&&fn2(tmp);
	}
	
	// ����jsonp�ķ�ʽ���ã�ʹ��ͬimportJs
	$.jsonp = $.ajax.jsonp = function(url, onComplete, charset, doc){
		var jsonp = 'jsonp'+Date.now();
		url += (url.indexOf('?')!==-1?'&':'?')+'callback='+jsonp;
		window[jsonp] = onComplete||$.noop;
		$.ajax.importJs(url, '', charset, doc);
	}
	
	/*
	//ȷ�������Ƿ�֧��CSS3 Transition���ԣ����õ���Ӧ��TransitionName
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
	 * �����ƶ�Ч���㷨
	 *@param t {number} current time����ǰʱ�䣩��
	 *@param b {number} beginning value����ʼֵ�� ��0����b=0��
	 *@param c {number} change in value���仯���� ��1����c=1��
	 *@param d {number} duration������ʱ�䣩	  ��1����d=1��
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
	 *	��������
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
					// ����ÿ�����Զ���ִ��һ�飬��ֹ���ִ��
					callback = $.noop;
				}
			});
			// for some property cannot come into effect quickly
			setTimeout(function(){for(var p in css)nodeStyle[p]=css[p];}, 10);
		}else{ */
			var start, dur = duration * 1000, finish, isOpacity = undefined != nodeStyle.opacity; // ����ʱ��: ��ʼֵ���ڼ�ֵ������ֵ
			css = t._format(css, node);
			function getChangeValue(oVal, cVal, pos, fix){
				return Number(oVal + cVal * easingFn(pos)).toFixed(fix);// ������ֵ����ʼֵ+�䶯ֵ
			}
			setTimeout(function(){
				start = +new Date; // ��ʼʱ��
				finish = start + dur; // ����ʱ��
				var timer = setInterval(function(){
					var time = +new Date, isFinish = finish<time, pos = isFinish?1:(time-start)/dur, p, val, t1, t2;
					for(p in css){
						val = css[p];
						t1 = val[0];
						t2 = val[1];
						if(p.indexOf('olor')!=-1){ // ��ɫ���⴦�� color or backgroundColor
							nodeStyle[p] = 'rgb('+getChangeValue(t1[0], t2[0], pos, 0)+','+getChangeValue(t1[1], t2[1], pos, 0)+','+getChangeValue(t1[2], t2[2], pos, 0)+')';
						}else if(p=='backgroundPosition'){
							nodeStyle[p] = getChangeValue(t1[0], t2[0], pos)+'px '+getChangeValue(t1[1], t2[1], pos)+'px';
						}else{
							val = getChangeValue(t1, t2, pos, 2);
							if(p=='opacity'){ // opacity�������Դ���
								if(isOpacity) nodeStyle.opacity = val;
								else nodeStyle.filter = 'Alpha(opacity='+val+')';
							}else{
								nodeStyle[p] = val + 'px';
							}
						}
					}
					// �������� ��ʱʱ��>����ʱ��
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
		 * ��һ������ɸѡ������ֵ���ͣ����Ѳ��ܸ�ʽ�������ݼ��ص�node.style��
		 *@param props <object> css ����
		 *@param node <HTMLELEMENT> �ڵ�Ԫ��
		 */
		_format: function(props, node){
			var t = this,
				origin = {}, // ������ֵ
				nodeStyle = node.style,
				isHidden = t._setOpacity(node),
				getStyle = $.style.getCurrentStyle,
				tmp, p, val;  // ��ʱֵ;
			
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
					
					// ��ʽ�� margin padding ��������
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
						// ֮���Բ�������һ��ʱ���ǵ�background������д����һ��
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
		
		// ��ʽ����ɫ
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
		
		// ��ȡ��ɫֵ
		_getColorValue: function(a, b){
			var colorList = {a:10,b:11,c:12,d:13,e:14,f:15};
			// ��ֻ��aʱ������a��bֵһ��	// #aaa			 // #121212
			return undefined == b? (colorList[a]||a)*17 : (colorList[a]||a)*16+(colorList[b]||b)*1;
		},
		
		// ����Ԫ�ص�opacity����
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
	 * ���Ӷ��� node, css, duration, easing, delay, callback
	 * @param: o <object>
	 * 		@attr: node <id> �ڵ� �����
	 *		@attr: css <object> ����ֵ �����
	 *		@attr: duration <float> ����ʱ�� Ĭ�ϣ�0.5s
	 *		@attr: easing <string|function> ʹ�õĶ���Ч�������ã�'ease','ease-in','ease-out','ease-in-out','linear' Ĭ�ϣ�'ease' ��չ��function(pos){...}
	 *		@attr: delay <float> �ӳ�����ʱ�� Ĭ�ϣ�0
	 *		//@attr: callback <function>
	 * @param: callback <function> �ص�����
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
	
	// ���ش洢
	$.localStorage = function(){
		// ��IE�����ʹ��localStorage��IE�����ʹ��userData
		return window.localStorage || {
			_getData : function(){
				var userData = doc.createElement('input'), expires;
				userData.type = 'hidden';
				userData.style.display = 'none';
				userData.addBehavior('#default#userData');
				doc.body.appendChild(userData);
				// ���ù���ʱ��
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
	 * �������̣���Ҫ�ض���css֧��
	 *@param o <object>
	 *		@attr panel <selector> ������
	 *		@attr addPanelEvent <string> ����ƶ���ȥ������ֹͣ default: true
	 *		@attr tab <selector> �л������ɿ�
	 *		@attr tabEvent <string> ����л��¼� default: mouseover ��Ϊ'none'�ǲ������¼�
	 *		@attr cls <string> �����л���class
	 *		@attr direction <string> �ֲ������ϻ���top|left default: top
	 *		@attr easing <string> �������� default: ease
	 *		@attr duration <number> ��������ʱ�� default: 0.5(s)
	 *		@attr length <number> ÿ���ֲ�������Ԫ�س��� default: 1
	 *		@attr interval <number> �ֲ����ʱ�� default: 3
	 *		@attr autoplay <boolean> �Ƿ��Զ�ѭ�� default: true
	 *		@attr startPos <number> ��ʼλ�� default: 0
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
				length = o.length||1, // ÿ�ι����ĸ���
				TOP = 'top',
				direction = o.direction||TOP,
				offsetValue = direction==TOP?'offsetHeight':'offsetWidth',
				props = {node:panel, easing: o.easing, duration: o.duration, css:{}};
			
			// ����ÿ�ι����ľ���
			props.css[direction]=parseInt($.style.getCurrentStyle(panel, direction))||0;
			
			//t.show = 0;
			t.panel = panel;
			t.interval = (o.interval||3)*1000; // һ���ֲ���ʱ��
			t.account = o.startPos||0; // ��ǰ�Ĵ���
			t.times = Math.ceil(panels.length/length)-1; // һ���ֲ��Ĵ���
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
		
		// ��崦��
		_panelControll: function(panel, len, offsetValue, setEvent){
			var panels = panel.child(), i = 0, tmp, t = this;
			if(len==1)panel.appendChild(panels[0].cloneNode(true));
			else{
				// �����������
				tmp = panel.parentNode[offsetValue];
				tmp<t.size&&(t.size=tmp);
				// ����child���ÿ���һֱ��һ��������
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
			if(isEnd){ //һ���ֻؽ��� 
				if(!t.autoplay){
					clearInterval(t.timer);
					return;
				}
				t.callback.call(t.panel);
			}
			
			t.props.css[direction] = parseInt(t.props.css[direction]) - t.size + 'px';
			
			// ����Ч��
			$.animate(t.props, function(){
				// ��Ϊ���һ��ʱ
				if(t.account==0){
					t.props.css[direction] = 0;
					this.style[direction]=0; // t.panel.style[direction]=0; 
				}
				t.start();
			});
			// ����tab��class�����
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

