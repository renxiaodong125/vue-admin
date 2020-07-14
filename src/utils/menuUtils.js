//递归树算法 将pid-id的数据库返回的json 转为树json
export function generateMenuTree(data) {
  //对菜单进行处理
  var menudata=[]
  data.forEach(item=> {
    if(!item.routerPath){
      return
    }
    var menuItem={
      id:item.menuId,
      pid:item.parentMenu,
      path:item.routerPath,
      // 动态导入组件，用require,打包不会报错
      component:resolve => { require([`@/views${item.componentPath}`], resolve) },
      name:item.menuKey,
      meta: {
        title:item.menuName,
        noCache:item.cacheFlag === '0',
        icon:item.menuIcon,
        hidden:item.hiddenFlag === '1'
      },
      hidden:item.hiddenFlag === '1',
      menuSort:item.menuSort
    }
    menudata.push(menuItem)
  })

  // 将数据存储为 以id为KEY的map索引数据列
  var map = {};
  menudata.forEach(function (item) {
    map[item.id] = item
  })

  var val = []
  menudata.forEach(function (item) {
    // 以当前遍历项，的pid,去map对象中找到索引的id

      var parent = map[item.pid];

      // 好绕啊，如果找到索引，那么说明此项不在顶级当中,那么需要把此项添加到，他对应的父级中
      if (parent) {
        (parent.children || ( parent.children = [] )).push(item); //这里更改的是map对象的数据(索引数据)
        // console.log(map);
      } else {
        //如果没有在map中找到对应的索引ID,那么直接把 当前的item添加到 val结果集中，作为顶级
        item.redirect='noredirect'
        val.push(item);
      }

  });

  val.sort((a,b)=>{
    return a.menuSort-b.menuSort
  })
  return val
}
