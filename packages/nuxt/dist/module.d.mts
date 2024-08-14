import { NuxtModule } from '@nuxt/schema';

interface ModuleOptions {
    /**
     * Automatically add stores dirs to the auto imports. This is the same as
     * directly adding the dirs to the `imports.dirs` option. If you want to
     * also import nested stores, you can use the glob pattern `./stores/**`
     *
     * Dirs always look for the directories in the `srcDir` folder.
     *
     * @default `['stores']`
     */
    dirs?: string[];
}
declare const module: NuxtModule<ModuleOptions>;

export { type ModuleOptions, module as default };
