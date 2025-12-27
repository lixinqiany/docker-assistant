// 复制集配置
const config = {
  _id: 'rs0',
  members: [
    { _id: 0, host: 'host.docker.internal:27018', priority: 2 },
    { _id: 1, host: 'host.docker.internal:27019', priority: 1 }
  ]
};

// 鉴权配置
const adminUser = {
  user: 'admin',
  pwd: '123456',
  roles: [ { role: 'root', db: 'admin' } ]
};

print('=== 开始 MongoDB 复制集初始化流程 ===');

// 1. 尝试初始化复制集
try {
  const status = rs.status();
  if (status.ok === 1) {
    print('√ 复制集已经初始化，跳过 init 步骤');
  } else {
    print('! 状态异常，尝试重新初始化...');
    rs.initiate(config);
  }
} catch (err) {
  print('> 检测到未初始化，正在执行 rs.initiate()...');
  try {
    const res = rs.initiate(config);
    printjson(res);
  } catch (initErr) {
    print('x 初始化失败: ' + initErr);
  }
}

// 等待成为 Primary
print('> 等待节点成为 Primary 以便创建用户...');
let isPrimary = false;
for (let i = 0; i < 30; i++) {
    const res = rs.status();
    const self = res.members.find(m => m.self);
    if (self && self.stateStr === 'PRIMARY') {
        isPrimary = true;
        print('√ 当前节点已成为 PRIMARY');
        break;
    }
    print('. 等待选举中... (' + self.stateStr + ')');
    sleep(1000);
}

if (!isPrimary) {
    print('x 错误: 30秒内未成为 Primary，无法创建用户。请手动检查集群状态。');
    quit(1);
}

// 2. 创建管理员用户
print('> 检查管理员用户...');
try {
  // 切换到 admin 库
  db = db.getSiblingDB('admin');
  
  try {
    // 尝试创建用户
    db.createUser(adminUser);
    print('√ Admin 用户创建成功！');
  } catch (err) {
    if (err.codeName === 'DuplicateUser') {
      print('√ 用户已存在，跳过创建');
    } else {
      print('! 创建用户时遇到非重复错误 (可能已开启认证): ' + err);
    }
  }
} catch (err) {
  print('x 用户操作失败: ' + err);
}

// 3. 最终验证
print('=== 最终状态验证 ===');
try {
  // 尝试用新密码认证
  const authResult = db.auth('admin', '123456');
  if (authResult) {
      print('√ 认证测试通过 (admin/123456)');
  } else {
      print('x 认证失败');
  }
} catch (err) {
    print('! 无法验证认证状态 (可能未开启认证或需要重新连接)');
}

print('=== 流程结束 ===');
print('连接字符串: mongodb://admin:123456@host.docker.internal:27018,host.docker.internal:27019/?replicaSet=rs0&authSource=admin');

