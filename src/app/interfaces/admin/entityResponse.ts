export interface EntityResponse<T>{
    ok: boolean,
    mensaje: string,
    data?: T;
}