export const withDelay = (payload, delay = 700, fail = false) =>
  new Promise((resolve, reject) => {
    setTimeout(() => {
      if (fail) {
        reject(new Error("Mock xatolik"));
        return;
      }
      resolve(payload);
    }, delay);
  });
