import { PickerDropPane } from "filestack-react";
import { fileStackKey } from "@crema/constants/AppConst";

const options = { container: "picker-container" };
const DNDPicker = () => {
  return (
    <div id="picker-container">
      <PickerDropPane
        pickerOptions={options}
        apikey={fileStackKey}
        onSuccess={(res) => console.log(res)}
        onUploadDone={(res) => console.log(res)}
      />
    </div>

    // <PickerDropPane
    //   apikey={fileStackKey}
    //   onSuccess={(res) => console.log(res)}
    //   onUploadDone={(res) => console.log(res)}
    // />
  );
};

export default DNDPicker;
