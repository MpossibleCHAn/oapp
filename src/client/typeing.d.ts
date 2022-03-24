declare module '*.glsl' {
  declare const content: string;
  export default content;
}


interface OffscreenCanvas extends EventTarget {
    width: number;
    height: number;

    getContext(contextId: "2d", contextAttributes?: CanvasRenderingContext2DSettings): OffscreenCanvasRenderingContext2D | null;

    getContext(contextId: "bitmaprenderer", contextAttributes?: WebGLContextAttributes): ImageBitmapRenderingContext | null;

    getContext(contextId: "webgl", contextAttributes?: WebGLContextAttributes): WebGLRenderingContext | null;

    getContext(contextId: "webgl2", contextAttributes?: WebGLContextAttributes): WebGL2RenderingContext | null;

    convertToBlob(options?: { type?: string | undefined, quality?: number | undefined }): Promise<Blob>;

    transferToImageBitmap(): ImageBitmap;
}
