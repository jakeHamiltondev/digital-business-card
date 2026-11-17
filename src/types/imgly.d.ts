declare module '@imgly/background-removal-node' {
  export function removeBackground(input: Blob | ArrayBuffer | string, config?: { output?: { format?: string } }): Promise<Blob>
}
