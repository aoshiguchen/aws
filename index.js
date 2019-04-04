// 冯赛 http://192.168.88.61:3000/wechat-manage/session
/**
 * 联络易websocket工具
 */
const Websocket = {
    // 日志前缀
    logPrefix: 'websocket ',
    // MTYPE与回调之间的映射
    onMessageMap: {},
    // 心跳时间间隔（毫秒）
    heartBeatInterval: 3000,
    // 是否开启断网自动重连
    isReconnect: true,
    // 被动断开连接时，重连时间间隔
    reconnectInterval: 3000,
    // 最大重连次数
    maxReconnectCount: 10,
    // 重连次数
    reconnectCount: 0,
    // 最后一次重连时间
    lastReconnectTime: null,
    // 是否正在重连,防止多个重连操作同时进行
    isReconnectIng: false,
    // 重连成功后，是否重新发送之前发送失败的消息
    isReconnectedResend: true,
    // 断开连接后，保留失败消息的条数
    unReconnectMsgCount: 5,
    // 断开连接后保留的失败消息
    unReconnectMsg: [],
    // 是否正在发送失败消息（防止重发）
    isReconnectedResendIng: false,
    // 最后一次接收到服务端心跳的时间戳
    serverLastHeartBeat: undefined,
    // 间隔时间内未接收到服务端心跳，断开连接
    unliveTime: 10000,
    // 是否支持多个回调
    isMutiCallback: false,
    baseUrl: 'localhost:8082',
    // 连接标识,第一次连接成功置为true,主动断开置为false
    // 为true时，因网络原因断开时自动重连
    connFlag: false,
    init: function(token,adminUserId,callback){
        var ctx = this;

        ctx.isOpen = false;
        ctx.adminUserId = adminUserId;
        ctx.callback = callback;
        ctx.ws = new WebSocket('ws://' + ctx.baseUrl + '?_token=' + token);
        ctx.ws.onmessage = ctx.onmessage.bind(ctx);
        ctx.ws.onclose = ctx.onclose.bind(ctx);
        ctx.ws.onerror = ctx.onerror.bind(ctx);
        ctx.ws.onopen = function(msg){
            ctx.isOpen = true;
            ctx.connFlag = true;
            if(callback){
                callback(msg);
            }
            ctx.onopen(msg);
        };
    },
    // 接收服务端消息的入口
    onmessage: function(msg){
        var ctx = this;
        console.log(ctx.logPrefix + 'msg:',msg);
        var data = JSON.parse(msg.data);
        ctx.invoke(data);
    },
    // 根据mType调用回调
    invoke: function(msg){
        if(!msg) return;
        var mType = msg.MTYPE;
        var ctx = this;
        if(ctx.onMessageMap[mType]){
            if(ctx.msgMap[mType]) msg = ctx.msgMap[mType](msg);
            for(var callback of ctx.onMessageMap[mType]){
                callback(msg);
            }
        }
    },
    //消息映射
    msgMap: {
        parseXML: function(xml){
           /* 把xml字符串解析成
           * */
           let xmlDoc;
           if (window.DOMParser) {
             xmlDoc = new DOMParser().parseFromString(xml,'text/xml');
           }else {
            xmlDoc=new ActiveXObject('Microsoft.XMLDOM');
            xmlDoc.async = 'false';
            xmlDoc.loadXML(xml);
          }
          return xmlDoc
        },
        parseVoice: function(xml){
            var ele = this.parseXML(xml).getElementsByTagName("voicemsg")[0];

            return {
                length: ele.getAttribute("length"),
                voiceLength: ele.getAttribute("voicelength"),
                bufid: ele.getAttribute("bufid")
            };
        },
        llyToShcrm: function(msg){
            if(!msg) return msg;
            if(msg.MTYPE != 'receiveMessage' && msg.MTYPE != 'roomMsg') return msg;

            var tmpMsg = {};
            tmpMsg.MTYPE = msg.MTYPE;


            if('1' == msg.msgType){
                //文本消息
                if('5' == msg.msg_type){
                    //微信端
                    tmpMsg.content = msg.content;
                }else{
                    //平台端
                    tmpMsg.content = msg.content;
                }
                tmpMsg.msgType = 1;
            }else if('34' == msg.msgType){
                //语音消息
                var parseJson = this.parseVoice(msg.content);
                tmpMsg.content = {
                    ...parseJson,
                    url: msg.url
                };
                tmpMsg.msgType = 4;
            }else if('47' == msg.msgType && '5' == msg_type){
                //微信端-表情图片
                tmpMsg.content = {
                    description: msg.description,
                    url: msg.url
                };
                tmpMsg.msgType = 2;
            }else if('3' == msg.msgType){
                //图片消息
                if('5' == msg.msg_type){
                    //微信端
                    tmpMsg.content = {
                        description: msg.description,
                        url: msg.url
                    };
                }else{
                    //平台端
                    tmpMsg.content = {
                        url: msg.url
                    };
                }
                tmpMsg.msgType = 2;
            }else{
                //未知消息类型
                tmpMsg.content = {
                    description: '未知的消息类型'
                };
                tmpMsg.msgType = 0;
            }

            tmpMsg.room = msg.MTYPE === 'roomMsg';
            tmpMsg.fromWxUserName = msg.fromUserName;
            tmpMsg.toWxUserName = msg.toUserName;
            tmpMsg.fromMemberWxUserName = msg.fromMemberUserName;
            tmpMsg.fromMemberWxNickName = msg.fromMemberNickName;
            tmpMsg.msgId = msg.msgId;
            tmpMsg.uin = msg.uin;
            tmpMsg.tokenId = msg.tokenId;
            tmpMsg.createTime = msg.createTime;

            tmpMsg.userId = msg.userId;
            tmpMsg.userName = msg.userName;
            tmpMsg.isRead = 0;
            tmpMsg.id = msg.id;

            return tmpMsg;
        },
        receiveMessage: function(msg){
            return this.llyToShcrm(msg);
        },
        roomMsg: function(msg){
            return this.llyToShcrm(msg);
        }
    },
    // socket连接成功时执行
    onopen: function(msg){
        var ctx = this;
        console.log(ctx.logPrefix + 'open:',msg);
        ctx.ping();
        ctx.login();

        ctx.on('getcontact',function(msg){
            ctx.onGetContact(msg);
        });

        ctx.on('heartBeat',function(msg){
            ctx.onHeartBeat(msg);
        });

        ctx.heartBeat();

        ctx.reconnectedResend();
    },
    // socket连接关闭时执行
    onclose: function(msg){
        var ctx = this;
        ctx.isOpen = false;
        console.log(ctx.logPrefix + 'close:',msg);
    },
    // socket连接异常时执行
    onerror: function(msg){
        var ctx = this;
        console.error(ctx.logPrefix + 'error:',msg);
    },
    // 重连成功后发送消息
    reconnectedResend: function(){
        var ctx = this;
        if(ctx.isReconnectedResendIng) return;
        if(!ctx.isReconnectedResend) return;
        if(ctx.unReconnectMsgCount === 0) return;
        if(!ctx.unReconnectMsg || ctx.unReconnectMsg.length === 0) return;

        ctx.isReconnectedResendIng = true;

        for(var i = 0; i < ctx.unReconnectMsgCount; i++){
            console.log(ctx.logPrefix + '重发消息:',ctx.unReconnectMsg[i]);
            ctx.send(ctx.unReconnectMsg[i]);
        }
        ctx.unReconnectMsg = [];
        ctx.isReconnectedResendIng = false;
    },
    // 重新连接
    autoReconnect: function(){
        var ctx = this;

        if(ctx.isReconnectIng){
            return;
        }
        ctx.isReconnectIng = true;

        ctx.reconnectCount = 0;
        var cb = function(){
            // 如果主动断开连接，则停止重连
            if(!ctx.connFlag){
                console.log(ctx.logPrefix + '主动断开连接，放弃重连');
                return;
            }

            // 如果重连成功，则停止重连
            if(ctx.isOpen){
                console.log(ctx.logPrefix + '连接成功，停止重连');
                ctx.isReconnectIng = false;
                return;
            }

            ctx.reconnectCount++;

            // 如果重连次数超过最大重连次数，则停止重连
            if(ctx.reconnectCount > ctx.maxReconnectCount){
                console.error(ctx.logPrefix + '重连次数达到' + ctx.maxReconnectCount + '次,停止重连');
                ctx.isReconnectIng = false;
                return;
            }
            
            console.log(ctx.logPrefix + '第' + ctx.reconnectCount + '次尝试重连');
            ctx.lastReconnectTime = new Date().getTime();
            ctx.init(ctx.adminUserId,ctx.callback);

            setTimeout(cb,ctx.reconnectInterval);
        };

        cb();
        
    },
    // 向服务端发送消息的基本入口
    send: function(msg){
        var ctx = this; 
        if(!ctx.isOpen){
            console.error(ctx.logPrefix + '尚未连接!');
            //如果支持断网重连，则保留断网时发送的消息，在重连成功后自动发出
            if(ctx.isReconnect){
                ctx.unReconnectMsg.push(msg);
                if(ctx.unReconnectMsg.length > ctx.unReconnectMsgCount){
                    ctx.unReconnectMsg = ctx.unReconnectMsg.slice(ctx.unReconnectMsg.length - ctx.unReconnectMsgCount);
                }

                ctx.autoReconnect();
            }
            return;
        }

        msg.loginer = ctx.adminUserId;
        //新增判断  只在ws是连接状态 发送信息 9-20 12:32
        if(ctx.ws.readyState===1){
          ctx.ws.send(JSON.stringify(msg));
        }
        console.log(ctx.logPrefix + 'send msg:',msg);
    },
    on: function(mType,callback){
        var ctx = this;
        if(!ctx.onMessageMap[mType]) ctx.onMessageMap[mType] = [];
        if(ctx.isMutiCallback){
            ctx.onMessageMap[mType].push(callback);
        }else{
            ctx.onMessageMap[mType] = [callback];
        }
        
    },
    ping: function(){
        var ctx = this;
        ctx.send({
            'MTYPE': 'ping'
        });
    },
    login: function(){
        var ctx = this;
        ctx.send({
            'MTYPE': 'login'
        });
    },
    close: function(){
        var ctx = this;
        ctx.connFlag = false;
        ctx.ws.close();
    },
    // 心跳
    heartBeat: function(){
        var ctx = this;
        var func = function(){
            var nowTime = new Date().getTime();
            var diff = (nowTime - ctx.serverLastHeartBeat);
            if(diff > ctx.unliveTime){
                console.error(ctx.logPrefix + '等待服务端心跳超时，连接已断开!');
                ctx.isOpen = false;
                if(ctx.isReconnect){
                    ctx.autoReconnect();
                }else{
                    ctx.ws.close();
                }
                return;
            }

            ctx.send({
                'MTYPE': 'heartBeat'
            });

            setTimeout(function(){
                if(ctx.isOpen){
                    func();
                }
            },ctx.heartBeatInterval)
        };

        func();
    },
    // 接收到服务端心跳
    onHeartBeat: function(msg){
        var ctx = this;
        ctx.serverLastHeartBeat = new Date().getTime();
    },
    // 接收服务端发送的好友列表
    // 将好友列表分成普通好友列表、群聊列表
    onGetContact: function(msg){
        var ctx = this;
        var onFriendList = {
            MTYPE: 'onFriendList',
            code: 1,
            result: [],
            nickName: msg.nickName,
            uin: msg.uin,
            wechatUserName: msg.wechatUserName,
            wechatUserUin: msg.wechatUserUin
        };

        var onGroupList = {
            MTYPE: 'onGroupList',
            code: 1,
            result: [],
            nickName: msg.nickName,
            uin: msg.uin,
            wechatUserName: msg.wechatUserName,
            wechatUserUin: msg.wechatUserUin
        };

        if(!!msg.contact && msg.contact.length > 0){
            for(var item of msg.contact){
                if(!!item.seq && item.seq.endsWith('@chatroom')){
                    //群聊
                    onGroupList.result.push(item);
                }else if(msg.uin != item.uin){
                    //普通好友
                    onFriendList.result.push(item);
                }
            }
        }

        ctx.invoke(onFriendList);
        ctx.invoke(onGroupList);
    },
    // 获取二维码
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
    sendTextMsg: function(msg){
        var ctx = this;
        var data = {
            '@class': 'cn.xmlly.chat.message.domain.Message',
            'MTYPE': 'sendMessage',
            'content': msg.content,
            'fromUserName': msg.from,
            'msgType': 1,
            'toUserName': msg.to,
            'tokenId': 'sendMsg-' + new Date().getTime(),
            'uin': msg.uin
        };

        ctx.send(data);
    },
    sendFileMsg: function(msg){
        var ctx = this;
        var data = {
            'MTYPE': 'sendMessage',
            'fromUserName': msg.from,
            'msgType': 49,
            'toUserName': msg.to,
            'tokenId': 'sendFile-' + new Date().getTime(),
            'uin': msg.uin,
            'description': '请点击打开文档',
            'content': msg.content
        };

        ctx.send(data);
    },
    modifyName: function(msg){
        var ctx = this;
        var data = {
            '@class': 'java.util.Map',
            'MTYPE': 'modifyName',
            'uin': msg.uin,
            'userName': msg.userName,
            'newRemarkName': msg.newRemarkName
        };

        ctx.send(data);
    },
    logout: function(msg){
        var ctx = this;
        var data = {
            '@class': 'java.util.Map',
            'MTYPE': 'logout',
            'uin': msg.uin
        };
        ctx.send(data);
    },
    unreadMsg: function(){
        var ctx = this;
        var data = {
            '@class': 'java.util.Map',
            'MTYPE': 'unreadMsg'
        };

        ctx.send(data);
    },
    openReply: function(){
        var ctx = this;
        var data = {
            MTYPE: 'SHCRM',
            op: 'openReply'
        };

        ctx.send(data);
    },
    closeReply: function(){
        var ctx = this;
        var data = {
            MTYPE: 'SHCRM',
            op: 'closeReply'
        };

        ctx.send(data);
    },
    getReplyUser: function(){
        var ctx = this;
        var data = {
            MTYPE: 'SHCRM',
            op: 'getReplyUser'
        };

        ctx.send(data);
    },
    deleteWechat: function(uin){
        var ctx = this;
        var data = {
            MTYPE: 'SHCRM',
            op: 'deleteWechat',
            data: {
                uin: uin
            }
        };

        ctx.send(data);
    },
    getOnlineUserList: function(){
        var ctx = this;
        var data = {
            MTYPE: 'SHCRM',
            op: 'getOnlineUserList'
        };

        ctx.send(data);
    },
    intoReplyStatus: function(uin,contactUserName){
        var ctx = this;
        var data = {
            MTYPE: 'SHCRM',
            op: 'intoReplyStatus',
            data: {
                uin: uin,
                contactUserName: contactUserName
            }
        };

        ctx.send(data);
    },
    cancelReplyStatus: function(uin,contactUserName){
        var ctx = this;
        var data = {
            MTYPE: 'SHCRM',
            op: 'cancelReplyStatus',
            data: {
                uin: uin,
                contactUserName: contactUserName
            }
        };

        ctx.send(data);
    },
    getContactReplyStatus: function(uin,contactUserName){
        var ctx = this;
        var data = {
            MTYPE: 'SHCRM',
            op: 'getContactReplyStatus',
            data: {
                uin: uin,
                contactUserName: contactUserName
            }
        };

        ctx.send(data);
    },
    getWxReplyStatus: function(uin){
        var ctx = this;
        var data = {
            MTYPE: 'SHCRM',
            op: 'getWxReplyStatus',
            data: {
                uin: uin
            }
        };

        ctx.send(data);
    },
    cleanUnReadMsgCount: function(uin,contactUserName){
        var ctx = this;
        var data = {
            MTYPE: 'SHCRM',
            op: 'cleanUnReadMsgCount',
            data: {
                uin: uin,
                contactUserName: contactUserName
            }
        };

        ctx.send(data);
    },
};

