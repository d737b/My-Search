// Cloudflare Worker — Notion API Proxy
// 部署方式：貼到 workers.cloudflare.com 的編輯器

export default {
  async fetch(request, env) {
    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, Notion-Version',
        },
      });
    }

    const url = new URL(request.url);
    // 把 /notion/* 轉發到 api.notion.com/*
    const notionPath = url.pathname.replace(/^\/notion/, '');
    const notionUrl = `https://api.notion.com${notionPath}${url.search}`;

    const headers = new Headers(request.headers);
    headers.set('Notion-Version', '2022-06-28');

    const notionResp = await fetch(notionUrl, {
      method: request.method,
      headers,
      body: request.method !== 'GET' ? request.body : undefined,
    });

    const respBody = await notionResp.text();

    return new Response(respBody, {
      status: notionResp.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  },
};
