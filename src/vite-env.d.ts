/// <reference types="vite/client" />

declare interface Window {
    BMapGL: any;
    AMap: any;
}

interface LabelValue<T = string> {
    label: string;
    value: T;
    [key: string]: any;
}
