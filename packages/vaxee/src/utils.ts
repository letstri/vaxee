export const pick = <O extends Record<string, any>, K extends keyof O>(
  obj: O,
  fields: K[]
): Pick<O, K> =>
  Object.fromEntries(
    Object.entries(obj).filter(([key]) => fields.includes(key as K))
  ) as Pick<O, K>;

export const exclude = <O extends Record<string, any>, K extends keyof O>(
  obj: O,
  fields: K[]
): Exclude<O, K> =>
  Object.fromEntries(
    Object.entries(obj).filter(([key]) => !fields.includes(key as K))
  ) as Exclude<O, K>;
