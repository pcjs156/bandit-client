import type { ApiClient } from "./types";
import { localStorageApiClient } from "./localStorage";

/**
 * API 클라이언트 설정
 * 환경에 따라 다른 구현체를 사용할 수 있도록 구성
 */

// 현재는 LocalStorage 기반만 사용
// 나중에 실제 HTTP API로 교체할 때는 여기서 변경
export const apiClient: ApiClient = localStorageApiClient;

// 개별 API 클라이언트도 내보내기 (필요한 경우)
export { localStorageApiClient } from "./localStorage";

// 타입들 재내보내기
export type { ApiClient, AuthApiClient, UserApiClient } from "./types";
