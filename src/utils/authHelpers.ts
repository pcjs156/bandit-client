import type { User } from "@src/types/user";
import type { ApiError } from "@src/types/api";
import { createLogger, createUserMetadata } from "@src/utils/logger";

/**
 * 인증 관련 헬퍼 함수들
 */

// 인증 스토어 전용 로거
const logger = createLogger("AuthStore");

/**
 * 인증 상태 타입
 */
export type AuthStatus =
  | "idle"
  | "loading"
  | "authenticated"
  | "unauthenticated";

/**
 * 인증 상태 업데이트 함수 타입
 */
export type AuthStateUpdater = (update: {
  status?: AuthStatus;
  user?: User | null;
  error?: string | null;
}) => void;

/**
 * 인증 액션 결과 타입
 */
interface AuthActionResult {
  user?: User;
  successMessage?: string;
}

/**
 * 인증 액션을 실행하고 공통 로깅/상태 처리를 수행하는 헬퍼
 */
export async function executeAuthAction<T extends AuthActionResult>(
  actionName: string,
  userId: string | undefined,
  setState: AuthStateUpdater,
  action: () => Promise<T>,
): Promise<T> {
  // 시작 로깅
  logger.info(`${actionName} 시작`, createUserMetadata(undefined, { userId }));

  // 로딩 상태 설정
  setState({ status: "loading", error: null });

  try {
    const result = await action();

    // 성공 로깅
    logger.info(
      result.successMessage || `${actionName} 성공`,
      createUserMetadata(result.user?.id, { userId: result.user?.userId }),
    );

    // 성공 상태 설정
    setState({
      status: "authenticated",
      user: result.user || null,
      error: null,
    });

    return result;
  } catch (error) {
    const apiError = error as ApiError;

    // 실패 로깅
    logger.error(
      `${actionName} 실패`,
      createUserMetadata(undefined, {
        userId,
        errorCode: apiError.detailCode,
        errorMessage: apiError.message,
      }),
    );

    // 실패 상태 설정
    setState({
      status: "unauthenticated",
      user: null,
      error: apiError.message || `${actionName}에 실패했습니다`,
    });

    throw error;
  }
}

/**
 * 로그아웃 처리를 위한 헬퍼
 */
export async function executeLogout(
  currentUser: User | null,
  setState: AuthStateUpdater,
  logoutAction: () => Promise<void>,
): Promise<void> {
  logger.info("로그아웃 시작", createUserMetadata(currentUser?.id));

  try {
    await logoutAction();
    logger.info("로그아웃 성공", createUserMetadata(currentUser?.id));
  } catch (error) {
    // 로그아웃 에러는 무시 (이미 로그아웃된 상태일 수 있음)
    logger.warn(
      "로그아웃 중 오류 발생",
      createUserMetadata(currentUser?.id, { error: String(error) }),
    );
  } finally {
    // localStorage 완전 정리
    localStorage.clear();

    setState({
      status: "unauthenticated",
      user: null,
      error: null,
    });
  }
}

/**
 * 프로필 업데이트를 위한 헬퍼
 */
export async function executeProfileUpdate(
  currentUser: User,
  nickname: string,
  setState: AuthStateUpdater,
  updateAction: () => Promise<User>,
): Promise<void> {
  logger.info(
    "프로필 업데이트 시작",
    createUserMetadata(currentUser.id, { nickname }),
  );

  try {
    const updatedUser = await updateAction();

    logger.info(
      "프로필 업데이트 성공",
      createUserMetadata(updatedUser.id, {
        oldNickname: currentUser.nickname,
        newNickname: updatedUser.nickname,
      }),
    );

    setState({ user: updatedUser, error: null });
  } catch (error) {
    const apiError = error as ApiError;

    logger.error(
      "프로필 업데이트 실패",
      createUserMetadata(currentUser.id, {
        nickname,
        errorCode: apiError.detailCode,
        errorMessage: apiError.message,
      }),
    );

    setState({ error: apiError.message || "프로필 업데이트에 실패했습니다" });
    throw error;
  }
}

/**
 * 토큰 갱신을 위한 헬퍼
 */
export async function executeTokenRefresh(
  setState: AuthStateUpdater,
  refreshAction: () => Promise<User>,
): Promise<void> {
  logger.debug("토큰 갱신 시작");

  try {
    const user = await refreshAction();

    logger.debug("토큰 갱신 성공", createUserMetadata(user.id));

    setState({ status: "authenticated", user, error: null });
  } catch (error) {
    logger.error("토큰 갱신 실패", { error: String(error) });

    setState({ status: "unauthenticated", user: null, error: null });
    throw error;
  }
}

/**
 * 초기화를 위한 헬퍼
 */
export async function executeInitialize(
  setState: AuthStateUpdater,
  getMeAction: () => Promise<User>,
): Promise<void> {
  logger.info("인증 상태 초기화 시작");
  setState({ status: "loading" });

  try {
    const user = await getMeAction();

    logger.info("인증 상태 초기화 성공", createUserMetadata(user.id));
    setState({ status: "authenticated", user, error: null });
  } catch (error) {
    // 인증 정보가 없거나 만료된 경우
    logger.debug("인증 정보 없음 또는 만료됨", { error: String(error) });

    // JSON 파싱 에러가 발생한 경우 localStorage 정리
    if (
      String(error).includes("JSON") ||
      String(error).includes("not valid JSON")
    ) {
      logger.warn("localStorage 데이터 손상 감지, 정리 중...");
      localStorage.clear();
    }

    setState({ status: "unauthenticated", user: null, error: null });
  }
}
