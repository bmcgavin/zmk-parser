import { ArraySanitiser, StringSanitiser, InverseTransformingSanitiser, TransformingSanitiser } from "./types"

const removeIncludes: ArraySanitiser = (code: string[]) => 
  code.map(line => line.replace(/^#.*$/g, ""))

const removeComments: ArraySanitiser = (code: string[]) => 
  code.map(line => line.replace(/\/\/.*$/g, ""))

const removeSpaces: ArraySanitiser = (code: string[]) =>
  code.map(line => line.replace(/\s\s+/g, " "))

const removeTabs: ArraySanitiser = (code: string[]) =>
  code.map(line => line.replace(/\t+/g, " "))

const removeNewlines: ArraySanitiser = (code: string[]) =>
  code.filter(line => line.length != 0)

const removeMultilineComments: StringSanitiser = (lines: string) =>
  lines.replace(/\/\*[^\/]*\*\/\s+/g, "")

const removeLayerTapConfig: StringSanitiser = (lines: string) =>
  lines.replace(/&lt\s+{[^}]*};\s+/g, "")

const removeModTapConfig: StringSanitiser = (lines: string) =>
  lines.replace(/&mt\s+{[^}]*};\s+/g, "")

const removeBehaviors: StringSanitiser = (lines: string) =>
  lines.replace(/behaviors\s+{[^}]*{[^}]*};\s+};\s+/g, "")

export function sanitise(code: string): string {
  const starter: InverseTransformingSanitiser = (code: string) => code.split(/\n/)
  let codeArray = starter(code)
  const arraySanitisers: ArraySanitiser[] = [
    removeComments,
    removeIncludes,
    removeSpaces,
    removeTabs,
    removeNewlines,
  ]
  for (const fn of arraySanitisers) {
    codeArray = fn(codeArray)
  }
  const joiner: TransformingSanitiser = (code: string[]) => code.join(' ')
  let codeString = joiner(codeArray)

  const stringSanitisers: StringSanitiser[] = [
    removeMultilineComments,
    removeLayerTapConfig,
    removeModTapConfig,
    removeBehaviors
  ]
  for (const fn of stringSanitisers) {
    codeString = fn(codeString)
  }
  return codeString
}