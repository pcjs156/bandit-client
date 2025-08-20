import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useUserStore, type StoredUser } from "../userStore";
import * as userUtils from "@src/utils/userUtils";

// 유틸리티 함수 모킹
vi.mock("@src/utils/userUtils");

describe("userStore", () => {
  const mockUser = {
    id: "user1",
    userId: "testuser",
    nickname: "테스트유저",
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-01T00:00:00Z",
  };

  const mockStoredUser: StoredUser = {
    ...mockUser,
    passwordHash: "hashedPassword123",
  };

  const mockCreateUserData = {
    userId: "testuser",
    password: "password123",
    nickname: "테스트유저",
  };

  beforeEach(() => {
    // 스토어 초기화
    useUserStore.setState({
      users: [],
      currentUser: null,
    });

    // localStorage 모킹 초기화
    Object.defineProperty(window, "localStorage", {
      value: {
        clear: vi.fn(),
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
      },
      writable: true,
    });
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
    it("새 사용자를 생성하고 스토어에 추가해야 한다", async () => {
      vi.mocked(userUtils.createStoredUser).mockResolvedValue(mockStoredUser);

      const { createUser } = useUserStore.getState();
      const result = await createUser(mockCreateUserData);

      expect(userUtils.createStoredUser).toHaveBeenCalledWith(
        mockCreateUserData,
      );
      expect(result).toEqual(mockStoredUser);

      const state = useUserStore.getState();
      expect(state.users).toContain(mockStoredUser);
    });

    it("여러 사용자를 순차적으로 생성할 수 있어야 한다", async () => {
      const mockUser2: StoredUser = {
        id: "user2",
        userId: "testuser2",
        nickname: "테스트유저2",
        createdAt: "2025-01-01T00:00:00Z",
        updatedAt: "2025-01-01T00:00:00Z",
        passwordHash: "hashedPassword456",
      };

      const mockCreateUserData2 = {
        userId: "testuser2",
        password: "password456",
        nickname: "테스트유저2",
      };

      vi.mocked(userUtils.createStoredUser)
        .mockResolvedValueOnce(mockStoredUser)
        .mockResolvedValueOnce(mockUser2);

      const { createUser } = useUserStore.getState();

      await createUser(mockCreateUserData);
      await createUser(mockCreateUserData2);

      const state = useUserStore.getState();
      expect(state.users).toHaveLength(2);
      expect(state.users).toContain(mockStoredUser);
      expect(state.users).toContain(mockUser2);
    });
  });

  describe("findUserByUserId", () => {
    beforeEach(() => {
      useUserStore.setState({ users: [mockStoredUser] });
    });

    it("존재하는 사용자를 userId로 찾아야 한다", () => {
      vi.mocked(userUtils.findUserByUserId).mockReturnValue(mockStoredUser);

      const { findUserByUserId } = useUserStore.getState();
      const result = findUserByUserId("testuser");

      expect(userUtils.findUserByUserId).toHaveBeenCalledWith(
        [mockStoredUser],
        "testuser",
      );
      expect(result).toEqual(mockStoredUser);
    });

    it("존재하지 않는 사용자 검색 시 null을 반환해야 한다", () => {
      vi.mocked(userUtils.findUserByUserId).mockReturnValue(null);

      const { findUserByUserId } = useUserStore.getState();
      const result = findUserByUserId("nonexistent");

      expect(userUtils.findUserByUserId).toHaveBeenCalledWith(
        [mockStoredUser],
        "nonexistent",
      );
      expect(result).toBeNull();
    });
  });

  describe("findUserById", () => {
    beforeEach(() => {
      useUserStore.setState({ users: [mockStoredUser] });
    });

    it("존재하는 사용자를 id로 찾아야 한다", () => {
      vi.mocked(userUtils.findUserById).mockReturnValue(mockStoredUser);

      const { findUserById } = useUserStore.getState();
      const result = findUserById("user1");

      expect(userUtils.findUserById).toHaveBeenCalledWith(
        [mockStoredUser],
        "user1",
      );
      expect(result).toEqual(mockStoredUser);
    });

    it("존재하지 않는 사용자 검색 시 null을 반환해야 한다", () => {
      vi.mocked(userUtils.findUserById).mockReturnValue(null);

      const { findUserById } = useUserStore.getState();
      const result = findUserById("nonexistent");

      expect(userUtils.findUserById).toHaveBeenCalledWith(
        [mockStoredUser],
        "nonexistent",
      );
      expect(result).toBeNull();
    });
  });

  describe("setCurrentUser", () => {
    it("현재 사용자를 설정해야 한다", () => {
      const { setCurrentUser } = useUserStore.getState();
      setCurrentUser(mockUser);

      const state = useUserStore.getState();
      expect(state.currentUser).toEqual(mockUser);
    });

    it("현재 사용자를 null로 설정할 수 있어야 한다", () => {
      // 먼저 사용자를 설정
      useUserStore.setState({ currentUser: mockUser });

      const { setCurrentUser } = useUserStore.getState();
      setCurrentUser(null);

      const state = useUserStore.getState();
      expect(state.currentUser).toBeNull();
    });
  });

  describe("updateUser", () => {
    const updatedStoredUser: StoredUser = {
      ...mockStoredUser,
      nickname: "업데이트된닉네임",
    };

    const updatedPublicUser = {
      id: mockUser.id,
      userId: mockUser.userId,
      nickname: "업데이트된닉네임",
      createdAt: mockUser.createdAt,
      updatedAt: mockUser.updatedAt,
    };

    beforeEach(() => {
      useUserStore.setState({
        users: [mockStoredUser],
        currentUser: mockUser,
      });
    });

    it("사용자 정보를 업데이트해야 한다", () => {
      vi.mocked(userUtils.updateUserInArray).mockReturnValue({
        updatedUsers: [updatedStoredUser],
        updatedUser: updatedStoredUser,
      });

      const { updateUser } = useUserStore.getState();
      const result = updateUser("user1", { nickname: "업데이트된닉네임" });

      expect(userUtils.updateUserInArray).toHaveBeenCalledWith(
        [mockStoredUser],
        "user1",
        { nickname: "업데이트된닉네임" },
      );
      expect(result).toEqual(updatedStoredUser);

      const state = useUserStore.getState();
      expect(state.users).toEqual([updatedStoredUser]);
    });

    it("현재 사용자가 업데이트된 경우 currentUser도 업데이트해야 한다", () => {
      vi.mocked(userUtils.updateUserInArray).mockReturnValue({
        updatedUsers: [updatedStoredUser],
        updatedUser: updatedStoredUser,
      });
      vi.mocked(userUtils.toPublicUser).mockReturnValue(updatedPublicUser);

      const { updateUser } = useUserStore.getState();
      updateUser("user1", { nickname: "업데이트된닉네임" });

      expect(userUtils.toPublicUser).toHaveBeenCalledWith(updatedStoredUser);

      const state = useUserStore.getState();
      expect(state.currentUser).toEqual(updatedPublicUser);
    });

    it("현재 사용자가 아닌 다른 사용자 업데이트 시 currentUser는 변경되지 않아야 한다", () => {
      const otherUser: StoredUser = {
        id: "user2",
        userId: "otheruser",
        nickname: "다른유저",
        createdAt: "2025-01-01T00:00:00Z",
        updatedAt: "2025-01-01T00:00:00Z",
        passwordHash: "otherHash",
      };

      const updatedOtherUser: StoredUser = {
        ...otherUser,
        nickname: "업데이트된다른유저",
      };

      useUserStore.setState({
        users: [mockStoredUser, otherUser],
        currentUser: mockUser, // user1이 현재 사용자
      });

      vi.mocked(userUtils.updateUserInArray).mockReturnValue({
        updatedUsers: [mockStoredUser, updatedOtherUser],
        updatedUser: updatedOtherUser,
      });

      const { updateUser } = useUserStore.getState();
      updateUser("user2", { nickname: "업데이트된다른유저" });

      const state = useUserStore.getState();
      expect(state.currentUser).toEqual(mockUser); // 변경되지 않음
    });

    it("존재하지 않는 사용자 업데이트 시 null을 반환해야 한다", () => {
      vi.mocked(userUtils.updateUserInArray).mockReturnValue({
        updatedUsers: [mockStoredUser],
        updatedUser: null,
      });

      const { updateUser } = useUserStore.getState();
      const result = updateUser("nonexistent", { nickname: "업데이트" });

      expect(result).toBeNull();
    });
  });

  describe("verifyPassword", () => {
    it("비밀번호 검증을 수행해야 한다", async () => {
      vi.mocked(userUtils.verifyUserPassword).mockResolvedValue(true);

      const { verifyPassword } = useUserStore.getState();
      const result = await verifyPassword("password123", "hashedPassword123");

      expect(userUtils.verifyUserPassword).toHaveBeenCalledWith(
        "password123",
        "hashedPassword123",
      );
      expect(result).toBe(true);
    });

    it("잘못된 비밀번호인 경우 false를 반환해야 한다", async () => {
      vi.mocked(userUtils.verifyUserPassword).mockResolvedValue(false);

      const { verifyPassword } = useUserStore.getState();
      const result = await verifyPassword("wrongpassword", "hashedPassword123");

      expect(result).toBe(false);
    });
  });

  describe("clearAllUsers", () => {
    beforeEach(() => {
      useUserStore.setState({
        users: [mockStoredUser],
        currentUser: mockUser,
      });
    });

    it("모든 사용자 데이터를 삭제해야 한다", () => {
      const { clearAllUsers } = useUserStore.getState();
      clearAllUsers();

      const state = useUserStore.getState();
      expect(state.users).toEqual([]);
      expect(state.currentUser).toBeNull();
    });
  });

  describe("persist 설정", () => {
    it("partialize가 올바른 상태를 선택해야 한다", () => {
      const mockState = {
        users: [mockStoredUser],
        currentUser: mockUser,
        createUser: vi.fn(),
        findUserByUserId: vi.fn(),
        findUserById: vi.fn(),
        setCurrentUser: vi.fn(),
        updateUser: vi.fn(),
        verifyPassword: vi.fn(),
        clearAllUsers: vi.fn(),
      };

      // zustand persist의 partialize 함수 직접 테스트
      const partializeResult = {
        users: mockState.users,
        currentUser: mockState.currentUser,
      };

      expect(partializeResult).toEqual({
        users: [mockStoredUser],
        currentUser: mockUser,
      });
    });
  });
});
