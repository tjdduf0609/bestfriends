export function getStorage<T>(
  key: string
): T[] {

  if (typeof window === "undefined") {
    return [];
  }


  const data =
    localStorage.getItem(key);


  if (!data) {
    return [];
  }


  return JSON.parse(data);

}



export function setStorage<T>(
  key: string,
  data: T[]
) {

  localStorage.setItem(
    key,
    JSON.stringify(data)
  );

}