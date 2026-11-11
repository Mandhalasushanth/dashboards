import { SharedItrDocumentCard } from "@/modules/itr/components/documents/SharedItrDocumentCard/SharedItrDocumentCard";
import { ITR_ALLOWED_EXTENSIONS } from "@/modules/itr/utils/itrDocumentUploadHelper";
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { ItrDocumentItem } from "../../types/itrFiling.types";
import {
  DocumentUploadModal,
  UploadedFileInfo,
} from "../DocumentUploadModal/DocumentUploadModal";
import { DocumentPreviewModal } from "../DocumentPreviewModal/DocumentPreviewModal";
import { styles } from "./Step4DocumentChecklist.styles";

interface Step4DocumentChecklistProps {
  isLoading?: boolean;
  isEditing?: boolean;
  documents: ItrDocumentItem[];
  onUpdateDocument: (docId: string, fileInfo: UploadedFileInfo | null) => void;
  onContinue: () => void;
  onUpdateAndContinue?: () => void;
}

export const Step4DocumentChecklist: React.FC<Step4DocumentChecklistProps> = ({
  isLoading = false,
  isEditing, 
  documents,
  onUpdateDocument,
  onContinue,
  onUpdateAndContinue,
}) => {
  const [activeUploadDoc, setActiveUploadDoc] = useState<ItrDocumentItem | null>(null);
  const [previewDoc, setPreviewDoc] = useState<ItrDocumentItem | null>(null);

  const requiredDocs = documents.filter((d) => d.tier === "REQUIRED");
  const recommendedDocs = documents.filter((d) => d.tier === "RECOMMENDED");
  const applicableDocs = documents.filter(
    (d) => d.tier === "ONLY_IF_APPLICABLE" || (!["REQUIRED", "RECOMMENDED"].includes(d.tier) && d.tier !== "NOT_REQUIRED")
  );

  const handleFilePicked = (file: UploadedFileInfo) => {
    if (!activeUploadDoc) return;
    onUpdateDocument(activeUploadDoc.id, file);
    setActiveUploadDoc(null);
  };

  const checkMandatoryDocuments = (): boolean => {
    const missingRequired = requiredDocs.filter((doc) => !doc.fileUri);
    if (missingRequired.length > 0) {
      const missingNames = missingRequired.map((d) => `• ${d.name}`).join("\n");
      Alert.alert(
        "Required Documents Missing",
        `Please upload the following mandatory documents before proceeding:\n\n${missingNames}`
      );
      return false;
    }
    return true;
  };

  const handleContinuePress = () => {
    if (checkMandatoryDocuments()) {
      onContinue();
    }
  };

  const handleUpdateAndContinuePress = () => {
    if (checkMandatoryDocuments()) {
      if (onUpdateAndContinue) {
        onUpdateAndContinue();
      } else {
        onContinue();
      }
    }
  };

  const renderDocCard = (doc: ItrDocumentItem) => {
    return (
      <SharedItrDocumentCard
        key={doc.id}
        allowedExtensions={[...ITR_ALLOWED_EXTENSIONS]}
        item={{
          id: doc.id,
          title: doc.name,
          subtitle: doc.profileVerifiedLabel || doc.subtitle,
          isMandatory: doc.required,
          status: doc.fileUri ? "uploaded" : "not_uploaded",
          fileUri: doc.fileUri,
          fileName: doc.fileName,
          fileSize: doc.fileSize,
          iconType: doc.iconName || "business_income",
        }}
        onUploadSuccess={(id: string, fileInfo: any) => {
          onUpdateDocument(id, fileInfo);
        }}
        onRemove={(id: string) => {
          onUpdateDocument(id, null);
        }}
      />
    );
  };

  return (
    <View style={styles.container}>
      {/* 1. Required Documents */}
      {requiredDocs.length > 0 && (
        <View style={styles.groupSection}>
          <View style={styles.groupHeader}>
            <Text style={styles.groupTitle}>Required Documents</Text>
            <View style={[styles.groupTag, styles.groupTagRequired]}>
              <Text style={styles.groupTagTextRequired}>Mandatory ({requiredDocs.length})</Text>
            </View>
          </View>
          <View style={styles.docsList}>{requiredDocs.map(renderDocCard)}</View>
        </View>
      )}

      {/* 2. Recommended Documents */}
      {recommendedDocs.length > 0 && (
        <View style={styles.groupSection}>
          <View style={styles.groupHeader}>
            <Text style={styles.groupTitle}>Recommended Documents</Text>
            <View style={[styles.groupTag, styles.groupTagRecommended]}>
              <Text style={styles.groupTagTextRecommended}>Recommended ({recommendedDocs.length})</Text>
            </View>
          </View>
          <View style={styles.docsList}>{recommendedDocs.map(renderDocCard)}</View>
        </View>
      )}

      {/* 3. Only If Applicable */}
      {applicableDocs.length > 0 && (
        <View style={styles.groupSection}>
          <View style={styles.groupHeader}>
            <Text style={styles.groupTitle}>Only If Applicable</Text>
            <View style={styles.groupTag}>
              <Text style={styles.groupTagText}>Optional ({applicableDocs.length})</Text>
            </View>
          </View>
          <View style={styles.docsList}>{applicableDocs.map(renderDocCard)}</View>
        </View>
      )}

      {/* 2 Distinct Buttons for Update (PUT) and Create (POST) */}
      {isEditing ? (
        /* Separate Button 1: Update & Continue (PUT Method) */
        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.continueButton}
          onPress={handleUpdateAndContinuePress}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Text style={styles.continueButtonText}>Update & Continue</Text>
              <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
            </>
          )}
        </TouchableOpacity>
      ) : (
        /* Separate Button 2: Continue (POST Method) */
        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.continueButton}
          onPress={handleContinuePress}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Text style={styles.continueButtonText}>Confirm & Continue to Review</Text>
              <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
            </>
          )}
        </TouchableOpacity>
      )}

      {/* Upload Modal */}
      {activeUploadDoc && (
        <DocumentUploadModal
          visible={Boolean(activeUploadDoc)}
          docTitle={activeUploadDoc.name}
          onFilePicked={handleFilePicked}
          onClose={() => setActiveUploadDoc(null)}
        />
      )}

      {/* Preview Modal */}
      {previewDoc && (
        <DocumentPreviewModal
          visible={Boolean(previewDoc)}
          document={previewDoc}
          onClose={() => setPreviewDoc(null)}
          onChangeFile={(doc) => {
            setPreviewDoc(null);
            setActiveUploadDoc(doc);
          }}
        />
      )}
    </View>
  );
};
