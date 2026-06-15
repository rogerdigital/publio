export function getWechatConfig() {
  return {
    appId: process.env.WECHAT_APP_ID || '',
    appSecret: process.env.WECHAT_APP_SECRET || '',
  };
}

export function getXhsConfig() {
  return {
    appId: process.env.XHS_APP_ID || '',
    appSecret: process.env.XHS_APP_SECRET || '',
    accessToken: process.env.XHS_ACCESS_TOKEN || '',
  };
}

export function getZhihuConfig() {
  return {
    cookie: process.env.ZHIHU_COOKIE || '',
    columnToken: process.env.ZHIHU_COLUMN_TOKEN || '',
    topicTokens: (process.env.ZHIHU_TOPIC_TOKENS || '')
      .split(',')
      .map((token) => token.trim())
      .filter(Boolean),
  };
}

export function getXConfig() {
  return {
    apiKey: process.env.X_API_KEY || '',
    apiSecret: process.env.X_API_SECRET || '',
    accessToken: process.env.X_ACCESS_TOKEN || '',
    accessTokenSecret: process.env.X_ACCESS_TOKEN_SECRET || '',
  };
}

export function getSiteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
}
