import { Request, Response, NextFunction } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import logger from '../utils/logger';

export const createServiceProxy = (serviceName: string, serviceUrl: string) => {
  logger.info(`Creating proxy for ${serviceName} at ${serviceUrl}`);
  
  return createProxyMiddleware({
    target: serviceUrl,
    changeOrigin: true,
    pathRewrite: (path, req) => {
      // /api/auth/login -> /auth/login
      const newPath = path.replace(/^\/api/, '');
      logger.debug(`Proxying ${path} to ${newPath}`);
      return newPath;
    },
    onProxyReq: (proxyReq, req, res) => {
      logger.debug(`Proxying request to ${serviceName}: ${req.method} ${req.path}`);
      
      // 원본 IP 전달
      if (req.ip) {
        proxyReq.setHeader('X-Forwarded-For', req.ip);
      }
      
      // 사용자 정보 전달 (인증된 경우)
      if (req.user) {
        proxyReq.setHeader('X-User-Id', req.user.id);
        proxyReq.setHeader('X-User-Email', req.user.email);
      }
    },
    onError: (err, req, res) => {
      logger.error(`Proxy error for ${serviceName}`, { error: err });
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        message: `서비스 연결 중 오류가 발생했습니다: ${serviceName}` 
      }));
    }
  });
};
