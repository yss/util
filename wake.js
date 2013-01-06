/**
 * @module wake
 */
(function(win){
var Slice = Array.prototype.slice;
function Wake() {
    if (!(this instanceof Wake)) {
        return new Wake();
    }
    // 加载判断
    this._loading = false;
    // 等待对象
    this._stack = [];
}

/**
 * 等待函数
 * @param {Function} callback
 * @param {Array | Object} args
 * @param {String | Number | Boolean} token
 * @return {Boolean} 是否需要等待
 */
Wake.prototype.wait = function(callback, args, token) {
    if (this._loading) {
        var stack = this._stack, len = stack.length;
        while(len--) {
            if (stack[len][2] === token) {
                return;
            }
        }
        stack.push([callback, Slice.call(args), token]);
        return true;
    }
    return false;
};

/**
 * 函数执行完回调，需要手动调用
 * 不适合直接放入回调函数最后，
 * 因为回调函数内部可能包含异步方法
 */
Wake.prototype.done = function() {
    var loader = this._stack.unshift();

    if (loader) {
        this._loading = loader[2];
        loader[0].apply(null, loader[1]||[]);
    } else {
        this._loading = false;
    }
};

win.Wake = Wake;
})(window);
