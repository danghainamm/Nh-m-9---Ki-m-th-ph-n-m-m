function quantity(value) {
  if (typeof value !== 'string' && typeof value !== 'number') return null;
  const number = Number(value);
  return Number.isSafeInteger(number) && number > 0 && number <= 100000 ? number : null;
}
function text(value, max = 255) {
  return typeof value === 'string' && value.trim().length > 0 && value.trim().length <= max;
}
function fail(message, status = 400) {
  return Object.assign(new Error(message), { status });
}
module.exports = { quantity, text, fail };
