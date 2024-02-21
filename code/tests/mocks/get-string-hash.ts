export function getStringHash(str: string) {
  let hashNumber = 5381;
  let i = str.length;

  while (i) {
    hashNumber = (hashNumber * 33) ^ str.charCodeAt((i -= 1));
  }
  return String(hashNumber >>> 0);
}
