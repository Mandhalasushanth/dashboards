import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { DocumentUploadBottomSheet } from '@/shared/components/DocumentUploadBottomSheet';
import { DocumentPreviewModal, type PreviewDocumentItem } from '@/shared/components/documents/DocumentPreviewModal';
import { CompanySectionCard } from '../CompanySectionCard/CompanySectionCard';
import type { CompanyDetails } from '../../types/company.types';
import { getErrorMessage } from '@/core/error-handling/errorMessage';
import { styles } from './StepRegisteredOffice.styles';

export type OfficeDocKey = 'proof' | 'ownership' | 'noc';

export interface RegisteredOfficeDocumentsCardProps {
  ownership?: 'Rented' | 'Owned' | 'Leased';
  company: Partial<CompanyDetails>;
  fieldErrors: Record<string, string>;
  onDocumentUploaded: (key: OfficeDocKey, fileUri: string, fileName: string) => void;
  onDocumentRemoved: (key: OfficeDocKey) => void;
}

interface DocSlotConfig {
  key: OfficeDocKey;
  title: string;
  helper: string;
  name?: string;
  uri?: string;
  errorKey: string;
}

export const RegisteredOfficeDocumentsCard: React.FC<RegisteredOfficeDocumentsCardProps> = ({
  ownership,
  company,
  fieldErrors,
  onDocumentUploaded,
  onDocumentRemoved,
}) => {
  const [activeSlot, setActiveSlot] = useState<DocSlotConfig | null>(null);
  const [previewItem, setPreviewItem] = useState<PreviewDocumentItem | null>(null);

  if (!ownership) {
    return (
      <CompanySectionCard
        iconName="document-attach-outline"
        title="Premises Documents"
        description="Premises documents are displayed based on selected ownership status."
      >
        <View style={styles.infoBoxContainer}>
          <Ionicons name="information-circle-outline" size={18} color="#0369A1" style={styles.infoIcon} />
          <Text style={styles.infoNote}>
            Please select premises ownership status (Rented, Owned, or Leased) above to view required documents.
          </Text>
        </View>
      </CompanySectionCard>
    );
  }

  const docSlots: DocSlotConfig[] = [];

  // 1. Ownership / Rent / Lease document
  if (ownership === 'Rented') {
    docSlots.push({
      key: 'ownership',
      title: 'Rent Agreement *',
      helper: 'Mandatory rent agreement signed with premises owner.',
      name: company.ownershipDocName,
      uri: company.ownershipDocUri,
      errorKey: 'ownershipDoc',
    });
  } else if (ownership === 'Leased') {
    docSlots.push({
      key: 'ownership',
      title: 'Lease Agreement *',
      helper: 'Mandatory registered/notarized lease deed.',
      name: company.ownershipDocName,
      uri: company.ownershipDocUri,
      errorKey: 'ownershipDoc',
    });
  } else if (ownership === 'Owned') {
    docSlots.push({
      key: 'ownership',
      title: 'Ownership Proof *',
      helper: 'Sale deed, conveyance deed, or municipal tax receipt.',
      name: company.ownershipDocName,
      uri: company.ownershipDocUri,
      errorKey: 'ownershipDoc',
    });
  }

  // 2. Owner NOC (required only for Rented & Leased)
  if (ownership === 'Rented' || ownership === 'Leased') {
    docSlots.push({
      key: 'noc',
      title: 'Owner NOC *',
      helper: 'No Objection Certificate signed by the premises owner.',
      name: company.ownerNocName,
      uri: company.ownerNocUri,
      errorKey: 'ownerNoc',
    });
  }

  // 3. Office Address Proof / Utility Bill
  docSlots.push({
    key: 'proof',
    title: 'Office Address Proof / Utility Bill *',
    helper: 'Electricity, water, or telephone bill (not older than 2 months).',
    name: company.officeAddressProofName,
    uri: company.officeAddressProofUri,
    errorKey: 'officeAddressProof',
  });

  const handlePickFiles = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/jpeg', 'image/png'],
        copyToCacheDirectory: true,
      });
      if (!res.canceled && res.assets && res.assets.length > 0) {
        const asset = res.assets[0];
        if (asset.size && asset.size > 5 * 1024 * 1024) {
          Alert.alert('File Too Large', 'Please select a file smaller than 5 MB.');
          return;
        }
        const name = asset.name || 'document.pdf';
        const lower = name.toLowerCase();
        if (!lower.endsWith('.pdf') && !lower.endsWith('.jpg') && !lower.endsWith('.jpeg') && !lower.endsWith('.png')) {
          Alert.alert('Unsupported Format', 'Please upload a PDF, JPG, or PNG document.');
          return;
        }
        if (activeSlot) {
          onDocumentUploaded(activeSlot.key, asset.uri, name);
          setActiveSlot(null);
        }
      }
    } catch (e) {
      Alert.alert('Upload Error', getErrorMessage(e) || 'Failed to select document.');
    }
  };

  const handlePickGallery = async () => {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert('Permission Required', 'Please allow gallery access to select document image.');
        return;
      }
      const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8 });
      if (!res.canceled && res.assets && res.assets.length > 0) {
        const asset = res.assets[0];
        const name = asset.fileName || `document_${Date.now()}.jpg`;
        if (activeSlot) {
          onDocumentUploaded(activeSlot.key, asset.uri, name);
          setActiveSlot(null);
        }
      }
    } catch (e) {
      Alert.alert('Upload Error', getErrorMessage(e) || 'Failed to select image from gallery.');
    }
  };

  const handleTakePhoto = async () => {
    try {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) {
        Alert.alert('Permission Required', 'Please allow camera access to photograph document.');
        return;
      }
      const res = await ImagePicker.launchCameraAsync({ quality: 0.8 });
      if (!res.canceled && res.assets && res.assets.length > 0) {
        const asset = res.assets[0];
        const name = asset.fileName || `camera_${Date.now()}.jpg`;
        if (activeSlot) {
          onDocumentUploaded(activeSlot.key, asset.uri, name);
          setActiveSlot(null);
        }
      }
    } catch (e) {
      Alert.alert('Upload Error', getErrorMessage(e) || 'Failed to take photo.');
    }
  };

  return (
    <>
      <CompanySectionCard
        iconName="document-attach-outline"
        title="Premises Documents"
        description={`Upload required statutory documents for ${ownership} premises.`}
      >
        {docSlots.map((slot) => {
          const isUploaded = !!slot.uri;
          const err = fieldErrors[slot.errorKey];

          return (
            <View key={slot.key} style={styles.fieldGroup}>
              <Text style={styles.label}>{slot.title}</Text>
              {!isUploaded ? (
                <TouchableOpacity
                  style={[styles.uploadBoxEmpty, !!err && styles.inputError]}
                  onPress={() => setActiveSlot(slot)}
                  activeOpacity={0.8}
                >
                  <View style={styles.fileLeftInfo}>
                    <Ionicons name="cloud-upload-outline" size={20} color={err ? '#EF4444' : '#FF8A00'} />
                    <Text style={[styles.uploadEmptyText, !!err && { color: '#EF4444' }]}>Tap to Upload Document</Text>
                  </View>
                </TouchableOpacity>
              ) : (
                <View style={styles.uploadBoxSuccess}>
                  <TouchableOpacity
                    style={styles.fileLeftInfo}
                    onPress={() => {
                      if (slot.name && slot.uri) {
                        setPreviewItem({
                          id: slot.key,
                          name: slot.name,
                          fileUri: slot.uri,
                          fileName: slot.name,
                          required: true,
                        });
                      }
                    }}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="document-text" size={20} color="#15803D" />
                    <Text style={styles.uploadSuccessText} numberOfLines={1}>{slot.name}</Text>
                  </TouchableOpacity>
                  <View style={styles.fileRightActions}>
                    <TouchableOpacity
                      onPress={() => onDocumentRemoved(slot.key)}
                      style={styles.removeBtn}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Ionicons name="trash-outline" size={18} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                </View>
              )}
              {!!err && <Text style={styles.errorText}>{err}</Text>}
              <Text style={styles.helperText}>{slot.helper}</Text>
            </View>
          );
        })}
      </CompanySectionCard>

      <DocumentUploadBottomSheet
        visible={!!activeSlot}
        documentTitle={activeSlot?.title.replace('*', '').trim() || 'Document'}
        onClose={() => setActiveSlot(null)}
        onCancel={() => setActiveSlot(null)}
        onPickFiles={handlePickFiles}
        onPickGallery={handlePickGallery}
        onTakePhoto={handleTakePhoto}
      />

      <DocumentPreviewModal
        visible={!!previewItem}
        document={previewItem}
        onClose={() => setPreviewItem(null)}
        onChangeFile={(doc) => {
          setPreviewItem(null);
          const found = docSlots.find((s) => s.key === doc.id);
          if (found) setActiveSlot(found);
        }}
      />
    </>
  );
};
