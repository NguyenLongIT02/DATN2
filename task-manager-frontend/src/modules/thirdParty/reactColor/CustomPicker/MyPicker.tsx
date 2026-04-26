import { CSSProperties } from "react";

import { CustomPicker } from "react-color";
import { EditableInput, Hue } from "react-color/lib/components/common";

type MyPickerProps = {
  onChangeComplete: (color: any) => void;
  color: string;
};

export const MyPicker = ({ color, onChangeComplete }: MyPickerProps) => {
  const styles = {
    hue: {
      height: 10,
      position: "relative",
      marginBottom: 10,
    },
    input: {
      height: 38,
      border: `1px solid ${color}`,
      paddingLeft: 10,
    },
    swatch: {
      width: 40,
      height: 38,
      background: color,
    },
  };
  return (
    <div>
      <div style={styles.hue as CSSProperties}>
        <Hue color={color} onChange={onChangeComplete} />
      </div>

      <div style={{ display: "flex" }}>
        <EditableInput
          style={{ input: styles.input }}
          value={color}
          onChange={onChangeComplete}
        />
        <div style={styles.swatch} />
      </div>
    </div>
  );
};

export default CustomPicker(MyPicker);
