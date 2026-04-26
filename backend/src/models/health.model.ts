export type DependencyStatus = "up" | "down";

export interface HealthPayload {
  service: string;
  status: "ok" | "degraded";
  timestamp: string;
  uptime: number;
  connections: {
    database: DependencyStatus;
    redis: DependencyStatus;
  };
}

export interface HealthStatusResult {
  httpStatus: number;
  payload: HealthPayload;
}