/**
 * 很基本的表单验证
 * 错误是以弹出层的方式输出，需要特定的CSS支持
 *
 */

(function($) {

function FormChecker(form, options) {
    form = $(form);
    if (!form.length || !form.is('form')) return;
    var defaultOptions = {
        // 错误提示class
        errorClass: 'form-error-input',
        // 提示错误盒子
        errorBoxId: 'form-error-box',
        // 
        showBoxTime: 3000,
        // 表单项配置
        fields: {
            /** 示例：
            phone: {
                // 表单项的名字，默认使用外层的key名，此时对应的是phone
                name: {String},
                // 正则验证
                validateReg: {RegExp},
                // 函数验证，默认检查是否为空，return true代表通过，false或无返回值则为false
                validateFn: {Function},
                // 错误信息
                errorMsg: {String}
            }
            */
        },
        form: form
    };
    $.extend(defaultOptions, options);

    this.config = defaultOptions;
    this.doSubmit();
};

$.extend(FormChecker.prototype, {
    // 检测文件是否通过
    _check: function(field, value) {
        if (field.validateReg) {
            return field.validateReg.test(value);
        } else if (field.validateFn) {
            return field.validateFn(value);
        } else {
            return !/^\s*$/.test(value);
        }
    },

    doSubmit: function() {
        var _this = this,
            config = this.config,
            fields = config.fields;
        config.form.submit(function() {
            var errMsg = [],
                key,
                item,
                input;
            for(key in fields) {
                item = fields[key];
                key = item.name || key;
                input = $(this[key]);
                if (_this._check(item, input.val())) {
                    input.removeClass(config.errorClass);
                } else {
                    errMsg.push(item.errorMsg);
                    input.addClass(config.errorClass);
                }
            }
            if (errMsg.length) {
                _this.showErrMsg(errMsg);
                return false;
            }
        }).on('click', 'input', function() {
            $(this).removeClass(config.errorClass);
        });
    },

    showErrMsg: function(errMsg) {
        var boxId = this.config.errorBoxId,
            showTime = this.config.showBoxTime,
            errorBox = $('#' + boxId);
        if (!errorBox.length) {
            errorBox = $('<div id="' + boxId + '"></div>').prependTo('body');
        }
        errorBox.html('<ol><li>' + errMsg.join('</li><li>') + '</li></ol>');
        errorBox.fadeIn(function() {
            window.setTimeout(function() {
                errorBox.fadeOut();
            }, showTime);
        });
    }
});

$.formChecker = FormChecker;
})(jQuery);
