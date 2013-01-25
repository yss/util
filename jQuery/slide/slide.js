/**
 * 卡盘代码
 * @Date 2012/12/28
 * @Support jQuery||Zepto
 */

(function(win) {
    // 判断用户使用的框架
    var $ = win.Zepto || win.jQuery;
    /**
     * 滚动卡盘，需要特定的html,css支持
     * @param {Object} o
     *		@attr {Selector|HTMLElement} panel 内容栏
     *		@attr {String} addPanelEvent 鼠标移动上去，卡盘停止 default: true
     *		@attr {Selector|HTMLElement} tab 切换栏，可空
     *		@attr {String} tabEvent 鼠标切换事件，空。当isTouch为true时，这个tabEvent值不建议设置，因为很容易同时触发panel上的swipe事件，如果需要请设置为tap
     *      @attr {Boolean} isTouch 是否是触摸 default: false
     *		@attr {String} cls 用于切换的class default: selected
     *		@attr {String} direction 轮播方向（上或左）top|left default: left
     *		@attr {String} easing 动画函数 default: 按照js框架的默认值
     *		@attr {Number} duration 动画所用时间 default: 0.5(s)
     *		@attr {Number} rollSize 每次轮播滚动子元素个数 default: 1
     *		@attr {Number} interval 轮播间隔时间 default: 3
     *		@attr {Boolean} isLoop 是否自动循环 default: true
     *		@attr {Number} startPos 开始位置 default: 0
     *		@attr {Function} callback 每次动画后的回调函数（this对应的是$(panel)，另外传两个参数，之前和之后的位置值）
     * @return {Object}
     */
    function Slide(o){
        var defaultConfig = {
            addPanelEvent: true,
            cls: 'selected',
            direction: Slide.DIRECTION_LEFT,
            // easing: 'ease',
            duration: 0.5,
            rollSize: 1,
            interval: 3,
            isLoop: true,
            startPos: 0,
            callback: function(){}
        };
        if (this instanceof Slide) {
            o.panel = $(o.panel);
            if (!o.panel.length) {
                return;
            }
            o.tab = $(o.tab);
            $.extend(defaultConfig, o);
            defaultConfig.interval = defaultConfig.interval * 1000;
            defaultConfig.duration = defaultConfig.duration * 1000;
            this.config = defaultConfig;
            this.init();
            return this;
        } else {
            return new Slide(o);
        }
    }
    Slide.DIRECTION_LEFT = 'left';
    Slide.prototype = {
        /**
         * 初始化
         */
        init: function(){
            var config = this.config,
                panels = config.panel.children(),
                panelSize = panels.length,
                tabs = config.tab.children();

            if (config.direction === Slide.DIRECTION_LEFT) {
                this.rollLength = config.panel.parent().width();
            } else {
                this.rollLength = config.panel.parent().height();
            }

            if (panelSize <= config.rollSize) {
                return;
            }
            this.css = {};
            // 一次轮播的总数
            this.amount = Math.ceil(panelSize / config.rollSize) - 1;

            // 存放当前卡盘运行的位置
            this.count = config.startPos;
            // 初始值
            this.startValue = parseInt(config.panel.css(config.direction), 10) || 0;

            this._handlePanel(panels);

            if (tabs.length) {
                this.tabs = tabs;
                this._addTabEvent();
            }
            // run
            this.start();
        },

        /**
         * 处理面板及注册时间
         * @param {NodeList} panels
         */
        _handlePanel: function(panels) {
            var _this = this,
                config = _this.config,
                panel = config.panel,
                direction = config.direction,
                initValue = _this.startValue - config.startPos * _this.rollLength + 'px',
                isLeft = direction === Slide.DIRECTION_LEFT,
                i = 0;
            // 复制滚动项
            for (; i < config.rollSize; i++) {
                panel.append(panels.eq(i).clone());
            }

            // 设置初始化面板的位置
            panel.css(direction, initValue)
                .css(isLeft ? 'width' : 'height', _this.rollLength * (panels.length + config.rollSize) + 'px');

            _this.css[direction] = initValue;
            // 设置面板的事件
            if (config.addPanelEvent) {
                if (config.isTouch) {
                    panel[isLeft ? 'swipeLeft' : 'swipeUp'](function(e) {
                        e.preventDefault();
                        _this.next();
                    })[isLeft ? 'swipeRight' : 'swipeDown'](function(e) {
                        e.preventDefault();
                        _this.prev();
                    });
                } else {
                    panel.mouseover(function() {
                        _this.stop();
                    }).mouseout(function() {
                        _this.start();
                    });
                }
            }
        },

        /**
         * 卡盘选项卡事件
         */
        _addTabEvent: function(){
            var _this = this,
                config = _this.config,
                tabEvent = config.tabEvent,
                pause;

            if (!tabEvent) {
                return;
            }
            _this.tabs.each(function(i, node) {
                if (config.isTouch) {
                    $(node)[tabEvent](function() {
                        _this.stop();
                        if (_this.count !== i) {
                            _this._move(_this.count, i, function() {
                                this.start();
                            });
                            _this.count = i;
                        }
                    });
                } else {
                    $(node)[tabEvent](function() {
                        if (pause) {
                            win.clearTimeout(pause);
                        }
                        pause = win.setTimeout(function() {
                            _this.stop();
                            if (_this.count !== i) {
                                _this._move(_this.count, i, function() {
                                    this.start();
                                });
                                _this.count = i;
                            }
                        }, 200);
                    });
                }
            });
            // 为选项卡增加class
            _this.tabs.eq(_this.count).addClass(config.cls);
        },

        /**
         * 卡盘开始转动
         */
        start: function(){
            var _this = this;
            _this.stop();
            _this.show = win.setInterval(function() {
                _this._run();
            }, _this.config.interval);
        },

        /**
         * 卡盘停止转动
         */
        stop: function(){
            if (this.show) {
                win.clearInterval(this.show);
            }
        },

        /**
         * 卡盘向前移动
         */
        prev: function() {
            // 最开始的一个
            if (this.count <= 0) {
                return;
            }
            this.stop();
            this.count -= 1;
            this._move(this.count + 1, this.count, function() {
                this.start();
            });
        },

        /**
         * 卡盘向后移动
         */
        next: function() {
            // 未知情况
            if (this.count >= this.amount) {
                return;
            }
            this.stop();
            this.count += 1;
            this._move(this.count - 1, this.count, function() {
                this.start();
            });
        },

        /**
         * 卡盘转动执行函数
         */
        _run: function(){
            var config = this.config,
                count = this.count, // 用于计算
                isEnd = this.amount <= count,
                cls = config.cls,
                tabs = this.tabs;

            // 一次轮回结束
            if (isEnd) {
                this.count = 0;
                if (!config.isLoop) {
                    this.stop();
                    return;
                }
            } else {
                if (count < 0) {
                    this.count = 0;
                    count = 0;
                } else {
                    this.count++;
                }
            }

            this._move(count, count + 1, function(){
                // 当为最后一个时
                if (this.count < 1) {
                    var config = this.config;
                    this.css[config.direction] = this.startValue;
                    config.panel.css(config.direction, this.startValue);
                }
            });
        },

        /**
         * 移动卡盘
         * @param {Number} prevCount
         * @param {Number} [count]
         * @param {Function} [callback]
         */
        _move: function(prevCount, count, callback) {
            var _this = this,
                config = this.config;
            if (typeof count === 'function') {
                callback = count;
                count = this.count;
            }
            this.css[config.direction] = this.startValue - this.rollLength * count + 'px';
            // 为了自动轮播的最后一步
            if (count > this.amount) {
                prevCount = this.amount;
                count = 0;
            }

            this.moving = true;
            config.panel.animate(this.css, config.duration, config.easing, function() {
                config.callback.apply(config.panel, [prevCount, count]);
                if (callback) {
                    callback.call(_this);
                }
                _this.moving = false;
            });

            // 存在tab及class的情况
            if (this.tabs) {
                this.tabs.eq(prevCount).removeClass(config.cls);
                this.tabs.eq(count).addClass(config.cls);
            }
        }
    };
    $.slide = Slide;
})(window);
