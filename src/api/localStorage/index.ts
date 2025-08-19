import type { ApiClient } from "@src/api/types";
import { LocalStorageAuthApi } from "./authApi";
import { LocalStorageUserApi } from "./userApi";

/**
 * LocalStorage 기반 API 클라이언트
 */
export class LocalStorageApiClient implements ApiClient {
  public readonly auth: LocalStorageAuthApi;
  public readonly user: LocalStorageUserApi;

  constructor() {
    this.auth = new LocalStorageAuthApi();
    this.user = new LocalStorageUserApi();
  }
}

// 기본 인스턴스 생성 및 내보내기
export const localStorageApiClient = new LocalStorageApiClient();
