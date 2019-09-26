var Cache = {
	awsConfig: {
		// 【可选】【默认：''】连接名，描述信息，用于多个WS连接时日志区分
		name: 'SCRM-UAT',
		// 【必填】WS连接地址
		// url: 'ws://api.scrm.dev.laoganma.fun:8082',
		url: 'ws://api.scrm.uat.laoganma.fun:8082',
		// 【可选】【默认：false】是否发送心跳包
		isSendHeartBeat: true,
		// 【可选】【默认：3000】心跳发送时间间隔
		heartBeatInterval: 5000,
		// 【可选】【默认：false】是否开启断网自动重连
		isReconnect: true,
		// 【可选】【默认：3000】被动断开连接时，重连时间间隔
		reconnectInterval: 3000, 
		// 【可选】【默认：-1】最大重连次数（-1为无限制）
		maxReconnectCount: 10,
		// 【可选】【默认：false】重连成功后，是否重新发送之前发送失败的消息
		isReconnectedResend: false,
		// 【可选】【默认：10】断开连接后，保留失败消息的条数
		unReconnectMsgCount: 10,
		// 【可选】【默认：10000】间隔时间内未接收到服务端心跳，断开连接
		unliveTime: 15000,
		// 【可选】【默认：all】日志级别
		loggerLevel: 'debug' 
	},
  busiConfig: {
    handshake: {
      _token: '40608cb84f2c4905880689e5693c3ff0',
      _mtId: '624',
      _ut: '1',
      _uid: '1167'
    },
    heartBeat: {
      type: 'heartbeatReq'
    }
  },
  msgTemplate: [{
    name: '获取微信号列表',
    data: "{type: 'getWeChatsReq'}"
  },{
    name: '获取微信好友列表',
    data: "{type: 'getFriendsReq',body: {weChatId: 'wxid_d47cc0zvu26622'}}"
  },{
    name: '发送文本消息',
    data: "{type: 'sendWeChatMsgReq',body: {weChatId: 'wxid_d47cc0zvu26622',friendId: 'wxid_vs2hq03nf5o422',msgType: 1,content: 'hello001',msgId: new Date().getTime()}}"
  },{
    name: '发送图片消息',
    data: "{type: 'sendWeChatMsgReq',body: { weChatId: 'wxid_d47cc0zvu26622',friendId: 'wxid_vs2hq03nf5o422',msgType: 2,content: 'https://ss3.baidu.com/-rVXeDTa2gU2pMbgoY3K/it/u=2492331056,4193866086&fm=202&mola=new&crop=v1',msgId: new Date().getTime()}}"
  },{
    name: '发送文件消息',
    data: "{type: 'sendWeChatMsgReq',body: {weChatId: 'wxid_d47cc0zvu26622',friendId: 'wxid_vs2hq03nf5o422',msgType: 8,content: 'https://medcloud.oss-cn-shanghai.aliyuncs.com/his/produce/MHDIxzsD33DDMLuCwv.txt', msgId: new Date().getTime()}}"
  }]
};

function getMsgTempLateData(){
  return Cache.msgTemplate;
}

function getBusiTableData(){
  var data = [];
  for(var key in Cache.busiConfig.handshake){
    data.push({
      name: key,
      value: Cache.busiConfig.handshake[key]
    })
  }
  return data;
}

function setBusiTableData(data){
  if(!data) return;
  Cache.busiConfig.handshake = {};
  for(var item of data){
    if(item && item.name){
      Cache.busiConfig.handshake[item.name] = item.value;
    }
  }
}

function getHeartBeatData(){
  return JSON.stringify(Cache.busiConfig.heartBeat,null,4);
}

function setHeartBeatData(data){
  Cache.busiConfig.heartBeat = data;
}

function getAWSTableData(){
	var data = [{ 
      name: 'name',
      default: '2',
      desc: '连接名',
    },{
      name: 'url',
      default: '-',
      desc: '连接url'
    },{ 
      name: 'isSendHeartBeat',
      default: 'false',
      desc: '是否发送心跳包',
    },{ 
      name: 'heartBeatInterval',
      default: '3000',
      desc: '心跳发送时间间隔（毫秒）',
    },{ 
      name: 'isReconnect',
      default: 'false',
      desc: '是否开启断网自动重连',
    },{ 
      name: 'reconnectInterval',
      default: '3000',
      desc: '重连时间间隔（毫秒）',
    },{ 
      name: 'maxReconnectCount',
      default: '-1',
      desc: '最大重连次数（-1为无限制）',
    },{ 
      name: 'isReconnectedResend',
      default: 'false',
      desc: '重连成功后，是否重新发送之前发送失败的消息',
    },{ 
      name: 'unReconnectMsgCount',
      default: '10',
      desc: '断开连接后，保留失败消息的条数',
    },{ 
      name: 'unliveTime',
      default: '10000',
      desc: '间隔时间内未接收到服务端心跳，断开连接（毫秒）',
    },{ 
      name: 'loggerLevel',
      default: 'all',
      desc: '日志级别',
    }];

    var awsConfig = Cache.awsConfig;
    for(var item of data){
    	item.value = awsConfig[item.name];
    }

    return data;
}

function setAWSTableData(data){
	var awsConfig = Cache.awsConfig;
	for(var item of data){
		awsConfig[item.name] = item.value;
	}
}