"use strict";

(function(global, factory){
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.AWS = factory());
})(this,(function(){

// 类型判断
var Types = (function(){
	var types = {};

	types.get = function(val){
		var typeStrig = toString.call(val);

		return typeStrig.slice(8,typeStrig.length - 1);
	}

	types.is = function(val,type){

		return types.get(val) === type;
	}

	types.isString = function(val){

		return types.is(val,'String');
	}

	types.isNull = function(val){

		return types.is(val,'Null');
	}

	types.isNumber = function(val){

		return types.is(val,'Number');
	}

	types.isBoolean = function(val){

		return types.is(val,'Boolean');
	}

	types.isUndefined = function (val){

		return types.is(val,'Undefined');
	}

	types.isArray = function(val){

		return types.is(val,'Array');
	}

	types.isObject = function(val){

		return types.is(val,'Object');
	}

	types.isRegExp = function(val){

		return types.is(val,'RegExp');
	}

	types.isFunction = function(val){

		return types.is(val,'Function');
	}

	types.isWindow = function(val){

		return types.is(val,'Window');
	}

	types.isArguments = function(val){

		return types.is(val,'Arguments');
	}

	return types;
})();

// 断言
var Assert = { 
	isNull: function(object, message){
		if(!Types.isNull(object)){
			throw new Error(message);
		}
	},
	notNull: function(object, message){
		if(Types.isNull(object)){
			throw new Error(message);
		}
	},
	isUndefined: function(object, message){
		if(!Types.isUndefined(object)){
			throw new Error(message);
		}
	},
	notUndefined: function(object, message){
		if(Types.isUndefined(object)){
			throw new Error(message);
		}
	},
	isString: function(object, message){
		if(!Types.isString(object)){
			throw new Error(message);
		}
	},
	isObject: function(object, message){
		if(!Types.isObject(object)){
			throw new Error(message);
		}
	},
	isNullOrObject: function(object, message){
		if(!Types.isNull(object) && !Types.isObject(object)){
			throw new Error(message);
		}
	},
	isNoneOrObject: function(object, message){
		if(!Types.isNull(object) && !Types.isUndefined(object) && !Types.isObject(object)){
			throw new Error(message);
		}
	}
};

Array.prototype.insertFirst = function (item) {
  if(Types.isArray(item)){
  	for(var i = item.length - 1; i >= 0; i--){
  		this.splice(0, 0, item[i]);
  	}
  }else{
  	this.splice(0, 0, item);
  }

  return this;
};

// 日志
var Logger = function(name){

	var LEVEL = {
		all: {
			v: 0
		},
		debug: {
			v: 1,
			color: 'gray'
		},
		info: {
			v: 2,
			color: 'green'
		},
		warn: {
			v: 3,
			color: 'blue'
		},
		error: {
			v: 4,
			color: 'red'
		},
		off: {
			v: 5
		}
	};

	function out(data){
		var level = data[0];

		if(LEVEL[level].v < LEVEL[this.level].v) return;
 
		var date = new Date();
		var year = date.getFullYear();
		var month = date.getMonth() + 1;
		var day = date.getDate();
		var hour = date.getHours();
		var minute = date.getMinutes();
		var second = date.getSeconds();
		var milliSecond =  date.getMilliseconds();

		var info = '%c [Asgc Log] [' + year + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + second + '.' + milliSecond + '] [' + name + ' level:' + level + '] ';
		var params = [];
		params.push(info);
		params.push('color:' + LEVEL[level].color);
		for(var i = 1; i < data.length; i++){
			params.push(data[i]);
		}	

		console.log.apply(this,params);
	}

	return {
		/**
		 * all
		 * debug
		 * info
		 * warn
		 * error
		 * off
		 * */
		 
		level: 'all',
		setLevel: function(level){
			this.level = level;
		},
		setLevelAll: function(){
			this.level = 'all';
		},
		setLevelDebug: function(){
			this.level = 'debug';
		},
		setLevelInfo: function(){
			this.level = 'info';
		},
		setLevelWarn: function(){
			this.level = 'warn';
		},
		setLevelError: function(){
			this.level = 'error';
		},
		setLevelOff: function(){
			this.level = 'off';
		},
		debug: function(){
			var params = Array.prototype.slice.apply(arguments);
			params.insertFirst('debug');
			out.call(this,params);
		},
		info: function(){
			var params = Array.prototype.slice.apply(arguments);
			params.insertFirst('info');
			out.call(this,params);
		},
		warn: function(){
			var params = Array.prototype.slice.apply(arguments);
			params.insertFirst('warn');
			out.call(this,params);
		},
		error: function(){
			var params = Array.prototype.slice.apply(arguments);
			params.insertFirst('error');
			out.call(this,params);
		}
	};
};

// 日期格式化
function dateFormat(date,fmt) { 
	// 默认格式
	fmt = fmt ? fmt : 'yyyy-MM-dd hh:mm:ss';

    var o = { 
        "M+" : date.getMonth()+1,                 // 月份 
        "d+" : date.getDate(),                    // 日 
        "h+" : date.getHours(),                   // 小时 
        "m+" : date.getMinutes(),                 // 分 
        "s+" : date.getSeconds(),                 // 秒 
        "q+" : Math.floor((date.getMonth()+3)/3), // 季度 
        "S"  : date.getMilliseconds()             // 毫秒 
    }; 
    if(/(y+)/.test(fmt)) {
            fmt=fmt.replace(RegExp.$1, (date.getFullYear()+"").substr(4 - RegExp.$1.length)); 
    }
     for(var k in o) {
        if(new RegExp("("+ k +")").test(fmt)){
             fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));
         }
     }
    return fmt; 
}

// 随机数
function rndNum(n) {
    var rnd = "";
    for (var i = 0; i < n; i++)
        rnd += Math.floor(Math.random() * 10);
    return rnd;
}

// 填充字符串
function fillString(src,len,fill){
	var ret = src + '';

	if(!fill) return ret;

	while(ret.length < len){
		ret = fill + ret;
	}

	return ret;
}

// 自增序列
var Sequence = function(min = 0,max = 9999999999){
	var v = min;
	return {
		next: function(){
			v = v + 1;

			if(v > max){
				v = min;
			}

			return v;
		}
	};
};

// UUID
var UUID = {
	sequence: Sequence(),
	get: function(){
		return dateFormat(new Date(),'yyyyMMddhhmmss') + rndNum(10) + fillString(this.sequence.next(),8,'0');
	}
};

// WS连接
function Connection(option){
	if(!(this instanceof Connection)){
		return new Connection(option);
	}

	Assert.notNull(option, 'option must not null !');
	Assert.isNoneOrObject(option.params, 'option.params must is null or is object !');

	var ctx = this;

	ctx.logger = option.aws.logger;
	
	ctx.onopen = function(){
		ctx.serverLastMsgTime = new Date().getTime();
		// 是否已连接（连接断开时置为false）
		ctx.isOpen = true;
		// 连接标识,第一次连接成功置为true,主动断开置为false
    	// 为true时，因网络原因断开时自动重连
		ctx.connFlag = true;
		if(option.onopen) option.onopen.call(ctx);
		if(option.sendHeartBeat) ctx.sendHeartBeat();
		ctx.failedMsgResend();
	};

	ctx.onmessage = function(msg){
		ctx.serverLastMsgTime = new Date().getTime();
		if(option.onmessage) option.onmessage.call(ctx,msg.data);
	};

	ctx.onclose = function(msg){
		if(option.onclose) option.onclose.call(ctx,msg);
	};

	ctx.onerror = function(msg){
		if(option.onerror) option.onerror.call(ctx,msg);
	};

	ctx.close = function(){
		ctx.connFlag = false;
		ctx.isOpen = false;
		ctx.ws.close();
	};

	// 发送心跳包
	ctx.sendHeartBeat = function(){
		var func = function(){
			if(ctx.aws.isSendHeartBeat && option.sendHeartBeat){
				var nowTime = new Date().getTime();
            	var diff = (nowTime - ctx.serverLastMsgTime);

            	if(diff > ctx.aws.unliveTime){
		            ctx.logger.error('等待服务端心跳超时，连接已断开!');
		            ctx.isOpen = false;
	                if(ctx.aws.isReconnect){
	                    ctx.aws.autoReconnect(ctx.id);
	                }else{
	                    ctx.ws.close();
	                }
	                return;
	            }

				option.sendHeartBeat.call(ctx);

				setTimeout(function(){
	                if(ctx.isOpen){
	                    func();
	                }
	            },ctx.aws.heartBeatInterval)
			}
		};
		
		func();
	};

	// 发送消息
	ctx.send = function(msg){
		if(!ctx.isOpen){
			ctx.logger.error('msg send failed !',msg);
			if(ctx.isReconnectIng){
				if(!ctx.failedMsg){
					ctx.failedMsg = [];
				}
				ctx.failedMsg.push(msg);
				if(ctx.failedMsg.length > ctx.aws.unReconnectMsgCount){
					ctx.failedMsg = ctx.failedMsg.slice(ctx.failedMsg.length - ctx.aws.unReconnectMsgCount);
				}

				if(ctx.aws.isReconnect){
                    ctx.aws.autoReconnect(ctx.id);
                }
			}
			return;
		}

		if(Types.isString(msg)){
			ctx.ws.send(msg);
		}else if(Types.isObject(msg)){
			ctx.ws.send(JSON.stringify(msg));
		}else{
			ctx.logger.error('msg format invalid !',msg);
		}
	};

	// 失败消息重发
	ctx.failedMsgResend = function(){
		if(ctx.isFailedMsgResendIng) return;
		if(!ctx.aws.isReconnectedResend) return;
		if(ctx.aws.unReconnectMsgCount == 0) return;
		if(!ctx.failedMsg || ctx.failedMsg.length === 0) return;

		ctx.isFailedMsgResendIng = true;

		for(var i = 0; i < ctx.failedMsg.length; i++){
			ctx.logger.debug('failed msg resend',ctx.failedMsg[i]);
			ctx.send(ctx.failedMsg[i]);
		}

		ctx.failedMsg = [];
		ctx.isFailedMsgResendIng = false;
	};

	// 重新连接
	ctx.reConnection = function(){
		ctx.logger.debug('reConnection ' + ctx.id);
		ctx.ws = new WebSocket(ctx.url);
		ctx.ws.onmessage = ctx.onmessage.bind(ctx);
		ctx.ws.onclose = ctx.onclose.bind(ctx);
		ctx.ws.onerror = ctx.onerror.bind(ctx);
		ctx.ws.onopen = ctx.onopen.bind(ctx);
	};

	ctx.__proto__ = option;

	ctx.url = option.url;
	ctx.ws = new WebSocket(ctx.url);
	ctx.isReconnectIng = false;
	ctx.ws.onmessage = ctx.onmessage.bind(ctx);
	ctx.ws.onclose = ctx.onclose.bind(ctx);
	ctx.ws.onerror = ctx.onerror.bind(ctx);
	ctx.ws.onopen = ctx.onopen.bind(ctx);

}

// WS管理对象
function AWS(option){
	if(!(this instanceof AWS)){
		return new AWS(option);
	}

	Assert.notNull(option, 'option must not null !');
	Assert.isString(option.url, 'option.url must is string !');

	if(option.url.startsWith('ws://') || option.url.startsWith('wss://')){
		this.url = option.url;
	}else{
		this.url = 'ws://' + option.url;
	}

	this.name = option.name || '';

	if(option.name){
		this.logger = Logger(option.name + ' AWS');
	}else{
		this.logger = Logger('AWS');
	}

	this.__proto__ = option;

	// 是否发送心跳包
	this.isSendHeartBeat = option.isSendHeartBeat || false;
	// 心跳发送时间间隔
	this.heartBeatInterval = option.heartBeatInterval || 3000;
	// 是否开启断网自动重连
	this.isReconnect = option.isReconnect || false;
	// 被动断开连接时，重连时间间隔
	this.reconnectInterval = option.reconnectInterval || 3000;
	// 最大重连次数（-1为无限制）
	this.maxReconnectCount = option.maxReconnectCount || -1;
	// 重连成功后，是否重新发送之前发送失败的消息
	this.isReconnectedResend = option.isReconnectedResend || false;
	// 断开连接后，保留失败消息的条数
	this.unReconnectMsgCount = option.unReconnectMsgCount || 10;
	// 间隔时间内未接收到服务端心跳，断开连接
	this.unliveTime = option.unliveTime || 10000;
	// 日志级别
	this.loggerLevel = option.loggerLevel || 'all',

	this.logger.setLevel(this.loggerLevel);

	this.conn = {};

	this.openConnection = function(option = {}){
		var ctx = this;
		var logger = ctx.logger;
		var id = id = UUID.get();
		logger.debug('openConnection ' + id);
		option.aws = ctx;
		option.id = id;
		option.url = ctx.url;
		var params = option.params || {};
		if(Object.keys(params).length > 0){
			var url = ctx.url + '?';
			for(var key in params){
				url += key + '=' + params[key] + '&';
			}
			url = url.substring(0,url.length - 1);
			option.url = url;
		}
		var conn = new Connection(option);
		ctx.conn[id] = conn;
		conn.aws = ctx;
		conn.option = option;

		return conn;
	};

	this.autoReconnect = function(connId){
		var ctx = this;
		var logger = ctx.logger;
		var conn = ctx.conn[connId];
		Assert.notNull(conn, 'conn ' + connId + ' not exist!');

		if(conn.isReconnectIng){
			return;
		}

		conn.isReconnectIng = true;
		conn.reconnectCount = 0;

		var cb = function(){
			// 如果主动断开连接，则停止重连
			if(!conn.connFlag){
				logger.debug('主动断开连接，放弃重连!');
				return;
			}
			// 如果重连成功，则停止重连
			if(conn.isOpen){
				logger.debug('连接成功，停止重连!');
				conn.isReconnectIng = false;
                return;
			}
			conn.reconnectCount++;
			// 如果重连次数超过最大重连次数，则停止重连
			if(-1 != ctx.maxReconnectCount && conn.reconnectCount > ctx.maxReconnectCount){
				logger.debug('重连次数达到' + conn.reconnectCount + '次,停止重连!');
				conn.isReconnectIng = false;
                return;
			}
			
			logger.debug('第' + conn.reconnectCount + '次尝试重连');
			conn.lastReconnectTime = new Date().getTime();
			conn.reConnection();
			setTimeout(cb,ctx.reconnectInterval);
		};

		cb();
	};

}

return AWS;

}));