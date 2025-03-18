# RAG 시스템 (Retrieval-Augmented Generation)

이 프로젝트는 문서 기반 질의응답을 위한 RAG(Retrieval-Augmented Generation) 시스템을 구현합니다.

## 개발 진행 상황

### 1. 개발 환경 구성 (완료)
- Docker Compose 기반 개발 환경 구성
- 서비스별 컨테이너 설정
- 데이터베이스, 캐시, 검색 엔진 등 인프라 구성

### 2. 인증 시스템 (완료)
- 사용자 인증 기능 (회원가입, 로그인)
- JWT 인증 시스템
- 인증 미들웨어
- 비밀번호 해싱 및 검증

### 3. 프로젝트 관리 (완료)
- 프로젝트 CRUD 기능
- 프로젝트 멤버십 관리 (소유자, 관리자, 편집자, 뷰어 역할)
- 프로젝트 메타데이터 관리

### 4. 문서 관리 (완료)
- 문서 업로드 및 저장
- 문서 메타데이터 관리
- 문서 버전 관리
- 문서 처리 상태 추적
- 문서 다운로드 및 공유

### 5. RAG 핵심 기능 (일부 완료)
- 문서 처리 및 청킹 (완료)
- 임베딩 생성 (완료)
- 벡터 검색 (완료)
- 질의응답 생성 (완료)
- 응답 피드백 시스템 (완료)
- 소스 추적 및 인용 (완료)
- 하이브리드 검색 (벡터 + 키워드) (완료)
- 검색 최적화 (구현 중)
- 다국어 지원 (계획됨)

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
- 문서 목록 페이지
- 문서 업로드 페이지
- 문서 상세 페이지
- 질의응답 인터페이스 (개발 중)

### 백엔드
- API 게이트웨이 (라우팅, 인증 미들웨어)
- 인증 서비스 (회원가입, 로그인, JWT 발급)
- 프로젝트 서비스 (프로젝트 CRUD, 멤버십 관리)
- 문서 서비스 (문서 업로드, 버전 관리, 메타데이터 관리)
- RAG 서비스:
  - 문서 처리 파이프라인
  - OpenSearch 벡터 검색 구현
  - 임베딩 생성 및 저장
  - 하이브리드 검색 (벡터 + 키워드)
  - 질의응답 생성
  - 소스 추적 및 인용

## 다음 구현 예정 기능

1. 프론트엔드 개선
   - 질의응답 인터페이스 완성
   - 검색 결과 시각화
   - 피드백 시스템 UI
   - 모바일 최적화

2. RAG 성능 최적화
   - 검색 성능 최적화
   - 청킹 전략 개선
   - 컨텍스트 윈도우 최적화
   - 대규모 문서 처리 속도 개선

3. 분석 및 모니터링 시스템
   - 사용량 통계 대시보드
   - 검색 품질 모니터링
   - 시스템 성능 모니터링

4. 통합 기능 구현
   - 외부 지식 베이스 연동
   - API 키 관리
   - 웹훅 시스템

## 로컬 개발 환경 설정

### 사전 요구사항
- Docker 및 Docker Compose
- Node.js (v18 이상)
- npm 또는 yarn

### 개발 환경 실행 방법

1. 저장소 복제
```
git clone https://github.com/your-username/rag-system.git
cd rag-system
```

2. 개발 환경 시작
```
./scripts/setup.sh
```

3. 서비스 접속
- 프론트엔드: http://localhost:3010
- API 게이트웨이: http://localhost:4010
- PostgreSQL: localhost:5432
- OpenSearch: http://localhost:9200
- MinIO 콘솔: http://localhost:9001

### 서비스 재빌드
```
docker compose build
docker compose up -d
```

## 프로젝트 구조

```
rag-system/
├── frontend/                     # Remix 프론트엔드
├── backend/                      # 백엔드 서비스
│   ├── api-gateway/              # API 게이트웨이
│   ├── auth-service/             # 인증 서비스
│   ├── project-service/          # 프로젝트 관리 서비스
│   ├── document-service/         # 문서 관리 서비스
│   └── rag-service/              # RAG 엔진 서비스
├── scripts/                      # 유틸리티 스크립트
├── docker-compose.yml            # 개발 환경 컨테이너 설정
└── README.md                     # 이 파일
```

## 기술 스택

### 프론트엔드
- **프레임워크**: React.js (Remix)
- **상태 관리**: Zustand
- **UI 라이브러리**: Tailwind CSS + shadcn/ui
- **다국어 지원**: i18next
- **API 통신**: Axios

### 백엔드
- **프레임워크**: Node.js (Express.js)
- **타입스크립트**: 모든 서비스에서 사용
- **인증/인가**: JWT, OAuth2.0
- **ORM**: TypeORM
- **데이터베이스**: PostgreSQL (관계형), OpenSearch (벡터)
- **파일 스토리지**: MinIO (S3 호환)
- **캐싱**: Redis

### AI 모델 연동
- **텍스트 임베딩**: OpenAI Embeddings
- **LLM 연동**: OpenAI API (GPT), Anthropic API (Claude)

## 진행 상황 요약

현재까지 개발 환경 구성, 인증 시스템, 프로젝트 관리, 문서 관리 시스템, RAG 핵심 기능이 대부분 구현되었습니다.

프론트엔드는 기본 페이지들(로그인, 회원가입, 대시보드, 프로젝트, 문서 관리)이 구현되었으며, 질의응답 인터페이스는 현재 개발 중입니다.

백엔드는 API 게이트웨이, 인증 서비스, 프로젝트 서비스, 문서 서비스, RAG 서비스의 핵심 기능이 대부분 구현되었습니다.

다음 단계로는 사용자 인터페이스 개선, RAG 성능 최적화, 분석 및 모니터링 시스템 구현을 진행할 예정입니다.