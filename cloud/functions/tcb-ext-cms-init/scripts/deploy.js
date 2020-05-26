const util = require("util");
const exec = util.promisify(require("child_process").exec);
const fs = require("fs");
const path = require("path");
const writeFile = util.promisify(fs.writeFile);

module.exports = {
  // 部署静态资源
  async deployStatic(context) {
    const { config, deployPath, manager } = context;
    const filterdDeployPath = deployPath.replace(/^\//, "");
    const { envId } = config;
    try {
      await exec("cp -r build /tmp");
    } catch (e) {}

    // 写入静态网站配置
    await writeConfigJSON(manager, envId, filterdDeployPath);
    // 同步静态网站
    return deployHostingFile(manager, "/tmp/build", filterdDeployPath);
  },
};

// 写入配置信息
async function writeConfigJSON(manager, envId, dir) {
  await writeFile(
    "/tmp/config.json",
    JSON.stringify({
      envId,
    })
  );

  return deployHostingFile(
    manager,
    "/tmp/config.json",
    path.join(dir, "config.json")
  );
}

// 部署 Hosting 文件
async function deployHostingFile(manager, srcPath, cloudPath) {
  return manager.hosting.uploadFiles({
    localPath: srcPath,
    cloudPath: cloudPath,
    ignore: [".DS_Store"],
  });
}
