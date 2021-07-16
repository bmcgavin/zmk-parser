export type ArraySanitiser = (code: string[]) => string[]
export type StringSanitiser = (line: string) => string
export type TransformingSanitiser = (code: string[]) => string
export type InverseTransformingSanitiser = (code: string) => string[]
