$(function(){
  initBusiData();
  busiConfigEvent();
});

function busiConfigEvent(){
  $('#busi-heartbeatReq').change(function(){
      var val = $('#busi-heartbeatReq').val();
      setHeartBeatData(val);
      layer.msg('心跳参数已更新!');
  });
}

function initBusiData(){
  $('#busi-heartbeatReq').val(getHeartBeatData());
}


layui.use('table', function(){
  var table = layui.table;

  // 渲染数据
  table.render({
    elem: '#busi-config'
    ,toolbar: '#busi-toolbar'
    ,width: 900
    ,limit: 20
    ,height: 500
    ,cols: [[ 
      {field: 'name', title: '参数名', width: 200, edit:'text'}
      ,{field: 'value', title: '参数值', edit:'text'}
      ,{title:'操作', toolbar: '#busi-bar', width:150}
    ]]
    ,data: getBusiTableData()
  });

  //头工具栏事件
  table.on('toolbar(busi-config)', function(obj){
    var checkStatus = table.checkStatus(obj.config.id);
    switch(obj.event){
      case 'addRow':
        var oldData =  table.cache['busi-config'];
        if(oldData.length === 20){
          layer.msg('已达到最大行数，不能继续添加了!');
        }
        oldData.push({
          name: '',
          value: ''
        });
        table.reload('busi-config',{
          data : oldData
        });
      break;
    };
  });

  //监听行工具事件
  table.on('tool(busi-config)', function(obj){
    var data = obj.data;
    if(obj.event === 'del'){
      obj.del();
      var data =  table.cache['busi-config'];
      setBusiTableData(data);
      layer.msg('握手参数已更新!');
    }
  });

  //监听单元格编辑
  table.on('edit(busi-config)', function(obj){
    var data =  table.cache['busi-config'];
    setBusiTableData(data);
    layer.msg('握手参数已更新!');
  });
});