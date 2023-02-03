// For checking if a string is blank, null or undefined
export const isBlank = (str: string) => (!str || /^\s*$/.test(str));

// For checking if a string is empty, null or undefined
export const isEmpty = (str:string ) => (!str || str.length === 0);
