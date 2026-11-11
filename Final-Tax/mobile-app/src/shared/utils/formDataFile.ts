/** A file part for React Native's FormData: the native layer uploads the file at `uri`. */
export interface ReactNativeFilePart {
  uri: string;
  name: string;
  type: string;
}

/**
 * Appends a file to multipart form data. React Native's FormData accepts `{ uri, name, type }`
 * objects, which the DOM FormData typings do not model — this is the one place that cast lives.
 */
export const appendFilePart = (formData: FormData, field: string, file: ReactNativeFilePart): void => {
  formData.append(field, file as any);
};
