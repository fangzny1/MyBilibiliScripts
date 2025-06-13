// ==UserScript==
// @name         Bilibili Enhanced Blocker (All-in-One)beta
// @namespace    http://tampermonkey.net/
// @version      1.0.5
// @description  拦截埋点、WebSocket、XHR，修复评论加载异常和Promise错误，并支持日志开关
// @author       fangzny@qwen3@deepseek v3
// @match        https://www.bilibili.com/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    // ================== 配置区 ==================
    const DEBUG_MODE = false; // ⚙️ 控制是否输出日志，true 开启，false 关闭
    // ===========================================

    function debugLog(...args) {
        if (DEBUG_MODE) {
            console.log('[BEB-AIO]', ...args);
        }
    }

    // 全局监听未捕获的 Promise 拒绝
    window.addEventListener('unhandledrejection', function (event) {
        const reason = event.reason || '未知Promise拒绝错误(解析失败)';
        debugLog('Promise错误:', reason);
        event.preventDefault(); // 阻止错误继续传播
    });

    // ================== 模块一：移除 Adblock 提示 ==================
    (() => {
        const style = document.createElement('style');
        style.textContent = `
            .adblock-tips {
                display: none !important;
                visibility: hidden !important;
                height: 0 !important;
                width: 0 !important;
                overflow: hidden !important;
                position: absolute !important;
                left: -9999px !important;
                top: -9999px !important;
            }
        `;
        document.head.appendChild(style);

        const observer = new MutationObserver(mutations => {
            for (let mutation of mutations) {
                for (let node of mutation.addedNodes) {
                    if (node.nodeType === 1 && node.classList?.contains('adblock-tips')) {
                        node.remove();
                    }
                }
            }
        });

        observer.observe(document.body, { childList: true, subtree: true });

        function removeTips() {
            document.querySelectorAll('.adblock-tips').forEach(el => el.remove());
        }

        removeTips();
        setInterval(removeTips, 1000);
    })();

    // ================== 模块二：拦截 fetch ==================
    (() => {
        const originalFetch = window.fetch;
        window.fetch = function (input, init) {
            const url = typeof input === 'string' ? input : input.url;

            if (url.includes('data.bilibili.com') || url.includes('cm.bilibili.com')) {
                debugLog('Blocked fetch to:', url);
                return Promise.resolve(new Response(JSON.stringify({ code: 0, message: 'success' }), {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' }
                }));
            }

            if (url.includes('/x/v2/reply/wbi/main/fetch')) {
                debugLog('Faked comment response for:', url);
                return Promise.resolve(new Response(JSON.stringify({
                    code: 0,
                    message: 'success',
                    data: {
                        replies: [],
                        upper: { reply_count: 0 },
                        cursor: { all_reply_count: 0 }
                    }
                }), {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' }
                }));
            }

            return originalFetch.apply(this, arguments);
        };
    })();

    // ================== 模块三：拦截 WebSocket ==================
    (() => {
        const originalWebSocket = window.WebSocket;

        window.WebSocket = function (url, protocols) {
            if (url.includes('hw-v2-web-player-tracker') || url.includes('ali-web-player-tracker')) {
                debugLog('Blocked WebSocket:', url);
                return {
                    url,
                    readyState: 3,
                    bufferedAmount: 0,
                    onopen: null,
                    onmessage: null,
                    onerror: null,
                    onclose: null,
                    close: function () { },
                    send: function () { }
                };
            }

            return new originalWebSocket(url, protocols);
        };

        window.WebSocket.prototype = originalWebSocket.prototype;
    })();

    // ================== 模块四：拦截 XMLHttpRequest ==================
    (() => {
        const originalXMLHttpRequest = window.XMLHttpRequest;
        const originalOpen = XMLHttpRequest.prototype.open;
        const originalSend = XMLHttpRequest.prototype.send;

        function shouldBlock(url) {
            return (
                url.includes('data.bilibili.com') ||
                url.includes('cm.bilibili.com') ||
                url.includes('hw-v2-web-player-tracker') ||
                url.includes('ali-web-player-tracker') ||
                url.includes('bvc.bilivideo.com')
            );
        }

        XMLHttpRequest.prototype.open = function (method, url) {
            this._url = url;
            this._blocked = shouldBlock(url);
            this._headers = {}; // 初始化请求头存储

            if (this._blocked) {
                debugLog('Intercepting XHR request to:', url);
                this._xhr = new originalXMLHttpRequest();
                this._xhr.open(method, 'data:text/plain;base64,e30='); // 空JSON对象的base64
                // 复制事件处理器
                ['onreadystatechange', 'onload', 'onerror', 'onabort', 'ontimeout'].forEach(prop => {
                    if (typeof this[prop] === 'function') {
                        this._xhr[prop] = this[prop].bind(this);
                    }
                });
                // 复制请求头
                if (this._headers) {
                    Object.entries(this._headers).forEach(([key, value]) => {
                        this._xhr.setRequestHeader(key, value);
                    });
                }
                return;
            }
            return originalOpen.apply(this, arguments);
        };

        // 缓存原始方法
        const originalMethods = {};
        ['abort', 'getAllResponseHeaders', 'getResponseHeader', 'setRequestHeader'].forEach(method => {
            originalMethods[method] = originalXMLHttpRequest.prototype[method];
        });

        // 代理其他XMLHttpRequest方法和属性
        Object.keys(originalMethods).forEach(method => {
            XMLHttpRequest.prototype[method] = function (...args) {
                if (this._blocked && this._xhr) {
                    return originalMethods[method].apply(this._xhr, args);
                }
                return originalMethods[method].apply(this, args);
            };
        });

        // 缓存原始属性描述符
        const originalDescriptors = {};
        ['readyState', 'response', 'responseText', 'responseType', 'responseURL', 'status', 'statusText'].forEach(prop => {
            originalDescriptors[prop] = Object.getOwnPropertyDescriptor(originalXMLHttpRequest.prototype, prop);
        });

        // 代理XMLHttpRequest的只读属性
        Object.keys(originalDescriptors).forEach(prop => {
            Object.defineProperty(XMLHttpRequest.prototype, prop, {
                get: function () {
                    if (this._blocked && this._xhr) {
                        return originalDescriptors[prop].get.call(this._xhr);
                    }
                    return originalDescriptors[prop].get.call(this);
                }
            });
        });

        XMLHttpRequest.prototype.send = function (body) {
            if (!this._blocked) {
                return originalSend.apply(this, arguments);
            }

            debugLog('Blocked XHR request to:', this._url);
            this._xhr.send(null);
        };
    })();
    (() => {
        document.querySelectorAll('.dynamic-avatar img').forEach(img => {
            img.src = ''; // 清空初始请求
            img.dataset.lazySrc = img.src; // 存储真实 URL

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        img.src = img.dataset.lazySrc; // 可见时加载
                        observer.unobserve(img);
                    }
                });
            }, { rootMargin: '0px 0px 200px 0px' }); // 提前 200px 加载

            observer.observe(img);
        });
    })();

})();
