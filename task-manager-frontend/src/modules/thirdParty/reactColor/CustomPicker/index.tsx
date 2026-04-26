import MyPicker from "./MyPicker";

export const CustomPicker = () => {
  const handleColorChange = ({ hex }: any) => console.log(hex);

  return <MyPicker color="orange" onChangeComplete={handleColorChange} />;
};

export default CustomPicker;
