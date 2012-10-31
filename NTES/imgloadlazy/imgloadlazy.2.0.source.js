/**
 * imgͼƬ�����ӳټ������ 2.0
 * @Author yansong@corp.netease.com
 * @Date�� 2011-11-11
 * @For: if needs
 * @Desc:
 * 	��Ӧ�Ľṹ��<img data-src="��ʵ��ַ" ... />
 * 	imgsֻ֧��ԭ�������顢NTES���������JQuery�Ķ������顣�磺document.getElementsByTagName('img')
 * 	��1.0������˸Ľ���
 * 1. ɾ���Զ�ģʽ����Ϊȱ�ݺܶ࣬Ŀǰû���κ���վʹ�����ַ�ʽ�����Բ���Ҫ��������Դ˼����������
 * 2. �Ż�js���롣
 * @examples:
 * 	1.������Եģ�
 * 		YS.imgLoadLazy({imgs: document.getElementById('js_Imgs').getElementsByTagName('img'))
 * 	2.ͨ���Ե�(���Զ�������ҳ���а���dataSrc(data-src)����img):
 * 		YS.imgLoadLazy();
 * 	3.�����ԣ�
 * 		YS.imgLoadLazy({imgs: jQuery('#js_Imgs img')}); // support jQuery lib
 * 		YS.imgLoadLazy({imgs: NTES('#js_Imgs img')}); // support ntes lib
 * 
 * 	<!- �������placehold���� -!> �磺
 * 		YS.imgLoadLazy({
 *			placehold: 'http://img1.cache.netease.com/sports/img11/dayun0720/space.png'
 *		});
 * 4.׷�����������
 *      var loadLazy = imgLoadLazy({imgs: jQuery('#js_Imgs img')})
 *      loadLazy.addImgs(jQuery('img.filter'));
 * @Updates:
 *  1. ����addImgs�������������׷�����ݣ�
 * 	2. ����_throttle�����������ظ�������
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
            if(typeof t2 === 'object'){
				typeof t1 === 'object' ? mix(t1, t2, w, pro) : s[a] = t2;
			}
			// �Ƿ񸲸�, ԭ���Ƿ����aֵ������ԭ�����Ӧ��ֵΪ��
			if(w||!s.hasOwnProperty(a)||!t1)s[a] = t2;
		}
	}	
	/**
	 * ͼƬ�ӳټ������
	 *@param config {object}
		*@attr placehold {url} �����滻ͼƬsrc
		//(��ȥ��) *@attr manual {boolean} default: true �ֶ�ģʽ��Ĭ�����ֶ�ģʽ�������imgs
		*@attr dataSrc {string} default: data-src �����ʵ��ͼƬ��ַ
		*@attr tops {array} <private>������Ҫ���ص�ͼƬ�����body�����Ϸ��߶�
		*@attr imgs {array} <protect>������Ҫ���ص�ͼƬ eg: jQuery('img'), NTES('img'),document.getElementsByTagName('img')
		*@attr screenValue {number} default: 1.5 �������Ļ�߶ȵı���
		*@attr screenH {number} <private>default: 1.5������Ļ�߶� ͼƬ�����������Ļ�Ϸ��߶ȵ��ٽ�ֵ��С������߶Ⱦͼ��ء�
	 *@undo:
	 *	���ʺ��������js��䶯�ĸı�body�߶ȡ�
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
		// ǿ�ƺϲ�config����
		mix(config, o, true);
		
		config.screenH = self._getScreen();
		
		self._config = config;
		
		//log(self._config)
		// ��ʼ������
		self._init();
        return this;
	}
	mix(imgLoadLater.prototype , {
		_config: {//�����ļ�
			//placehold: null,
			//manual: true, //�ֶ�ģʽ��Ĭ��Ϊtrue ���û��Լ����imgs
			dataSrc: 'data-src',
			//tops: [],//���ÿ��Ԫ�������document�ĸ߶�ֵ
			//imgs: [],//���ÿ��imgԪ��
			screenValue: 1.5 //�����������ǰ��Ļ�ĸ߶�����ľ���
		},
		_getTop: function(elem){
			// ����Ԫ������ڵ�ǰ�������Ļ�����ĸ߶�
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
				// С�ڶ�Ӧ��winHֵ�����
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
			// �����������ĸ߶�
			return document.documentElement.clientHeight * this._config.screenValue;
		},
		_getScrollTop: function(){
			// ��ȡscrollTop
	��������return Math.max(document.body.scrollTop, document.documentElement.scrollTop);
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
			// ������Ҫ���ص�imgs��tops
			while(len--){
				tmp = arrImgs[len];
				if(tmp.getAttribute(dataSrc)){
					// top = img����������Ļ�ĸ߶� + ��������scroll top
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
        // �����δ��� ��������
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
        // ׷��img

		// ��ʼ������
		_init: function(){
			var self = this;
			//self._mix(config, o);
			// ��ʼ����Ҫ���ص�Imgs
			self.addImgs();
			// ��Ӧ��scroll��resize�¼�����
			self._addEvent(win, 'scroll', self._throttle(function() {
                // ����img
                self._imgLoad();
            }));
			self._addEvent(win, 'resize', self._throttle(function() {
				// ���»�ȡscreenH
				self._config.screenH = self._getScreen();
				self._imgLoad();
            }));
		    
			// ��һ�μ��أ�
            self._imgLoad();
		}
	});

	YS._mix = mix;
	YS.imgLoadLazy = imgLoadLater;
})(window);
