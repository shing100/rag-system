import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

declare module "@remix-run/node" {
  interface Future {
    v3_singleFetch: true;
  }
}

export default defineConfig({
  plugins: [
    remix({
      future: {
        v3_fetcherPersist: true,
        v3_relativeSplatPath: true,
        v3_throwAbortReason: true,
        v3_singleFetch: true,
        v3_lazyRouteDiscovery: true,
      },
    }),
    tsconfigPaths(),
  ],
  server: {
    hmr: {
      // Docker를 사용할 때 HMR이 작동하도록 설정
      host: '0.0.0.0',
      port: 5173, // HMR 웹소켓 포트
      protocol: 'ws',
    },
    watch: {
      usePolling: true // Docker 볼륨에서 파일 변경 감지를 위해
    }
  }
});
