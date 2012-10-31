var events =  require("events"),
    util = require('util');

// 异步代理
// 如果有参数，参数配置同proxy
var AsyncProxy = module.exports = function(){
    // 继承event
    events.EventEmitter.call(this);

    // 如果有参数的情况下，默认调用proxy方法
    if (arguments.length) {
        // this.proxy(Array.prototype.slice.call(arguments));
        this.proxy.apply(this, arguments);
    }
};

//AsyncProxy.prototype = events.EventEmitter.prototype;
// 采用nodejs里的官方例子写法
util.inherits(AsyncProxy, events.EventEmitter);

/**
 * 异步代理函数，至少需要三个参数，分别是evt1, evt2, callback
 * 调用的之前需要每次new asyncProxy();保证asyncProxy是新的对象。
 * @param {String} evt1
 * @param {String} evt2
 * @param ...
 * @param {String} evtn
 * @param {Function} callback
 */
AsyncProxy.prototype.proxy = function() {
    var _this = this,
        args = Array.prototype.slice.call(arguments),
        len = args.length;

    // 三个以上参数才符合我们的预期，也就是异步执行代码前提。
    if (len < 3) {
        console.error('至少需要三个参数，分别是：evt1, evt2, callback');
        return;
    }

    this.callback = args.pop();
    --len;

    this.args = new Array(len);
    this.len = len;

    // max size limit
    if (len > 10) {
        this.setMaxListeners(len);
    }

    args.forEach(function(item, i) {
        _this.on(item, function(data) {
            _this.args[i] = data;
            if (!--_this.len) {
                this.callback.apply(_this, _this.args);
            }
        });
    });
};

/**
 * 等待函数执行完后，统一调用只执行一次哦
 * @param {String} evtname 事件名
 * @param {Function} callback 回调函数
 * @return
 */
AsyncProxy.prototype.wait = function(evtname, callback) {
    var _this = this;
    // set waitStack
    if (!this.waitStack) {
        this.waitStack = {};
    }

    if (this.waitStack.hasOwnProperty(evtname)) {
        this.waitStack[evtname].push(callback);
    } else {
        this.waitStack[evtname] = [callback];
        this.once(evtname, function(data) {
            var callback,
                waitStack = _this.waitStack[evtname],
                isArguments = !!data.callee;

            if (isArguments) data = Array.prototype.slice.call(data);

            while(callback = waitStack.shift()) {
                isArguments ? callback.apply(_this, data) : callback(data);
            }
            delete _this.waitStack[evtname];
        });
    }
};

/**
 * 线性回调，主要用于测试
 * 
 * new AsyncProxy().sync([
 *      funtion(callback) {
 *          callback(null, 'one');
 *      },
 *      ...
 *  ],function(results) {
 *      console.log(results);
 *  });
 * 
 * @param {Array} syncList
 * @param {Function} callback
 */
AsyncProxy.prototype.sync = function(syncList, callback) {
    function syncCallback() {
        if (arguments.length) {
            // 第一个值默认为error参数，即错误就中止程序运行
            if (arguments[0]) {
                console.log('[SYNC ERROR]', err);
                return;
            }
            callback.apply(this, Array.prototype.slice.call(arguments, 1));
        }
        if (syncList.length) {
            syncList.shift()(syncCallback);
        }
    }
    syncCallback();
};
