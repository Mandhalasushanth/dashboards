import React from "react";
import { View, Text } from "react-native";
import { FilingDocItem } from "@/modules/gst/gst-filing/config/gstFilingDocumentsConfig";
import { styles } from "@/modules/gst/gst-filing/components/GstFilingDocumentsStep/GstFilingDocumentsStep.styles";
import { GstDocItemCard } from "@/modules/gst/gst-filing/components/GstFilingDocumentsStep/GstDocItemCard";
import { filterDocsByCategory } from "@/modules/gst/gst-filing/components/GstFilingDocumentsStep/gstDocStepUtils";

interface RecursiveDocListProps {
  docs: readonly FilingDocItem[];
  filingNature?: "Regular Return" | "Nil Return";
  onUploadSuccess: (
    id: string,
    asset: { uri: string; name: string; size: string }
  ) => void;
  onRemoveDoc: (docId: string) => void;
  index?: number;
}

export const RecursiveDocList: React.FC<RecursiveDocListProps> = ({
  docs,
  filingNature,
  onUploadSuccess,
  onRemoveDoc,
  index = 0,
}) => {
  if (index >= docs.length) {
    return null;
  }

  const doc = docs[index];

  return (
    <>
      <GstDocItemCard
        key={doc.id}
        doc={doc}
        filingNature={filingNature}
        onUploadSuccess={onUploadSuccess}
        onRemoveDoc={onRemoveDoc}
      />
      <RecursiveDocList
        docs={docs}
        filingNature={filingNature}
        onUploadSuccess={onUploadSuccess}
        onRemoveDoc={onRemoveDoc}
        index={index + 1}
      />
    </>
  );
};

interface RecursiveCategorySectionsProps {
  categories: readonly FilingDocItem["category"][];
  documents: readonly FilingDocItem[];
  filingNature?: "Regular Return" | "Nil Return";
  onUploadSuccess: (
    id: string,
    asset: { uri: string; name: string; size: string }
  ) => void;
  onRemoveDoc: (docId: string) => void;
  index?: number;
}

export const RecursiveCategorySections: React.FC<RecursiveCategorySectionsProps> = ({
  categories,
  documents,
  filingNature,
  onUploadSuccess,
  onRemoveDoc,
  index = 0,
}) => {
  if (index >= categories.length) {
    return null;
  }

  const category = categories[index];
  const categoryDocs = filterDocsByCategory(documents, category);

  return (
    <>
      {categoryDocs.length > 0 ? (
        <View key={category} style={styles.categorySection}>
          <Text style={styles.categoryTitle}>{category}</Text>
          <View style={styles.docsList}>
            <RecursiveDocList
              docs={categoryDocs}
              filingNature={filingNature}
              onUploadSuccess={onUploadSuccess}
              onRemoveDoc={onRemoveDoc}
            />
          </View>
        </View>
      ) : null}
      <RecursiveCategorySections
        categories={categories}
        documents={documents}
        filingNature={filingNature}
        onUploadSuccess={onUploadSuccess}
        onRemoveDoc={onRemoveDoc}
        index={index + 1}
      />
    </>
  );
};
