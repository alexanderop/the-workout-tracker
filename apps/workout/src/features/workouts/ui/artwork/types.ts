export type ArtworkEntry = { name: string; equipment: string; src: string };
export type ArtworkRows = ReadonlyArray<readonly [id: string, entry: ArtworkEntry]>;
