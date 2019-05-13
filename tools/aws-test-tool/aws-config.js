layui.use('table', function(){
  var table = layui.table;
  
  // 渲染数据
  table.render({
    elem: '#aws-config'
    ,width: 1500
    ,cols: [[ 
      {field: 'name', title: '参数名', width: 200}
      ,{field: 'default', title: '默认值', width: 120}
      ,{field: 'desc', title: '描述', width: 400}
      ,{field: 'value', title: '配置', edit:'text'}
    ]]
    ,data: getAWSTableData()
  });

   //监听单元格编辑
  table.on('edit(aws-config)', function(obj){
    var data =  table.cache['aws-config'];
    setAWSTableData(data);
    layer.msg('AWS配置已更新!');
  });
});