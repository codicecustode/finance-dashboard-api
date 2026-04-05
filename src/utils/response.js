//Standardized API response helpers

const sendSuccess = (res, statusCode = 200, message, data = {}) => {
  const response = { success: true, message };
  if (data && Object.keys(data).length > 0) {
    Object.assign(response, data);
  }
  return res.status(statusCode).json(response);
};

const sendError = (res, statusCode = 500, message, errors = null) => {
  const response = { success: false, message };
  if (errors) response.errors = errors;
  return res.status(statusCode).json(response);
};

const sendPaginated = (res, message, data, pagination) => {
  return res.status(200).json({
    success: true,
    message,
    data,
    pagination,
  });
};

export { sendSuccess, sendError, sendPaginated };
