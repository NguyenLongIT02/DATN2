import MyPicker from "./MyPicker";

const CustomPointer = () => {
  const handleColorChange = ({ hex }: any) => console.log(hex);

  return <MyPicker color="coral" onChangeComplete={handleColorChange} />;
};

export default CustomPointer;
