layui.use('table', function(){
  var table = layui.table;

  // 渲染数据
  table.render({
    elem: '#msg-template-config'
    ,width: 900
    ,limit: 20
    ,height: 500
    ,cols: [[ 
      {field: 'name', title: '模板名', width: 200}
      ,{field: 'data', title: '消息内容'}
    ]]
    ,data: getMsgTempLateData()
  });
});