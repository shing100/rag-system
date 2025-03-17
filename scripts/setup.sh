#!/bin/bash

# 환경 변수 파일 생성
cp frontend/.env.example frontend/.env
cp backend/api-gateway/.env.example backend/api-gateway/.env
cp backend/rag-service/.env.example backend/rag-service/.env

# 도커 컨테이너 빌드 및 실행
docker-compose build
docker-compose up -d

echo "개발 환경이 성공적으로 설정되었습니다."
echo "프론트엔드: http://localhost:3010"
echo "API 게이트웨이: http://localhost:4010"
echo "PostgreSQL: localhost:5432"
echo "OpenSearch: http://localhost:9200"
echo "MinIO 콘솔: http://localhost:9001"
