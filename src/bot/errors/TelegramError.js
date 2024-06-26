class TelegramError extends Error {
  constructor(text, error) {
    super();
    this.error = {
      text: text,
      error: error
    };
  }

  static IsAdminError(text, error) {
    return new TelegramError(text, error);
  }
}

export default TelegramError;
