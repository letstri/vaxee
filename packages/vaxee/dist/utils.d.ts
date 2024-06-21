export declare const pick: <O extends Record<string, any>, K extends keyof O>(obj: O, fields: K[]) => Pick<O, K>;
export declare const exclude: <O extends Record<string, any>, K extends keyof O>(obj: O, fields: K[]) => Exclude<O, K>;
