function calculatePercentageChange(
  initialValue: number,
  newValue: number
): number {
  if (initialValue === 0) {
    throw new Error(
      "Изначальное значение не должно быть равно нулю, чтобы избежать деления на ноль."
    );
  }

  const change = newValue - initialValue;
  const percentageChange = (change / initialValue) * 100;

  return percentageChange;
}

export { calculatePercentageChange };
