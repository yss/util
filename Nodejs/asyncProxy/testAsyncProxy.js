var assert = require('assert'),
    asyncProxy = require('./asyncProxy'),
    ap = new asyncProxy();
console.log('sync is testing...');
ap.sync([
    function(callback) {
        callback(null, 'sync 1 is ok!');
    },
    function(callback) {
        console.log('sync is tested.');
        callback(null, 'sync 2 is ok!');
    },
    function(callback) {
        console.log('proxy is tesing...');
        testProxy(callback);
    },
    function(callback) {
        console.log('wait is testing...');
        testWait(callback);
    }
], function(results) {
    console.log(results);
});

function testProxy(callback) {
    var ap = new asyncProxy();
    ap.proxy('a', 'b', 'c', function(a, b, c) {
        assert.strictEqual(a, 123);
        assert.strictEqual(b, 223);
        assert.strictEqual(c, 323);
        callback(null, 'proxy is tested.');
    });
    console.log('proxy test use setTimeout function');
    setTimeout(function(){
        console.log('emit a for use 300s');
        ap.emit('a', 123);
    }, 300);


    setTimeout(function(){
        console.log('emit b for use 100s');
        ap.emit('b', 223);
    }, 100);

    setTimeout(function(){
        console.log('emit c for use 323s');
        ap.emit('c', 323);
    }, 100);
}

function testWait(callback) {
    var ready = true;
    function testWait(testCallback) {
        ap.wait('test', testCallback);

        if (ready) {
            ready = false;
            setTimeout(function(){
                // ap.emit('test', arguments);
                function a() {
                    ap.emit('test', arguments);
                    callback(null, 'wait is tested.');
                }
                a(10,20);
                ready = true;
            }, 100);
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

}
//testWait();
