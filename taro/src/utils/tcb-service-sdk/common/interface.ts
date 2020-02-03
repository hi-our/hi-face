
export interface Options {
    service: string;
    action: string;
    version?: string;
    data?: any;
    options?: any;
}

export interface ReturnValue {
    code: number;
    message: string;
    data?: any;
}