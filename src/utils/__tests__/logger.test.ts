import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  LogLevel,
  ConsoleLogOutput,
  Logger,
  createUserMetadata,
  createLogger,
  logger,
} from "../logger";
import type { LogEntry, LogMetadata } from "../logger";

describe("logger", () => {
  describe("LogLevel", () => {
    it("올바른 로그 레벨 상수를 가져야 한다", () => {
      expect(LogLevel.DEBUG).toBe(0);
      expect(LogLevel.INFO).toBe(1);
      expect(LogLevel.WARN).toBe(2);
      expect(LogLevel.ERROR).toBe(3);
    });

    it("로그 레벨은 숫자 순서대로 정렬되어야 한다", () => {
      expect(LogLevel.DEBUG < LogLevel.INFO).toBe(true);
      expect(LogLevel.INFO < LogLevel.WARN).toBe(true);
      expect(LogLevel.WARN < LogLevel.ERROR).toBe(true);
    });
  });

  describe("ConsoleLogOutput", () => {
    let consoleOutput: ConsoleLogOutput;
    let consoleSpy: {
      debug: ReturnType<typeof vi.spyOn>;
      info: ReturnType<typeof vi.spyOn>;
      warn: ReturnType<typeof vi.spyOn>;
      error: ReturnType<typeof vi.spyOn>;
    };

    beforeEach(() => {
      consoleOutput = new ConsoleLogOutput();

      // console 메서드들 모킹
      consoleSpy = {
        debug: vi.spyOn(console, "debug").mockImplementation(() => {}),
        info: vi.spyOn(console, "info").mockImplementation(() => {}),
        warn: vi.spyOn(console, "warn").mockImplementation(() => {}),
        error: vi.spyOn(console, "error").mockImplementation(() => {}),
      };
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("DEBUG 레벨 로그를 console.debug로 출력해야 한다", () => {
      const entry: LogEntry = {
        level: LogLevel.DEBUG,
        message: "Debug message",
        timestamp: "2024-01-01T00:00:00.000Z",
        source: "TestSource",
      };

      consoleOutput.write(entry);

      expect(consoleSpy.debug).toHaveBeenCalledWith(
        expect.stringMatching(/\[DEBUG\].*\[TestSource\].*Debug message/)
      );
    });

    it("INFO 레벨 로그를 console.info로 출력해야 한다", () => {
      const entry: LogEntry = {
        level: LogLevel.INFO,
        message: "Info message",
        timestamp: "2024-01-01T00:00:00.000Z",
        source: "TestSource",
      };

      consoleOutput.write(entry);

      expect(consoleSpy.info).toHaveBeenCalledWith(
        expect.stringContaining("[INFO]")
      );
    });

    it("WARN 레벨 로그를 console.warn으로 출력해야 한다", () => {
      const entry: LogEntry = {
        level: LogLevel.WARN,
        message: "Warning message",
        timestamp: "2024-01-01T00:00:00.000Z",
        source: "TestSource",
      };

      consoleOutput.write(entry);

      expect(consoleSpy.warn).toHaveBeenCalledWith(
        expect.stringContaining("[WARN]")
      );
    });

    it("ERROR 레벨 로그를 console.error로 출력해야 한다", () => {
      const entry: LogEntry = {
        level: LogLevel.ERROR,
        message: "Error message",
        timestamp: "2024-01-01T00:00:00.000Z",
        source: "TestSource",
      };

      consoleOutput.write(entry);

      expect(consoleSpy.error).toHaveBeenCalledWith(
        expect.stringContaining("[ERROR]")
      );
    });

    it("메타데이터가 있으면 함께 출력해야 한다", () => {
      const entry: LogEntry = {
        level: LogLevel.INFO,
        message: "Message with metadata",
        metadata: { userId: "user123", sessionId: "session456" },
        timestamp: "2024-01-01T00:00:00.000Z",
        source: "TestSource",
      };

      consoleOutput.write(entry);

      expect(consoleSpy.info).toHaveBeenCalledWith(expect.any(String), {
        userId: "user123",
        sessionId: "session456",
      });
    });

    it("빈 메타데이터는 출력하지 않아야 한다", () => {
      const entry: LogEntry = {
        level: LogLevel.INFO,
        message: "Message without metadata",
        metadata: {},
        timestamp: "2024-01-01T00:00:00.000Z",
        source: "TestSource",
      };

      consoleOutput.write(entry);

      expect(consoleSpy.info).toHaveBeenCalledWith(expect.any(String));
      expect(consoleSpy.info).not.toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Object)
      );
    });
  });

  describe("Logger", () => {
    let logger: Logger;
    let mockOutput: { write: ReturnType<typeof vi.fn> };

    beforeEach(() => {
      mockOutput = { write: vi.fn() };
      logger = new Logger([mockOutput]);

      // 시간 모킹
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2024-01-01T12:00:00.000Z"));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    describe("로그 레벨 필터링", () => {
      it("설정된 레벨보다 낮은 로그는 무시해야 한다", () => {
        logger.setLevel(LogLevel.WARN);

        logger.debug("Debug message");
        logger.info("Info message");
        logger.warn("Warning message");
        logger.error("Error message");

        expect(mockOutput.write).toHaveBeenCalledTimes(2); // WARN, ERROR만
      });

      it("DEBUG 레벨이면 모든 로그를 출력해야 한다", () => {
        logger.setLevel(LogLevel.DEBUG);

        logger.debug("Debug message");
        logger.info("Info message");
        logger.warn("Warning message");
        logger.error("Error message");

        expect(mockOutput.write).toHaveBeenCalledTimes(4);
      });

      it("ERROR 레벨이면 ERROR만 출력해야 한다", () => {
        logger.setLevel(LogLevel.ERROR);

        logger.debug("Debug message");
        logger.info("Info message");
        logger.warn("Warning message");
        logger.error("Error message");

        expect(mockOutput.write).toHaveBeenCalledTimes(1);
      });
    });

    describe("소스 설정", () => {
      it('기본 소스는 "App"이어야 한다', () => {
        logger.info("Test message");

        expect(mockOutput.write).toHaveBeenCalledWith(
          expect.objectContaining({ source: "App" })
        );
      });

      it("소스를 설정할 수 있어야 한다", () => {
        logger.setSource("CustomModule");
        logger.info("Test message");

        expect(mockOutput.write).toHaveBeenCalledWith(
          expect.objectContaining({ source: "CustomModule" })
        );
      });
    });

    describe("로그 엔트리 생성", () => {
      it("올바른 로그 엔트리를 생성해야 한다", () => {
        const metadata: LogMetadata = { userId: "user123" };
        logger.info("Test message", metadata);

        expect(mockOutput.write).toHaveBeenCalledWith({
          level: LogLevel.INFO,
          message: "Test message",
          metadata: expect.objectContaining({
            userId: "user123",
            timestamp: "2024-01-01T12:00:00.000Z",
            userAgent: expect.any(String), // jsdom에서는 userAgent가 있음
          }),
          timestamp: "2024-01-01T12:00:00.000Z",
          source: "App",
        });
      });

      it("메타데이터가 없어도 기본 메타데이터를 추가해야 한다", () => {
        logger.info("Test message");

        expect(mockOutput.write).toHaveBeenCalledWith(
          expect.objectContaining({
            metadata: expect.objectContaining({
              timestamp: "2024-01-01T12:00:00.000Z",
              userAgent: expect.any(String), // jsdom에서는 userAgent가 있음
            }),
          })
        );
      });
    });

    describe("여러 출력 대상", () => {
      it("여러 출력 대상에 모두 로그를 전송해야 한다", () => {
        const mockOutput2 = { write: vi.fn() };
        logger.addOutput(mockOutput2);

        logger.info("Test message");

        expect(mockOutput.write).toHaveBeenCalledTimes(1);
        expect(mockOutput2.write).toHaveBeenCalledTimes(1);
      });

      it("출력 중 오류가 발생해도 다른 출력은 계속되어야 한다", () => {
        const errorOutput = {
          write: vi.fn(() => {
            throw new Error("Output error");
          }),
        };
        const consoleErrorSpy = vi
          .spyOn(console, "error")
          .mockImplementation(() => {});

        logger.addOutput(errorOutput);
        logger.info("Test message");

        expect(mockOutput.write).toHaveBeenCalledTimes(1);
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          "로그 출력 중 오류 발생:",
          expect.any(Error)
        );

        consoleErrorSpy.mockRestore();
      });
    });
  });

  describe("createUserMetadata", () => {
    let sessionStorageSpy: ReturnType<typeof vi.spyOn<Storage, "getItem">>;

    beforeEach(() => {
      sessionStorageSpy = vi.spyOn(Storage.prototype, "getItem");
    });

    afterEach(() => {
      sessionStorageSpy.mockRestore();
    });

    it("userId만 제공하면 기본 메타데이터를 생성해야 한다", () => {
      sessionStorageSpy.mockReturnValue("session123");

      const metadata = createUserMetadata("user123");

      expect(metadata).toEqual({
        userId: "user123",
        sessionId: "session123",
      });
    });

    it("userId 없이도 메타데이터를 생성해야 한다", () => {
      sessionStorageSpy.mockReturnValue("session123");

      const metadata = createUserMetadata();

      expect(metadata).toEqual({
        userId: undefined,
        sessionId: "session123",
      });
    });

    it("sessionStorage에 세션이 없으면 undefined를 사용해야 한다", () => {
      sessionStorageSpy.mockReturnValue(null);

      const metadata = createUserMetadata("user123");

      expect(metadata).toEqual({
        userId: "user123",
        sessionId: undefined,
      });
    });

    it("추가 데이터를 병합해야 한다", () => {
      sessionStorageSpy.mockReturnValue("session123");

      const additionalData: LogMetadata = {
        action: "login",
        ip: "192.168.1.1",
      };

      const metadata = createUserMetadata("user123", additionalData);

      expect(metadata).toEqual({
        userId: "user123",
        sessionId: "session123",
        action: "login",
        ip: "192.168.1.1",
      });
    });

    it("추가 데이터가 기본값을 덮어쓸 수 있어야 한다", () => {
      sessionStorageSpy.mockReturnValue("session123");

      const additionalData: LogMetadata = {
        sessionId: "custom-session",
      };

      const metadata = createUserMetadata("user123", additionalData);

      expect(metadata).toEqual({
        userId: "user123",
        sessionId: "custom-session", // 덮어쓰여짐
      });
    });
  });

  describe("createLogger", () => {
    it("지정된 소스로 새 로거를 생성해야 한다", () => {
      const moduleLogger = createLogger("TestModule") as Logger;

      // Mock output to capture logs
      const mockOutput = {
        write: vi.fn(),
      };
      moduleLogger.addOutput(mockOutput);

      moduleLogger.info("테스트 메시지");

      expect(mockOutput.write).toHaveBeenCalledWith(
        expect.objectContaining({
          source: "TestModule",
          message: "테스트 메시지",
          level: LogLevel.INFO,
        })
      );
    });

    it("전역 로거의 레벨을 상속해야 한다", () => {
      // 전역 로거 레벨을 ERROR로 설정
      const originalLevel = logger["level"];
      logger.setLevel(LogLevel.ERROR);

      const moduleLogger = createLogger("TestModule") as Logger;
      const mockOutput = {
        write: vi.fn(),
      };
      moduleLogger.addOutput(mockOutput);

      // INFO 레벨 로그는 무시되어야 함
      moduleLogger.info("무시될 메시지");
      expect(mockOutput.write).not.toHaveBeenCalled();

      // ERROR 레벨 로그는 출력되어야 함
      moduleLogger.error("출력될 메시지");
      expect(mockOutput.write).toHaveBeenCalledWith(
        expect.objectContaining({
          level: LogLevel.ERROR,
          message: "출력될 메시지",
        })
      );

      // 원래 레벨로 복원
      logger.setLevel(originalLevel);
    });
  });

  describe("전역 로거 인스턴스", () => {
    it("전역 로거가 올바르게 초기화되어야 한다", () => {
      // 전역 로거 인스턴스가 존재해야 함
      expect(logger).toBeDefined();

      // 기본 소스가 "App"이어야 함
      const mockOutput = {
        write: vi.fn(),
      };
      logger.addOutput(mockOutput);

      logger.info("테스트 메시지");

      expect(mockOutput.write).toHaveBeenCalledWith(
        expect.objectContaining({
          source: "App",
          message: "테스트 메시지",
        })
      );
    });
  });
});
