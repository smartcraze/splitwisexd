export class ApiResponse<T = unknown> {
  public readonly success: boolean;
  public readonly message: string;
  public readonly data: T;

  constructor(message: string, data: T, success = true) {
    this.success = success;
    this.message = message;
    this.data = data;
  }

  static success<T>(message: string, data: T) {
    return new ApiResponse(message, data, true);
  }

  static error(message: string, data: unknown = null) {
    return new ApiResponse(message, data, false);
  }
}
