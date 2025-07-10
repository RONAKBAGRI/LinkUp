const response = (res, statusCode, message, data = null) => {
  if (!res) {
    console.error('Response object is null');
    throw new Error('Response object is required');
  }

  const responseObject = {
    status: statusCode < 400 ? 'success' : 'error',
    message,
    data
  };

  return res.status(statusCode).json(responseObject);
};

module.exports = response;