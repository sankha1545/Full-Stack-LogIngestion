export interface LogScopeConfig {

 apiKey: string;

 service?: string;

 environment?: string;

 version?: string;

}

export function init(
config: LogScopeConfig
): void;

export function error(
msg:string,
meta?:any
): void;

export function warn(
msg:string,
meta?:any
): void;

export function info(
msg:string,
meta?:any
): void;

export function debug(
msg:string,
meta?:any
): void;

export function fatal(
msg:string,
meta?:any
): void;