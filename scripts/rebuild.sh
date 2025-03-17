#!/bin/bash

# 서비스 이름을 인자로 받음
service_name=$1

# 인자가 없으면 모든 서비스 재빌드
if [ -z "$service_name" ]; then
  echo "모든 서비스를 재빌드합니다."
  docker compose build
  docker compose up -d
else
  echo "${service_name} 서비스를 재빌드합니다."
  docker compose build ${service_name}
  docker compose up -d ${service_name}
fi

echo "재빌드 완료되었습니다."
