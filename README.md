### Storage-db
该目录旨在快速使用 `docker compose up -d` 拉起数据库存储服务，包含了mongodb和redis。

mongodb需要特别关心，设置了复制集和安全验证。再conf设置security的情况下一定要带一个keyfile启动，windows可以使用`openssl rand -base64 756 | Out-File -Encoding ASCII mongodb-keyfile`生成。由于使用自定义的command脚本启动，覆盖了mongo的entrypoint脚本，所以通过环境变量设置用户无效，因此拉起之后需要手动进入容器内部初始化。
1. 初始化复制集，member的host要写当前节点的ip和port，便于外部连接
2. 然后admin超级管理员用户

完成以上步骤后，方可正常使用