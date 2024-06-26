export const isValidOIPeriod = (str: string) => {
  return 1 <= parseFloat(str) && parseFloat(str) <= 30;
};


export const isValidOIPercenteges = (str: string) => {
    return 0.1 <= parseFloat(str) && parseFloat(str) <= 100;
  };
  