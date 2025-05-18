export const parseData = (data: string) => {
  try {
    const res = JSON.parse(data);
    if (typeof res === "object" && res !== null) {
      return res;
    }
  } catch {}
};