var data = {};
function getNickNameByUserName(userName){
    for(var friend of data.friendList){
        if(friend.wechatUserName === userName){
            return friend.nickName;
        }
    }
}

Websocket.on('qrCode',function(msg){
    console.log('刷新二维码1',msg);
});

Websocket.on('onFriendList',function(msg){
    console.log('好友列表',msg);
    data.friendList = msg.result;
});

Websocket.on('onGroupList',function(msg){
    console.log('群聊列表',msg);
    data.groupList = msg.result;
});

Websocket.on('receiveMessage',function(msg){
    console.log('私聊消息',msg);
});

Websocket.on('roomMsg',function(msg){
    console.log('群聊消息',msg);
    var nickName = getNickNameByUserName(msg.fromUserName);
    console.log(nickName,msg.content);
    Websocket.sendTextMsg({
        uin: '2103630261',
        from: 'wxid_sd73ohjn7c2m21',
        to: '11303075408@chatroom',
        content: '1122\u1f60f'
    });
});

Websocket.on('logout',function(msg){
    console.log('账号下线',msg.uin);
});

Websocket.on('login',function(msg){
    console.log('登陆成功',msg);
    data.userInfo = msg.result[0];
});


Websocket.init('fff633cd15ce4b95a3237365cd10c820',189,function(){

	Websocket.qrCode();

});

