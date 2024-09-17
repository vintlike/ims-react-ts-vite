/// <reference types="vite/client" />

interface LabelValue<T = string> {
    label: string;
    value: T;
    [key: string]: any;
}

declare interface Window {
    BMapGL: any;
    AMap: any;
}
