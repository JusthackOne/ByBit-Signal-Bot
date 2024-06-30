// Сборник состояний выполнения асинхронных функций по ключам
const activeKeys = new Map<string, Promise<void>>();

async function executeIfNotRunning(fn: () => Promise<void>, key: string) {
  // Если существует обещание для данного ключа, ждем его выполнения
  if (activeKeys.has(key)) {
    await activeKeys.get(key);
  } else {
    // Устанавливаем обещание выполнения функции для данного ключа
    const promise = (async () => {
      try {
        await fn();
      } finally {
        // Удаляем ключ из карты после завершения выполнения
        activeKeys.delete(key);
      }
    })();

    // Сохраняем обещание в карту
    activeKeys.set(key, promise);

    // Ждем выполнения обещания
    await promise;
  }
}

export default executeIfNotRunning;
