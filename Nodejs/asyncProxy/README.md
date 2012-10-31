# asyncProxy
包含异步、同步、等待方法
## 异步
主要是为了并行处理多次数据库操作
```javascript
var asyncProxy = require('./asyncProxy');
var ap = new asyncProxy();
ap.proxy('a', 'b', function(a, b) {
    console.log(a, b);
})

mysql.query('sq1', function(err, results) {
    ap.emit('a', results);
});
mysql.query('sq2', function(err, results) {
    ap.emit('b', results);
});
```
## 等待
主要是为了处理N个请求同时访问数据库操作
```javascript
var ready = true;
function testWait(callback) {
    ap.wait('test', callback);

    if (ready) {
        ready = false;
        mysql.query('sql', function(err, results) {
            ap.emit('test', arguments);
        });
    }
}

function runWaitTest() {
    var arr = [1,2,3,4,5];
    arr.forEach(function(item) {
        testWait(function(data1, data2) {
            console.log(item, data1, data2);
        })
    });
}

runWaitTest();
```
## 同步
主要是用于测试代码，目前如果callback的第一个参数为“非零值”，程序将会被中止执行并输出第一个参数值。
```javascript
ap.sync([
    function(callback) {
        callback(null, 'sync 1 is ok!');
    },
    function(callback) {
        console.log('sync is tested.');
        callback(null, 'sync 2 is ok!');
    }
], function(results) {
    console.log(results);
});
```
