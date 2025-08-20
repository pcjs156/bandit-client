/**
 * 로그 레벨 정의
 */
export const LogLevel = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
} as const;

export type LogLevel = (typeof LogLevel)[keyof typeof LogLevel];

/**
 * 로그 메타데이터 타입
 */
export interface LogMetadata {
  [key: string]: unknown;
  userId?: string;
  sessionId?: string;
  timestamp?: string;
  userAgent?: string;
}

/**
 * 로그 엔트리 타입
 */
export interface LogEntry {
  level: LogLevel;
  message: string;
  metadata?: LogMetadata;
  timestamp: string;
  source: string;
}

/**
 * 로거 인터페이스
 */
export interface ILogger {
  debug(message: string, metadata?: LogMetadata): void;
  info(message: string, metadata?: LogMetadata): void;
  warn(message: string, metadata?: LogMetadata): void;
  error(message: string, metadata?: LogMetadata): void;
  setLevel(level: LogLevel): void;
  setSource(source: string): void;
}

/**
 * 로그 출력 인터페이스
 */
export interface ILogOutput {
  write(entry: LogEntry): void;
}

/**
 * 콘솔 로그 출력 구현체
 */
export class ConsoleLogOutput implements ILogOutput {
  private readonly colors = {
    [LogLevel.DEBUG]: "\x1b[36m", // cyan
    [LogLevel.INFO]: "\x1b[32m", // green
    [LogLevel.WARN]: "\x1b[33m", // yellow
    [LogLevel.ERROR]: "\x1b[31m", // red
  };

  private readonly reset = "\x1b[0m";

  write(entry: LogEntry): void {
    const color = this.colors[entry.level];
    const levelName =
      Object.keys(LogLevel).find(
        (key) => LogLevel[key as keyof typeof LogLevel] === entry.level
      ) || "UNKNOWN";
    const prefix = `${color}[${levelName}]${this.reset}`;

    const logMessage = `${prefix} [${entry.source}] ${entry.message}`;

    // 메타데이터가 있으면 추가
    const args: unknown[] = [logMessage];
    if (entry.metadata && Object.keys(entry.metadata).length > 0) {
      args.push(entry.metadata);
    }

    // 로그 레벨에 따른 적절한 console 메서드 사용
    switch (entry.level) {
      case LogLevel.DEBUG:
        console.debug(...args);
        break;
      case LogLevel.INFO:
        console.info(...args);
        break;
      case LogLevel.WARN:
        console.warn(...args);
        break;
      case LogLevel.ERROR:
        console.error(...args);
        break;
    }
  }
}

/**
 * 로거 구현체
 */
export class Logger implements ILogger {
  private level: LogLevel = LogLevel.INFO;
  private source: string = "App";
  private outputs: ILogOutput[] = [];

  constructor(outputs: ILogOutput[] = [new ConsoleLogOutput()]) {
    this.outputs = outputs;
  }

  setLevel(level: LogLevel): void {
    this.level = level;
  }

  setSource(source: string): void {
    this.source = source;
  }

  addOutput(output: ILogOutput): void {
    this.outputs.push(output);
  }

  debug(message: string, metadata?: LogMetadata): void {
    this.log(LogLevel.DEBUG, message, metadata);
  }

  info(message: string, metadata?: LogMetadata): void {
    this.log(LogLevel.INFO, message, metadata);
  }

  warn(message: string, metadata?: LogMetadata): void {
    this.log(LogLevel.WARN, message, metadata);
  }

  error(message: string, metadata?: LogMetadata): void {
    this.log(LogLevel.ERROR, message, metadata);
  }

  private log(level: LogLevel, message: string, metadata?: LogMetadata): void {
    // 현재 설정된 레벨보다 낮은 레벨의 로그는 무시
    if (level < this.level) {
      return;
    }

    const entry: LogEntry = {
      level,
      message,
      metadata: {
        ...metadata,
        timestamp: new Date().toISOString(),
        userAgent:
          typeof navigator !== "undefined" ? navigator.userAgent : undefined,
      },
      timestamp: new Date().toISOString(),
      source: this.source,
    };

    // 모든 출력 대상에 로그 전송
    this.outputs.forEach((output) => {
      try {
        output.write(entry);
      } catch (error) {
        console.error("로그 출력 중 오류 발생:", error);
      }
    });
  }
}

/**
 * 환경에 따른 로그 레벨을 설정하는 함수
 */
export function setEnvironmentLogLevel(logger: ILogger, isDev: boolean): void {
  if (isDev) {
    logger.setLevel(LogLevel.DEBUG);
  } else {
    logger.setLevel(LogLevel.INFO);
  }
}

/**
 * 전역 로거 인스턴스
 */
export const logger = new Logger();

/**
 * 개발 환경에서는 DEBUG 레벨부터, 운영 환경에서는 INFO 레벨부터 출력
 */
setEnvironmentLogLevel(logger, import.meta.env.DEV);

/**
 * 로거 팩토리 함수
 * 특정 소스(모듈)에 대한 로거를 생성
 */
export function createLogger(source: string): ILogger {
  const moduleLogger = new Logger();
  moduleLogger.setLevel(logger["level"]); // private 접근을 위한 타입 캐스팅
  moduleLogger.setSource(source);
  return moduleLogger;
}

/**
 * 사용자 컨텍스트를 포함한 메타데이터 생성 헬퍼
 */
export function createUserMetadata(
  userId?: string,
  additionalData?: LogMetadata
): LogMetadata {
  return {
    userId,
    sessionId: sessionStorage.getItem("bandit_session_id") || undefined,
    ...additionalData,
  };
}
