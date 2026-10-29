import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 모든 화면이 클라이언트에서 그려지고 데이터는 백엔드 API에서 받으므로 Node 서버 없이 정적 파일로 배포한다.
  output: "export",
  // /diary → /diary/index.html처럼 폴더로 만들어 정적 호스팅에서 그대로 열리게 한다.
  trailingSlash: true,
  allowedDevOrigins: ["10.150.149.46"],
};

export default nextConfig;
