// 示例
var aws = new AWS({
	// 【可选】【默认：''】连接名，描述信息，用于多个WS连接时日志区分
	name: 'SCRM-DEV',
	// 【必填】WS连接地址
	url: 'ws://api.scrm.dev.laoganma.fun:8082',
	// 【可选】【默认：false】是否发送心跳包
	isSendHeartBeat: true,
	// 【可选】【默认：3000】心跳发送时间间隔
	heartBeatInterval: 3000,
	// 【可选】【默认：false】是否开启断网自动重连
	isReconnect: true,
	// 【可选】【默认：3000】被动断开连接时，重连时间间隔
	reconnectInterval: 3000, 
	// 【可选】【默认：-1】最大重连次数（-1为无限制）
	maxReconnectCount: 9999,
	// 【可选】【默认：false】重连成功后，是否重新发送之前发送失败的消息
	isReconnectedResend: false,
	// 【可选】【默认：10】断开连接后，保留失败消息的条数
	unReconnectMsgCount: 10,
	// 【可选】【默认：10000】间隔时间内未接收到服务端心跳，断开连接
	unliveTime: 10000,
	// 【可选】【默认：all】日志级别
	loggerLevel: 'debug'
});

// AsgcJs弹框显示二维码，与AWS无关
function showImageByBase64(base64){
    Asgc.UI.htmlPage({
        title:'二维码',
        width: '200px',
        height: '250px',
        minMenu: 'available',
        maxMenu:'available',
        closeMenu: 'available',
        htmlContent: '<img width="200px" height="200px" src="data:image/png;base64,' + base64 + '">',
        resizable: true,
        shade: false,
        icon: 'img/Aim_128px_1134223_easyicon.net.png',
        onClose: function(){
            log.info('页面已关闭');
        }
    });
}

// 打开WS连接
aws.openConnection({
	// WS握手参数
	params: {
		_token: '35f4a1ca04994f42840046bf07f0360e',
		_mtId: 202,
		_ut: 1,
		_uid: 157
	},
	// WS连接成功时执行
	onopen: function(){
		this.logger.debug('onopen');
		this.ping();
		this.login();
		this.qrCode();
	},
	// WS收到消息时执行
	onmessage: function(data){
		var msg = JSON.parse(data);
		this.logger.debug('onmessage:',msg);
		var mType = msg.MTYPE;
		if(this.on[mType]){
			this.on[mType].call(this,msg);
		}
	},
	// WS关闭时执行
	onclose: function(msg){
		this.logger.debug('onclose:',msg);
	},
	// WS异常时执行
	onerror: function(msg){
		this.logger.debug('onerror:',msg);
	},
	// 发送心跳，isSendHeartBeat为true时生效
	sendHeartBeat: function(){
		this.send({
			MTYPE: 'heartBeat'
		});
	},
	// ping消息
	ping: function(){
		this.send({
            'MTYPE': 'ping'
        });
	},
	// 登陆联络易账号，获取微信列表
	login: function(){
		this.send({
            'MTYPE': 'login'
        });
	},
	// 获取微信登陆二维码
	qrCode: function(options){
		var ctx = this;
        var data = {
            '@class': 'java.util.Map',
            'MTYPE': 'qrCode'
        };

        if(options && options.uin){
            data.uin = options.uin;
        }

        if(options && options.userName){
            data.userName = options.userName;
        }

        ctx.send(data);
	},
	on: {
		login: function(msg){
			console.log('微信账号列表:',msg);
		},
		getcontact: function(msg){
			console.log('微信通讯录:',msg);
		},
		qrCode: function(msg){
			console.log('微信登陆二维码',msg);
			showImageByBase64(msg.qrCode);
		}
	}
	
});