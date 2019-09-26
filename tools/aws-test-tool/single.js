// 单连接测试数据
var singleData = {};

$(function(){
  initSingleData();
  initSingleEvent();
});

function initSingleEvent(){
  $('#single-open').click(function(){
    singleOpen();
  });
  $('#single-close').click(function(){
    setStatus(false);
    singleClose();
  });
  $('#single-send').click(function(){
    singleSend();
  });
}

function setStatus(isOpen){
    singleData.isOpen = isOpen;
    setDisabled('single-open',isOpen);
    setDisabled('single-close',!isOpen);
    setDisabled('single-send',!isOpen);
}

function initSingleData(){
  var obj = $('#msg-template-select');
  var html = '';
  for(var item of Cache.msgTemplate){
    html += '<option';
    html += ' value="' + item.data + '">';
    html += item.name;
    html += '</option>'
  }
  obj.html(html);
}

function singleOpen(){
  singleData.aws = new AWS(Cache.awsConfig);

  // 打开WS连接
  singleData.conn = singleData.aws.openConnection({
    // WS握手参数
    params: Cache.busiConfig.handshake,
    // WS连接成功时执行
    onopen: function(){
      setStatus(true);
      this.logger.debug('onopen');
    },
    // WS收到消息时执行
    onmessage: function(data){
      var msg = JSON.parse(data);
      this.logger.debug('onmessage:',msg);
    },
    // WS关闭时执行
    onclose: function(msg){
      setStatus(false);
      this.logger.debug('onclose:',msg);
    },
    // WS异常时执行
    onerror: function(msg){
      this.logger.debug('onerror:',msg);
    },
    // 发送心跳，isSendHeartBeat为true时生效
    sendHeartBeat: function(){
      this.send(Cache.busiConfig.heartBeat);
    },
    
  });
} 

function singleClose(){
  singleData.conn.close();
}

function singleSend(){
  if(!singleData.isOpen) return;
  var msg = $('#single-msg').val();
  singleData.conn.send(msg);
}

function setDisabled(id,disabled){
  var obj = $('#' + id);
  if(!obj) return;
  if(disabled){
    obj.attr('class','layui-btn layui-btn-primary');
  }else{
    obj.attr('class','layui-btn');
  }
  obj.attr('disabled',disabled);
}

layui.use(['layer', 'jquery', 'form'], function () {
  var layer = layui.layer,
      $ = layui.jquery,
      form = layui.form;

  form.on('select(msg-template-select)', function(data){
    var val = $('#msg-template-select').val();
    eval('val = ' + val);
    $('#single-msg').val(JSON.stringify(val,null,4));
  });
});
