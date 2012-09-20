/**
 *	�Զ�����֤
 *@Author: yss.nelson@gmail.com
 *@Date: 2011/12/12
 *@Updates:
 */
if(YS === undefined)var YS = {};
(function(Y){
	if(Y.Validator)return;
	var ISAUTO = true,
		DATATYPE = 'data-type', 
		TYPE = { // ���ڶ�����͵ı���������磺data-type="chinese"|"chinese-1"|"chinese-1-14"
			'chinese'	:	{	// ����
				reg	: /^[\u0391-\uFFE5]+$/,
				desc: '�����ַ�'
			},
			'english'	:	{	// Ӣ��
				reg	: /^[A-Za-z]+$/,	
				desc: 'Ӣ���ַ�'
			},
			'word'		:	{	// ��ĸ�����ֻ��»���
				reg	: /^\w+$/,	
				desc: '��ĸ�����ֻ��»���'
			},
			'number'	:	{	// 0-9������
				reg	: /^(?:\d|[1-9]\d+)$/,	
				desc: '��ĸ�����ֻ��»���'
			}
		},
		TYPESOLE = { // ��������һ�����, �磺 data-type="email"
			'notEmpty'	:	{	// ��Ϊ�ջ�հ��ַ�
				reg	: /[^(?:^\s*$)]/,	
				desc: '��Ϊ�ջ�հ��ַ�'
			},
			'email'		:	{	// ����
				reg	: /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/,	
				desc: '�����ʽ����ȷ'
			},
			'phone'		:	{	// �绰
				reg	: /^((\(\d{2,3}\))|(\d{3}\-))?(\(0\d{2,3}\)|0\d{2,3}-)?[1-9]\d{6,7}(\-\d{1,4})?$/,	
				desc: '�绰��ʽ����ȷ'
			},
			'mobile'	:	{	// �ֻ�
				reg	: /^1\d{10}$/,	
				desc: '�ֻ���ʽ����ȷ'
			},
			'url'		:	{	// url��ַ
				reg	: /^http:\/\/[A-Za-z0-9]+\.[A-Za-z0-9]+[\/=\?%\-&_~`@\\\':+!]*([^<>\"\"])*$/,	
				desc: 'url��ַ��ʽ����ȷ'
			},
			'float'		:	{	//	������
				reg	: /^(?:\d|[1-9]\d+)(?:\.\d+)?$/,	
				desc: '��������ʽ����ȷ'
			},
			'code'		:	{	// ��֤�루��δ����ʵ�֣�
				reg	: /[^(?:^\s*$)]/,
				desc: '��֤�����'
			}
		};
	/**
	 *@param: form <HTMLFORMELEMENT> ԭ���ı�Ԫ��
	 *@param: defaultCss <defined> �Ƿ�ʹ��Ĭ����ʽ��Ĭ��ʹ��
	 */
	function Validator(form, defaultCss){
		if(!form)return;
		
		// Ĭ����ʽ
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
		// ������û����������Զ�ģʽ
		if(this == YS)ISAUTO=false;
		// ��ȡform�µ����нڵ�
		var elem = form.getElementsByTagName('*'),
			len = elem.length,
			reg = new RegExp(),
			attr, type, tmp, tmpName, doCheckBox=true;
		
		reg.compile(/^(?:checkbox|radio)$/);// �����ִ�мӿ�
		
		while(len--){
			tmp = elem[len];
			attr = tmp.getAttribute(DATATYPE);
			type = tmp.type;
			if(attr){
				doType(tmp, attr);
				continue;
			}
			// ���type='checkbox' | 'radio' �����Դ�
			if(type&&reg.test(type)){
				if(type=='radio'&&(!tmpName||tmpName!=tmp.name)){
					tmpName = tmp.name;
					function doRadio(name){
						doSubmit(form, function(){
							var r = form[name], l = r.length;
							while(l--){
								if(r[l].checked) return true;
							}
							alert(r[0].getAttribute('data-err')||'��ѡ��һ����ѡ��');
							//return false;
						});
					}
					// ��radio��һ��������ʾ
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
							alert(err||'��ѡ��һ��������ѡ��');
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
						alert(self.getAttribute('data-err')||'��ѡ������ѡ���');
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
	
	// ��֤������
	function doType(elem, attr){
		var arr = attr.split('-'),
			len = arr.length,
			type = arr[0];
		// ������ֲ�ͬ����������Դ�
		if(TYPE.hasOwnProperty(type)){ // �������
			addEvent(elem, 'blur', function(){
				var val = elem.value, len = val.length, item = TYPE[type];
				if(item.reg.test(val)){
					// arr[2] cannot be zero||0 like: chinese-1-14
					if(arr[2]&&(len>arr[2]||len<arr[1])){
						showMsg(elem, 'error', 'ֻ����'+arr[1]+'-'+arr[2]+'��'+item.desc);
						return;
					}
					// like: chinese-1
					if(!arr[2]&&arr[1]&&len>arr[1]){
						showMsg(elem, 'error', 'ֻ����'+arr[1]+'��'+item.desc);
						return;
					}
					showMsg(elem);
				}else{
					showMsg(elem, 'error', 'ֻ����'+item.desc);
				}
			});
		}else if(TYPESOLE.hasOwnProperty(type)){ // һ�ֻ���˵��������
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
	 * ��ʾ����
	 *@param: elem	<HTMLELEMENT>	
	 *@param: type	<string>	'error' or ''
	 *@param: msg	<string>	Error Message
	 *@return
	 */
	function showMsg(elem, type, msg){
		var next = elem.nextSibling, CLS = 'ys-msg-', isError = (type=='error');
		msg = msg || '��ȷ'; // default: '��ȷ'
		// �Ƿ������Ϣ��ʾ�ڵ�
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
	
	// �¼�ע��
	function addEvent(elem, type, fn, b){
		if(elem.addEventListener){
			elem.addEventListener(type, fn, b||false);
		}else if(elem.attachEvent){
			elem.attachEvent('on'+type, fn);
		}
	}
	Y.Validator = Validator;
	
	// ����û�û�е�����1s���Զ�ִ��
	setTimeout(function(){
		if(!ISAUTO)return;
		//console.log('isAuto');
		// �������а�������data-type="needValidate"��form
		var forms = document.forms, len = forms.length, tmp;
		while(len--){
			tmp = forms[len];
			tmp.getAttribute('data-type') === 'needValidate'&&Validator(tmp);
		}
	}, 1000);
})(YS)