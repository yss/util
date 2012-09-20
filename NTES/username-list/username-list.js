/**
 *@Author: yansong@corp.netease.com
 *@Date: 2011-12-22
 *@use:
	new $.ui.UserNameList({input: document.getElementById('username')||$('#username')});
 *@updates: 
 */
//(function(){
var getStyle = $.style.getCurrentStyle,
	browser = $.browser,
	isIE = browser.msie,
	version = browser.version,
	isIE7 = (isIE&&version<8)||document.documentMode==7, // IE6&7 �����˼���ģʽ����
	isIE6 = isIE&&version<7, // IE6 ONLY
	// һЩ�����ַ���
	USERNAMELIST = 'ys-username-list',
	NULL = null,
	EMPTY = '',
	YHOVER = 'y-hover',
	PX = 'px',
	AT = '@',
	STYLE = 'style',
	BLOCK = 'block',
	NONE = 'none',
	WIDTH = 'width';
/**
 * ͨ��֤�û���ƥ��js
 *@param: o <object>
	*@attr: input <HTMLELEMENT> input�ڵ�
	*@attr: arr <array> ƥ�������
	*@attr: cls <string> popup class
	*@attr: width <number>ONLY FOR IE6&7 ��ʼ����ȣ�Ĭ��122 for IE6&7
	//*@attr: count <number>ONLY FOR IE6 ��С�ĳ��ȸ��� ��width�໥��Ӧ��Ĭ��11
 *@return pop<NTES> ֱ�������õ�Ԫ�ء�IE6&7Ϊtable������Ϊtable����div
 */
