import { CustomPicker } from "react-color";
import { Alpha } from "react-color/lib/components/common";
import MyPointer from "./MyPointer";

type MyPickerProps = {
  onChangeComplete: (color: any) => void;
  color: string;
};
export const MyPicker = ({ color, onChangeComplete }: MyPickerProps) => {
  return (
    <div style={{ height: 40, width: "80%", position: "relative" }}>
      <Alpha
        color={color}
        // rgb={rgb}
        // hsl={hsl}
        onChange={onChangeComplete}
        pointer={<MyPointer />}
      />
    </div>
  );
};

export default CustomPicker(MyPicker);
