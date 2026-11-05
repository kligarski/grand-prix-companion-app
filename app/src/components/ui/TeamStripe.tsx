import { StyleSheet, View } from "react-native";

type Props = {
  color: string;
};

export function TeamStripe({ color }: Props) {
  return <View style={[styles.stripe, { backgroundColor: color }]} />;
}

const styles = StyleSheet.create({
  stripe: {
    width: 4,
    height: 18,
    borderRadius: 2,
  },
});
