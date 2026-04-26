import { useState } from "react";

export const useArray = (defaultValue: any) => {
  const [array, setArray] = useState(defaultValue);

  const push = (element: any) => {
    setArray((a: any) => [...a, element]);
  };

  const filter = (callback: any) => {
    setArray((a: any) => a.filter(callback));
  };

  const update = (index: any, newElement: any) => {
    setArray((a: any) => [
      ...a.slice(0, index),
      newElement,
      ...a.slice(index + 1, a.length - 1),
    ]);
  };

  const remove = (index: any) => {
    setArray((a: any) => [
      ...a.slice(0, index),
      ...a.slice(index + 1, a.length - 1),
    ]);
  };

  const clear = () => {
    setArray([]);
  };

  return { array, set: setArray, push, filter, update, remove, clear };
};
