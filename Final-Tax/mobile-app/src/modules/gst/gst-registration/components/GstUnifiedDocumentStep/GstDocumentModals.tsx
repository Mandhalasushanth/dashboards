import React from "react";
import { View, Text, TouchableOpacity, Modal } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { BrandColors } from "@/shared/theme";
import { modalStyles as styles } from "./GstDocumentModals.styles";

interface AddressProofModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (proof: string) => void;
  currentValue?: string;
}

const ADDRESS_PROOF_TYPES = [
  "Rental Agreement",
  "Ownership Proof",
  "Electricity Bill",
  "Other Address Proof",
];

export const AddressProofSelectModal: React.FC<AddressProofModalProps> = ({
  visible,
  onClose,
  onSelect,
  currentValue,
}) => {
  return !visible ? null : (
    <Modal
      visible={true}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.selectModalOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.selectModalContent}>
          <Text style={styles.selectModalTitle}>Select Address Proof</Text>
          {ADDRESS_PROOF_TYPES.map((proof) => (
            <TouchableOpacity
              key={proof}
              style={styles.selectModalOption}
              onPress={() => {
                onSelect(proof);
                onClose();
              }}
            >
              <Text style={styles.selectModalOptionText}>{proof}</Text>
              {currentValue === proof && (
                <Ionicons
                  name="checkmark"
                  size={18}
                  color={BrandColors.PRIMARY_BLUE}
                />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </TouchableOpacity>
    </Modal>
  );
};
