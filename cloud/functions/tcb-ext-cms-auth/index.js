const tcb = require("tcb-admin-node");
const serverless = require("serverless-http");
const Koa = require("koa");
const Router = require("@koa/router");
const bodyParser = require("koa-bodyparser");
const cors = require("@koa/cors");

const login = require("./routes/login");

module.exports.main = async (event, context) => {
  const app = new Koa();

  const customLoginJson = process.env.CMS_CUSTOM_LOGIN_JSON;

  // 统一错误处理
  app.use(async (ctx, next) => {
    try {
      await next();
    } catch (err) {
      const result = {
        code: err.code || "SYS_ERR",
        message: err.message,
      };
      ctx.body = result;
      ctx.app.emit("error", err, ctx);
    }
  });

  app.use(bodyParser());
  app.use(cors());

  // 注入 tcb 相关上下文对象
  app.use(async (ctx, next) => {
    const envId = context.namespace;
    let credentials;

    try {
      credentials = JSON.parse(customLoginJson);
    } catch (e) {
      throw new Error("登录异常");
    }

    ctx.state.tcbInstance = tcb.init({
      env: envId,
      credentials,
    });

    ctx.state.config = {
      envId,
      usersCollectionName: "tcb-ext-cms-users",
      loginRetryTimes: 5,
    };

    await next();
  });

  const router = new Router();

  // 登录路由
  router.post("/login", login);

  app.use(router.routes()).use(router.allowedMethods());

  const handler = serverless(app);

  const result = await handler(event, context);
  return result;
};
