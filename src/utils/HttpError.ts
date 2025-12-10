export interface ResponseError extends Error {
  status: number;
}

const messageList: Record<number, string> = {
  400: "Bad Request",
  401: "Unauthorized",
  403: "Forbidden",
  404: "Not Found",
  409: "Conflict",
};

const HttpError = (
  status: number,
  message: string = messageList[status] ?? "Unknown error"
): ResponseError => {
  const error = new Error(message) as ResponseError;
  error.status = status;
  return error;
};

export default HttpError;