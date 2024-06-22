import type { FunctionProperties, NonFunctionProperties } from "../models/helpers";
import { type BaseStore } from "./defineStore";
export declare function prepareStore<Store extends BaseStore, State extends NonFunctionProperties<Store>, Actions extends FunctionProperties<Store>>(store: (options: any) => Store, name: string): void;