function UserNameList(o){
	var t = this,
		arr = o.arr||['163.com', '126.com', 'vip.126.com', 'yeah.net', '188.com', 'vip.163.com'],
		len = arr.length,
		cls = (o.cls||EMPTY)+' '+USERNAMELIST,
		width = o.width||122,
		input = $(o.input).$(0), // Ψһ��input�ڵ�
		popNative = document.createElement('div'),// ���뵯����
		pop,
		//pStyle, // pop.style, the pop is diffrent in IE and non-IE
		css = {},// ��ŵ�ǰ��pop.styleֵ
		//styelValue, // ��ŵ�ǰ��pop.styleֵ
		//currTD, // ��ǰ��ʾ��TD
		pTD, // ���е�TD
		//CLICK = 'click',
		//isBlur,
		
		tabTD;// ��ǰ�۽���tdλ
	// ������ʽ
	t._setStyle();
	$('body')[0].appendChild(popNative);
	// ����html
	popNative.innerHTML = t._html(arr);
	
	if(isIE){ // IE is table
		pop = $(popNative.firstChild);
	}else{ // non-IE is div
		popNative.firstChild.setAttribute(WIDTH,'100%');
		pop = $(popNative);
	}
	
	pop.className = cls;
	//pStyle = pop.style;
	// ���е�TD
	pTD = pop.$('td');
	
	// inputWidth = input.offsetWidth; ���ǵ����ص�input�޷�������offsetWidthֵ
	function setWidth(){
		var inputWidth = input.offsetWidth;
		// ȡ����������Զ���ɹ���
		input.setAttribute('autocomplete', 'off');
		// ��ȡinput����ֵ���Դ�����pop������ֵ ��pop����
		if(inputWidth>width){
			// IE��non-IE����Ĳ�һ�� ����֮�������border��ֵ
			//width = inputWidth-(isIE?0:);
			if(!isIE)inputWidth -= parseInt(getStyle(pop, 'borderLeftWidth'))+parseInt(getStyle(pop, 'borderRightWidth'));
			else {
				css.width = inputWidth + PX;
			}
			css.minWidth = inputWidth+PX;
			
		}else if(isIE6){
			css.width = width+PX;
		}
		// IE6&7 bug
		if(isIE7){
			css.marginLeft = '-2px';
			css.marginTop = '-2px';
		}
		
		$.style.addCss(pop,css);
		setWidth = function(){};
	}
	
	// ����input��ֵ��ͳһ���ã����̴�����
	function setInputValue(td){
		pTD&&(input.value = (td||pTD[tabTD||0]).firstChild.nodeValue);
	}
	
	// Ϊinput��������ֵ
	input.addEvent('focus', function(e){
		var offset = input.getBoundingClientRect(), pStyle;
		if(!pop)return;
		//isBlur = false;
		//console.log('focus:'+isBlur)
		// һ��ִ�У��²�Ϊ��
		setWidth();
		pStyle = pop.style;
		css.display = pStyle.display = BLOCK;
		css.left = pStyle.left = offset.left+PX;
		css.top = pStyle.top = offset.top + (offset.height||input.offsetHeight) + Math.max(document.body.scrollTop, document.documentElement.scrollTop)+ PX;
		// in ie pop is table
		loadName(e); // ��ֹ�Զ����ֵ���Ϣ
	}).addEvent('blur', function(e){
		//var pStyle = pop.style;
		// ��ֹ������Զ�ƥ������
		//if(NONE != pStyle.display){
			input.value&&setInputValue();
			if(pTD){
				pTD[tabTD||0].className = EMPTY;
				tabTD = NULL;
			}
		//}
		//isBlur = true;
		pop.style.display = NONE;
	}).addEvent('keydown', function(e){
		var tmp, code = e.keyCode;
		if(code==38||code==40){ // up and down event
			var up = code == 38;
			//while(l--)pTD[l].className = EMPTY;
			if(!pTD) return;
			if(tabTD!=NULL){
				pTD[tabTD].className = EMPTY;
				up?--tabTD:++tabTD;
				tabTD<0&&(tabTD=len-1);
				tabTD==len&&(tabTD=0);
			}else{
				tabTD = up?len-1:0;
			}
			//console.log('keydown:'+tabTD)
			pTD[tabTD].className = YHOVER;
			setInputValue();
		}else if(code == 13||code ==108){ // enter event
			e.preventDefault();
			pop.style.display = NONE;
		}
	}).addEvent('keyup', loadName);
	// ����list�б�
	function loadName(e){
		var l = 0,
			val = input.value.split(AT),
			t1 = val[0],
			t2 = val[1],
			code = e.keyCode,
			td, rel = [];
		switch(code){
			//case 13:
			//case 108:
				
			case 38:
			case 40:
			case 9:
				break;
			default:
				if(pTD){ // fix for enter event
					td = pTD[0].firstChild.nodeValue.split(AT);
					if((undefined==t2||td[1]==t2)&&td[0]==t1){
						break;
					}
				}
				// һ�Ǵ��������ַ�����: xxx@xxx������xxx@ , ���ǿ�
				if(t2){
					len = arr.length;
					while(l<len){
						if(arr[l].indexOf(t2)==0)rel.push(arr[l]);
						l++;
					}
					if(!rel.length){
						pTD = NULL;
						popNative.innerHTML = EMPTY;
						return;
					}
				}else{
					rel = arr;
				}
				popNative.innerHTML = t._html(rel);
				pTD = popNative.getElementsByTagName('td');
				td=popNative.firstChild;
				tabTD = NULL;
				isIE?(pop=td, $.style.addCss(pop, css), td.className = cls):(td.width="100%");
				pop.style.display = BLOCK;
				len = pTD.length;
				l = 0;
				while(l<len){
					td = pTD[l++];
					td.firstChild.nodeValue = t1 + td.getAttribute('data-rel');
				}
		}
	}
	// resize �¼���������
	$(window).addEvent('resize', function(){
		// resize for pop
		if(pop.style.display == BLOCK){
			pop.style.left = input.getBoundingClientRect().left+PX;
		}
	});
	
	// �¼�����
	$(popNative).addEvent('mouseover', function(e){
		var target = e.target;
		if(target.nodeName == 'TD'){
			pTD[tabTD||0].className = EMPTY;
			target.className = YHOVER;
			tabTD = parseInt(target.getAttribute('data-item'));
		}
	}).addEvent('mouseout', function(e){
		var target = e.target;
		if(target.nodeName == 'TD'){
			pTD[tabTD||0].className = EMPTY;
			tabTD = NULL;
			// �������뿪����pop�����أ������û�click tab enter�¼�����
			//if(pop.style.display == NONE)setInputValue(target);
		}
	});
	// ����������ʽ��popֵ
	return popNative;
}
UserNameList.prototype = {
	// ����Ĭ����ʽ
	_setStyle: function(){
		// ������ʽ
		if(!$('#'+USERNAMELIST)){
			var head = $('head')[0],
				CSS = document.createElement(STYLE),
				name = '.'+USERNAMELIST,
				cssStr = [name,'{position:absolute;display:none;_width:122px;min-width:122px;background-color:#fff;z-index:9999;text-align:left;color:#727171;border:1px solid #e3e3e3;}',
					name, ' table,', name, '{border-collapse:collapse;border-spacing:0;}',
					name, ' th{height:22px;background-color:#f6f6f6;line-height:22px;padding:0 5px;white-space:nowrap;}',
					//'.ys-username-list .y-bd{}'+
					name, ' td{height:22px;line-height:22px;padding:0 5px;cursor:pointer;font-family: Verdana,san-serif,\5B8B\4F53;white-space:nowrap;}',
					name, ' td.y-hover{background-color:#4472ae;color:#fff;}'].join(EMPTY);
			CSS.type = 'text/css';
			CSS.id = USERNAMELIST;
			head.insertBefore(CSS, head.firstChild);
			if(CSS.styleSheet){
				CSS.styleSheet.cssText = cssStr;
			}else{
				CSS.innerHTML = cssStr;
			};
		}
	},
	
	// ����html
	_html: function(arr){
		var len = arr.length, i = 0, tmp, html = ['<table><thead><tr><th>��ѡ����������...</th></tr></thead><tbody>'];
		//if(!len)return EMPTY;
		while(i<len){
			tmp = AT+arr[i];
			html.push('<tr><td data-rel="');
			html.push(tmp);
			html.push('" data-item="');
			html.push(i++);
			html.push('">');
			html.push(tmp);
			html.push('</td></tr>');
			//if(tmp.length>maxLen)maxLen = i;
		}
		html.push('</tbody></table>');
		return html.join(EMPTY);
	}
}
$.ui.UserNameList = UserNameList;
//})();
//function log(a){console?console.log(a):alert(a)}