export type Unpacked<T> = T extends { [K in keyof T]: infer U } ? U : never;

export const assignSafe = <T, S>(target: T, source: S): boolean => {
  if (target && source) {
    Object.assign(target, source);
    return true;
  }
  return false;
};

export const assignSafeE = <T, S>(target: T | undefined, source: S | undefined): void => {
  if (!target) {
    throw new Error('invalid target');
  }
  if (!source) {
    throw new Error('invalid source');
  }
  Object.assign(target, source);
};

export const arrayDeepCopy = <T>(target: T[], source: T[]): void => {
  target.length = 0;
  source.forEach((s: any) => {
    target.push(Object.assign(s));
  });
};

// for vue reactive
export const replaceArray = <T>(src: T[], replace: T[]): void => {
  src.splice(0, src.length, ...replace);
};

export const replaceArraySafe = <T>(src: T[], replace: T[]): void => {
  if (replace) {
    src.splice(0, src.length, ...replace);
  } else {
    src.splice(0, src.length);
  }
};

export const toNumberSafe = (v: string, def: number = 0): number => {
  let ret = parseInt(v);
  if (isNaN(ret)) {
    ret = def;
  }
  return ret;
};
