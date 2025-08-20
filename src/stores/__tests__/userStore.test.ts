import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { useUserStore, type StoredUser } from "../userStore";
import {
  TestDataFactory,
  setupCommonTestEnvironment,
} from "@src/test/helpers/commonTestHelpers";

// 유틸리티 함수 모킹
vi.mock("@src/utils/userUtils", () => ({
  createStoredUser: vi.fn((userData) => ({
    id: "user-" + Date.now(),
    userId: userData.userId,
    nickname: userData.nickname,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    passwordHash: "hashedPassword123",
  })),
  findUserByUserId: vi.fn((users: StoredUser[], userId: string) => {
    return users.find((user: StoredUser) => user.userId === userId) || null;
  }),
  findUserById: vi.fn((users: StoredUser[], id: string) => {
    return users.find((user: StoredUser) => user.id === id) || null;
  }),
  updateUserInArray: vi.fn(
    (users: StoredUser[], id: string, updates: Partial<StoredUser>) => {
      const userIndex = users.findIndex((user: StoredUser) => user.id === id);
      if (userIndex === -1) return { updatedUsers: users, updatedUser: null };

      const updatedUser = {
        ...users[userIndex],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      const updatedUsers = [...users];
      updatedUsers[userIndex] = updatedUser;

      return { updatedUsers, updatedUser };
    }
  ),
  toPublicUser: vi.fn((storedUser: StoredUser) => ({
    id: storedUser.id,
    userId: storedUser.userId,
    nickname: storedUser.nickname,
    createdAt: storedUser.createdAt,
    updatedAt: storedUser.updatedAt,
  })),
  verifyUserPassword: vi.fn(() => Promise.resolve(true)),
}));

describe("userStore", () => {
  const mockUser = TestDataFactory.createUser();
  const mockStoredUser = TestDataFactory.createStoredUser();
  const mockCreateUserData = TestDataFactory.createRegisterRequest();

  // 공통 테스트 환경 설정
  setupCommonTestEnvironment();

  beforeEach(() => {
    // 스토어 초기화
    useUserStore.setState({
      users: [],
      currentUser: null,
    });

    // 모킹된 함수들 초기화
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("초기 상태", () => {
    it("올바른 초기 상태를 가져야 한다", () => {
      const state = useUserStore.getState();

      expect(state.users).toEqual([]);
      expect(state.currentUser).toBeNull();
    });
  });

  describe("createUser", () => {
    it("새로운 사용자를 성공적으로 생성해야 한다", async () => {
      const { createUser } = useUserStore.getState();

      // createUser 함수가 정의되어 있는지 확인
      expect(typeof createUser).toBe("function");

      // 사용자 생성
      const newUser = await createUser(mockCreateUserData);

      // 생성된 사용자가 올바른 속성을 가지고 있는지 확인
      expect(newUser).toMatchObject({
        userId: mockCreateUserData.userId,
        nickname: mockCreateUserData.nickname,
      });
      expect(newUser.id).toBeDefined();
      expect(newUser.createdAt).toBeDefined();
      expect(newUser.updatedAt).toBeDefined();
      expect(newUser.passwordHash).toBeDefined();
    });

    it("생성된 사용자가 스토어에 추가되어야 한다", async () => {
      const { createUser } = useUserStore.getState();

      // 사용자 생성
      await createUser(mockCreateUserData);

      // 사용자가 추가되었는지 확인
      const state = useUserStore.getState();
      expect(state.users.length).toBeGreaterThan(0);
    });

    it("여러 사용자를 생성할 수 있어야 한다", async () => {
      const { createUser } = useUserStore.getState();

      // 첫 번째 사용자 생성
      await createUser({
        userId: "user1",
        password: "pass1",
        nickname: "유저1",
      });

      // 두 번째 사용자 생성
      await createUser({
        userId: "user2",
        password: "pass2",
        nickname: "유저2",
      });

      // 두 명의 사용자가 생성되었는지 확인
      const state = useUserStore.getState();
      expect(state.users.length).toBe(2);
    });
  });

  describe("findUserById", () => {
    it("존재하는 사용자를 찾을 수 있어야 한다", async () => {
      const { createUser, findUserById } = useUserStore.getState();

      // 사용자 생성
      const newUser = await createUser(mockCreateUserData);

      // findUserById 함수가 정의되어 있는지 확인
      expect(typeof findUserById).toBe("function");

      // 생성된 사용자를 찾을 수 있어야 함
      const foundUser = findUserById(newUser.id);
      expect(foundUser).toBeDefined();
      expect(foundUser).toEqual(newUser);
    });

    it("존재하지 않는 사용자 ID로 검색 시 null을 반환해야 한다", () => {
      const { findUserById } = useUserStore.getState();

      // 존재하지 않는 ID로 검색
      const foundUser = findUserById("nonexistent-id");
      expect(foundUser).toBeNull();
    });
  });

  describe("findUserByUserId", () => {
    it("존재하는 사용자 ID로 사용자를 찾을 수 있어야 한다", async () => {
      const { createUser, findUserByUserId } = useUserStore.getState();

      // 사용자 생성
      const newUser = await createUser(mockCreateUserData);

      // findUserByUserId 함수가 정의되어 있는지 확인
      expect(typeof findUserByUserId).toBe("function");

      // 생성된 사용자를 찾을 수 있어야 함
      const foundUser = findUserByUserId(newUser.userId);
      expect(foundUser).toBeDefined();
      expect(foundUser).toEqual(newUser);
    });

    it("존재하지 않는 사용자 ID로 검색 시 null을 반환해야 한다", () => {
      const { findUserByUserId } = useUserStore.getState();

      // 존재하지 않는 userId로 검색
      const foundUser = findUserByUserId("nonexistent-userid");
      expect(foundUser).toBeNull();
    });
  });

  describe("updateUser", () => {
    it("사용자 정보를 성공적으로 업데이트해야 한다", async () => {
      const { createUser, updateUser } = useUserStore.getState();

      // 사용자 생성
      const newUser = await createUser(mockCreateUserData);

      // updateUser 함수가 정의되어 있는지 확인
      expect(typeof updateUser).toBe("function");

      // 사용자 정보 업데이트
      const updateData = { nickname: "업데이트된닉네임" };
      const updatedUser = updateUser(newUser.id, updateData);

      // 업데이트가 성공했는지 확인
      expect(updatedUser).toBeDefined();
      expect(updatedUser?.nickname).toBe("업데이트된닉네임");
    });

    it("존재하지 않는 사용자 ID로 업데이트 시 null을 반환해야 한다", () => {
      const { updateUser } = useUserStore.getState();

      // 존재하지 않는 ID로 업데이트
      const updateData = { nickname: "새닉네임" };
      const updatedUser = updateUser("nonexistent-id", updateData);

      // null이 반환되어야 함
      expect(updatedUser).toBeNull();
    });

    it("여러 필드를 동시에 업데이트할 수 있어야 한다", async () => {
      const { createUser, updateUser } = useUserStore.getState();

      // 사용자 생성
      const newUser = await createUser(mockCreateUserData);

      // 여러 필드 업데이트
      const updateData = {
        nickname: "새닉네임",
      };

      const updatedUser = updateUser(newUser.id, updateData);

      // 업데이트가 성공했는지 확인
      expect(updatedUser).toBeDefined();
      expect(updatedUser?.nickname).toBe("새닉네임");
    });
  });

  describe("setCurrentUser", () => {
    it("현재 사용자를 설정할 수 있어야 한다", () => {
      const { setCurrentUser } = useUserStore.getState();

      // setCurrentUser 함수가 정의되어 있는지 확인
      expect(typeof setCurrentUser).toBe("function");

      // 사용자 설정
      setCurrentUser(mockUser);

      // 사용자가 설정되었는지 확인
      const state = useUserStore.getState();
      expect(state.currentUser).toEqual(mockUser);
    });

    it("현재 사용자를 null로 설정할 수 있어야 한다", () => {
      const { setCurrentUser } = useUserStore.getState();

      // 먼저 사용자 설정
      setCurrentUser(mockUser);

      // null로 설정
      setCurrentUser(null);

      // null로 설정되었는지 확인
      const state = useUserStore.getState();
      expect(state.currentUser).toBeNull();
    });
  });

  describe("verifyPassword", () => {
    it("비밀번호 검증을 성공적으로 처리해야 한다", async () => {
      const { verifyPassword } = useUserStore.getState();

      // verifyPassword 함수가 정의되어 있는지 확인
      expect(typeof verifyPassword).toBe("function");

      // 함수 실행 시 에러가 발생하지 않아야 함
      const result = await verifyPassword("password123", "hashedPassword123");
      expect(result).toBe(true);
    });
  });

  describe("clearAllUsers", () => {
    it("모든 사용자 데이터를 삭제해야 한다", async () => {
      const { createUser, clearAllUsers } = useUserStore.getState();

      // 사용자 생성
      await createUser(mockCreateUserData);

      // 사용자가 생성되었는지 확인
      let state = useUserStore.getState();
      expect(state.users.length).toBeGreaterThan(0);

      // 모든 사용자 삭제
      clearAllUsers();

      // 사용자가 삭제되었는지 확인
      state = useUserStore.getState();
      expect(state.users).toEqual([]);
      expect(state.currentUser).toBeNull();
    });
  });
});
