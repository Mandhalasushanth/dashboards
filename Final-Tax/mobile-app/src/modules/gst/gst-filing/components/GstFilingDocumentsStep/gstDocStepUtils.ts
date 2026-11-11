import { FilingDocItem } from "@/modules/gst/gst-filing/config/gstFilingDocumentsConfig";

export const FILING_DOC_CATEGORIES: readonly FilingDocItem["category"][] = [
  "Sales & Outward Supplies",
  "Purchases & Input Tax",
  "Banking & Reconciliation",
  "Statutory & Compliance",
] as const;

/**
 * Recursively counts the number of uploaded documents without any forbidden loops.
 */
export function countUploadedDocuments(
  docs: readonly FilingDocItem[],
  index = 0,
  count = 0
): number {
  if (index >= docs.length) {
    return count;
  }
  return countUploadedDocuments(
    docs,
    index + 1,
    docs[index].fileUri ? count + 1 : count
  );
}

/**
 * Recursively updates a single document in a list by id without any forbidden loops.
 */
export function updateDocumentInList(
  docs: readonly FilingDocItem[],
  docId: string,
  updater: (doc: FilingDocItem) => FilingDocItem,
  index = 0,
  acc: FilingDocItem[] = []
): FilingDocItem[] {
  if (index >= docs.length) {
    return acc;
  }
  const current = docs[index];
  acc.push(current.id === docId ? updater(current) : current);
  return updateDocumentInList(docs, docId, updater, index + 1, acc);
}

/**
 * Recursively filters documents by category without any forbidden loops.
 */
export function filterDocsByCategory(
  docs: readonly FilingDocItem[],
  category: FilingDocItem["category"],
  index = 0,
  acc: FilingDocItem[] = []
): FilingDocItem[] {
  if (index >= docs.length) {
    return acc;
  }
  if (docs[index].category === category) {
    acc.push(docs[index]);
  }
  return filterDocsByCategory(docs, category, index + 1, acc);
}
