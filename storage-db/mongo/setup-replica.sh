#!/bin/bash
# 手动设置复制集的脚本
# 在首次启动容器后运行此脚本

echo "连接到 MongoDB 并初始化复制集..."

docker exec -it mongodb mongosh -u admin -p admin --authenticationDatabase admin --eval "
try {
  var status = rs.status();
  print('复制集已经初始化');
  print('状态: ' + status.ok);
} catch(err) {
  print('开始初始化复制集...');
  rs.initiate({
    _id: 'rs0',
    members: [
      { _id: 0, host: 'localhost:27017' }
    ]
  });
  print('复制集初始化完成！');
  print('等待几秒后检查状态...');
}
"

sleep 3

echo "检查复制集状态..."
docker exec -it mongodb mongosh -u admin -p admin --authenticationDatabase admin --eval "rs.status()"

echo "完成！"

