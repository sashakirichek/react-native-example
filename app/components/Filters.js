import SegmentedControl from "@react-native-segmented-control/segmented-control";
import { View } from "react-native";

const Filters = ({ onChange, sections }) => {
  return (
    <View>
      <SegmentedControl
        values={sections}
        selectedIndex={0}
        onChange={(event) => {
          onChange(event.nativeEvent.selectedSegmentIndex);
        }}
      />
    </View>
  );
};

export default Filters;
