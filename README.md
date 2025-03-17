# RAG 시스템 (Retrieval-Augmented Generation)

이 프로젝트는 문서 기반 질의응답을 위한 RAG(Retrieval-Augmented Generation) 시스템을 구현합니다.

## 개발 진행 상황

### 1. 개발 환경 구성 (완료)
- Docker Compose 기반 개발 환경 구성
- 서비스별 컨테이너 설정
- 데이터베이스, 캐시, 검색 엔진 등 인프라 구성

### 2. 인증 시스템 (구현 중)
- 사용자 인증 기능 (회원가입, 로그인)
- JWT 인증 시스템
- 인증 미들웨어

### 3. 프로젝트 관리 (구현 중)
- 프로젝트 CRUD 기능
- 프로젝트 멤버십 관리
- 프로젝트 메타데이터 관리

### 4. 문서 관리 (예정)
- 문서 업로드 및 저장
- 문서 메타데이터 관리
- 문서 버전 관리

### 5. RAG 핵심 기능 (예정)
- 문서 처리 및 청킹
- 임베딩 생성
- 벡터 검색
- 질의응답 생성

## 시스템 아키텍처

### 마이크로서비스 구조
- **프론트엔드**: Remix + Tailwind CSS + shadcn/ui
- **API 게이트웨이**: Express.js
- **인증 서비스**: Express.js + JWT
- **프로젝트 서비스**: Express.js + TypeORM
- **문서 서비스**: Express.js + TypeORM + S3
- **RAG 서비스**: Express.js + OpenSearch + AI 모델 연동

### 데이터 스토리지
- **관계형 데이터베이스**: PostgreSQL (사용자, 프로젝트, 문서 메타데이터)
- **벡터 데이터베이스**: OpenSearch (문서 임베딩 및 검색)
- **캐시**: Redis (토큰, 세션, 자주 사용되는 쿼리 결과)
- **파일 스토리지**: MinIO (S3 호환, 문서 파일 저장)

## 현재 구현된 기능

### 프론트엔드
- 로그인 및 회원가입 페이지
- 대시보드 화면
- 프로젝트 목록 페이지
- 프로젝트 생성 페이지
- 프로젝트 상세 페이지

### 백엔드
- API 게이트웨이 (라우팅, 인증 미들웨어)
- 인증 서비스 (회원가입, 로그인, JWT 발급)
- 프로젝트 서비스 (프로젝트 CRUD, 멤버십 관리)

## 다음 구현 예정 기능

1. 문서 관리 서비스 구현
2. 문서 업로드 및 처리 인터페이스
3. RAG 엔진 구현 (문서 처리, 임베딩, 검색)
4. 질의응답 인터페이스 구현

## 로컬 개발 환경 설정

### 사전 요구사항
- Docker 및 Docker Compose
- Node.js (v18 이상)
- npm 또는 yarn

### 개발 환경 실행 방법

1. 저장소 복제
git clone https://github.com/your-username/rag-system.git
cd rag-system

2. 개발 환경 시작
./scripts/setup.sh

3. 서비스 접속
- 프론트엔드: http://localhost:3010
- API 게이트웨이: http://localhost:4010
- PostgreSQL: localhost:5432
- OpenSearch: http://localhost:9200
- MinIO 콘솔: http://localhost:9001

### 서비스 재빌드
./scripts/rebuild.sh [서비스명]

## 프로젝트 구조
rag-system/
├── frontend/                     # Remix 프론트엔드
├── backend/                      # 백엔드 서비스
│   ├── api-gateway/              # API 게이트웨이
│   ├── auth-service/             # 인증 서비스
│   ├── project-service/          # 프로젝트 관리 서비스
│   ├── document-service/         # 문서 관리 서비스 (예정)
│   └── rag-service/              # RAG 엔진 서비스 (예정)
├── scripts/                      # 유틸리티 스크립트
├── docker-compose.yml            # 개발 환경 컨테이너 설정
└── README.md                     # 이 파일

# 서비스 재빌드 및 실행
docker compose build
docker compose up -d

위 구현으로 인증 시스템과 프로젝트 관리 기능의 기본 구조가 갖춰졌습니다. 다음 단계로는 문서 관리 서비스와 RAG 엔진의 구현이 필요합니다. README 파일에 지금까지의 진행 상황과 다음 구현할 기능들이 정리되어 있으므로, 다음 작업자가 쉽게 이어서 개발할 수 있을 것입니다.
프론트엔드는 http://localhost:3010에서 접속 가능하며, 회원가입, 로그인, 프로젝트 생성 및 관리 기능을 테스트해볼 수 있습니다.
