#!/bin/bash
# 手动设置复制集的脚本
# 在首次启动容器后运行此脚本

echo "步骤 1: 初始化复制集..."

# 先不带认证连接，初始化复制集
docker exec -it mongodb mongosh --eval "
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
}
"

sleep 3

echo ""
echo "步骤 2: 创建 admin 用户..."

# 不带认证连接，创建 admin 用户
docker exec -it mongodb mongosh --eval "
try {
  // 尝试认证，检查用户是否已存在
  db.getSiblingDB('admin').auth('admin', 'admin');
  print('Admin 用户已存在，跳过创建');
} catch(err) {
  print('创建 admin 用户...');
  db.getSiblingDB('admin').createUser({
    user: 'admin',
    pwd: 'admin',
    roles: [
      { role: 'root', db: 'admin' }
    ]
  });
  print('Admin 用户创建成功！');
}


# 使用 admin 用户连接并验证
docker exec -it mongodb mongosh -u admin -p admin --authenticationDatabase admin --eval "
print('=== 复制集状态 ===');
rs.status();
"

echo "完成！"

