function isValidUPI(vpa) {
  const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$/;
  return regex.test(vpa);
}

function luhnCheck(cardNumber) {
  const digits = cardNumber.split("").reverse().map(d => parseInt(d));
  let sum = 0;

  for (let i = 0; i < digits.length; i++) {
    let val = digits[i];
    if (i % 2 !== 0) {
      val *= 2;
      if (val > 9) val -= 9;
    }
    sum += val;
  }

  return sum % 10 === 0;
}

function getCardNetwork(cardNumber) {
  if (/^4/.test(cardNumber)) return "Visa";
  if (/^5[1-5]/.test(cardNumber)) return "MasterCard";
  if (/^3[47]/.test(cardNumber)) return "Amex";
  return "Unknown";
}

function isExpired(expMonth, expYear) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  return expYear < year || (expYear === year && expMonth < month);
}

module.exports = {
  isValidUPI,
  luhnCheck,
  getCardNetwork,
  isExpired,
};
function isValidUPI(vpa) {
  const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$/;
  return regex.test(vpa);
}

function luhnCheck(cardNumber) {
  const digits = cardNumber.split("").reverse().map(d => parseInt(d));
  let sum = 0;

  for (let i = 0; i < digits.length; i++) {
    let val = digits[i];
    if (i % 2 !== 0) {
      val *= 2;
      if (val > 9) val -= 9;
    }
    sum += val;
  }

  return sum % 10 === 0;
}

function getCardNetwork(cardNumber) {
  if (/^4/.test(cardNumber)) return "Visa";
  if (/^5[1-5]/.test(cardNumber)) return "MasterCard";
  if (/^3[47]/.test(cardNumber)) return "Amex";
  return "Unknown";
}

function isExpired(expMonth, expYear) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  return expYear < year || (expYear === year && expMonth < month);
}

module.exports = {
  isValidUPI,
  luhnCheck,
  getCardNetwork,
  isExpired,
};