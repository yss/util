/**
 *	自动表单验证
 *@Author: yss.nelson@gmail.com
 *@Date: 2011/12/12
 *@Updates:
 */
if(YS === undefined)var YS = {};
(function(Y){
	if(Y.Validator)return;
	var ISAUTO = true,
		DATATYPE = 'data-type', 
		TYPE = { // 存在多个类型的变种情况，如：data-type="chinese"|"chinese-1"|"chinese-1-14"
			'chinese'	:	{	// 中文
				reg	: /^[\u0391-\uFFE5]+$/,
				desc: '中文字符'
			},
			'english'	:	{	// 英文
				reg	: /^[A-Za-z]+$/,	
				desc: '英文字符'
			},
			'word'		:	{	// 字母或数字或下划线
				reg	: /^\w+$/,	
				desc: '字母或数字或下划线'
			},
			'number'	:	{	// 0-9的数字
				reg	: /^(?:\d|[1-9]\d+)$/,	
				desc: '字母或数字或下划线'
			}
		},
		TYPESOLE = { // 仅仅存在一种情况, 如： data-type="email"
			'notEmpty'	:	{	// 不为空或空白字符
				reg	: /[^(?:^\s*$)]/,	
				desc: '不为空或空白字符'
			},
			'email'		:	{	// 邮箱
				reg	: /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/,	
				desc: '邮箱格式不正确'
			},
			'phone'		:	{	// 电话
				reg	: /^((\(\d{2,3}\))|(\d{3}\-))?(\(0\d{2,3}\)|0\d{2,3}-)?[1-9]\d{6,7}(\-\d{1,4})?$/,	
				desc: '电话格式不正确'
			},
			'mobile'	:	{	// 手机
				reg	: /^1\d{10}$/,	
				desc: '手机格式不正确'
			},
			'url'		:	{	// url地址
				reg	: /^http:\/\/[A-Za-z0-9]+\.[A-Za-z0-9]+[\/=\?%\-&_~`@\\\':+!]*([^<>\"\"])*$/,	
				desc: 'url地址格式不正确'
			},
			'float'		:	{	//	浮点数
				reg	: /^(?:\d|[1-9]\d+)(?:\.\d+)?$/,	
				desc: '浮点数格式不正确'
			},
			'code'		:	{	// 验证码（暂未给予实现）
				reg	: /[^(?:^\s*$)]/,
				desc: '验证码错误'
			}
		};
	/**
	 *@param: form <HTMLFORMELEMENT> 原生的表单元素
	 *@param: defaultCss <defined> 是否使用默认样式，默认使用
	 */
	function Validator(form, defaultCss){
		if(!form)return;
		
		// 默认样式
		if(!defaultCss){
			var CSS = document.createElement('style'), head = document.getElementsByTagName('head')[0];
			CSS.type = 'text/css';
			head.insertBefore(CSS, head.firstChild);
			if(CSS.styleSheet){
				CSS.styleSheet.cssText = '.ys-msg-success{color:green;}.ys-msg-error{color:red;}';
			}else{
				CSS.innerHTML = '.ys-msg-success{color:green;}.ys-msg-error{color:red;}';
			}
		}
		// 如果是用户调用则不是自动模式
		if(this == YS)ISAUTO=false;
		// 获取form下的所有节点
		var elem = form.getElementsByTagName('*'),
			len = elem.length,
			reg = new RegExp(),
			attr, type, tmp, tmpName, doCheckBox=true;
		
		reg.compile(/^(?:checkbox|radio)$/);// 编译后执行加快
		
		while(len--){
			tmp = elem[len];
			attr = tmp.getAttribute(DATATYPE);
			type = tmp.type;
			if(attr){
				doType(tmp, attr);
				continue;
			}
			// 针对type='checkbox' | 'radio' 单独对待
			if(type&&reg.test(type)){
				if(type=='radio'&&(!tmpName||tmpName!=tmp.name)){
					tmpName = tmp.name;
					function doRadio(name){
						doSubmit(form, function(){
							var r = form[name], l = r.length;
							while(l--){
								if(r[l].checked) return true;
							}
							alert(r[0].getAttribute('data-err')||'请选择一个单选框！');
							//return false;
						});
					}
					// 对radio加一个错误提示
					doRadio(tmpName);
				}else{
					if(doCheckBox){
						doCheckBox = false;
						doSubmit(form, function(){
							var inputs = form.getElementsByTagName('input'), l = inputs.length, tmp, err;
							while(l--){
								tmp = inputs[l];
								if(tmp.type == 'checkbox'&&tmp.checked){
									err = tmp.getAttribute('data-err');
									return true;
								}
							}
							alert(err||'请选择一个或多个复选框！');
							//return false;
						});
					}
				}
			}
		}
		
		elem = form.getElementsByTagName('select');
		len = elem.length;
		if(len){
			while(len--){
				doSelect(elem[len]);
			}
			function doSelect(sel){
				doSubmit(form, function(){
					if(sel.value == ''){
						alert(self.getAttribute('data-err')||'请选择下列选项框！');
					}
					return true;
				})
			}
		}
		
		// form submit
		addEvent(form, 'submit', function(e){
			var elem = form.getElementsByTagName('*'), len = elem.length, errSpan, i=0;
			e = e||window.event;
			while(len>i){
				elem[i++].focus();
			}
			form.focus();
			elem = form.getElementsByTagName('span');
			len = elem.length;
			while(len--){
				if(elem[len].className.indexOf('ys-msg-error')!=-1){
					errSpan = elem[len];
				}
			}
			if(errSpan){
				errSpan.previousSibling.focus();
				if(e.preventDefault){
					e.preventDefault();
				}else{
					e.returnValue = false;
				}
			}
		});
	}
	
	// 验证处理函数
	function doType(elem, attr){
		var arr = attr.split('-'),
			len = arr.length,
			type = arr[0];
		// 针对两种不同的类型区别对待
		if(TYPE.hasOwnProperty(type)){ // 多种情况
			addEvent(elem, 'blur', function(){
				var val = elem.value, len = val.length, item = TYPE[type];
				if(item.reg.test(val)){
					// arr[2] cannot be zero||0 like: chinese-1-14
					if(arr[2]&&(len>arr[2]||len<arr[1])){
						showMsg(elem, 'error', '只能是'+arr[1]+'-'+arr[2]+'个'+item.desc);
						return;
					}
					// like: chinese-1
					if(!arr[2]&&arr[1]&&len>arr[1]){
						showMsg(elem, 'error', '只能是'+arr[1]+'个'+item.desc);
						return;
					}
					showMsg(elem);
				}else{
					showMsg(elem, 'error', '只能是'+item.desc);
				}
			});
		}else if(TYPESOLE.hasOwnProperty(type)){ // 一种或者说独特例子
			addEvent(elem, 'blur', function(){
				var item = TYPESOLE[type], value = elem.value;
				if(item.reg.test(value)){
					showMsg(elem);
				}else{
					showMsg(elem, 'error', item.desc);
				}
			});
		}
	}	

	/**
	 * 显示错误
	 *@param: elem	<HTMLELEMENT>	
	 *@param: type	<string>	'error' or ''
	 *@param: msg	<string>	Error Message
	 *@return
	 */
	function showMsg(elem, type, msg){
		var next = elem.nextSibling, CLS = 'ys-msg-', isError = (type=='error');
		msg = msg || '正确'; // default: '正确'
		// 是否存在信息提示节点
		if(!next||next.nodeType != 1||next.className.indexOf(CLS) === -1){
			var span = document.createElement('span');
			//span.style.color = isError?'red':'green'; // set style
			span.appendChild(document.createTextNode(msg)); // set text node
			elem.parentNode.insertBefore(span, next);
			next = span;
		}else{
			//next.style.color = isError?'red':'green';
			next.firstChild.nodeValue = msg;
		}
		next.className = CLS+(isError?'error':'success'); // set class
		//elem.style.borderColor = isError?'red':'green';
	}
	
	function doSubmit(form, fn){
		addEvent(form, 'submit', function(e){
			e = e||window.event;
			if(!fn()){
				if(e.preventDefault){
					e.preventDefault();
				}else{
					e.returnValue = false;
				}
			}
		})
	}
	
	// 事件注册
	function addEvent(elem, type, fn, b){
		if(elem.addEventListener){
			elem.addEventListener(type, fn, b||false);
		}else if(elem.attachEvent){
			elem.attachEvent('on'+type, fn);
		}
	}
	Y.Validator = Validator;
	
	// 如果用户没有调用则1s后自动执行
	setTimeout(function(){
		if(!ISAUTO)return;
		//console.log('isAuto');
		// 过滤所有包含属性data-type="needValidate"的form
		var forms = document.forms, len = forms.length, tmp;
		while(len--){
			tmp = forms[len];
			tmp.getAttribute('data-type') === 'needValidate'&&Validator(tmp);
		}
	}, 1000);
})(YS)