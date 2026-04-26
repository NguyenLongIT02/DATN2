import { useDropzone } from "react-dropzone";

const SpecificFileTypes = () => {
  const { acceptedFiles, fileRejections, getRootProps, getInputProps } =
    useDropzone({
      accept: {
        "image/jpeg": [],
        "image/png": [],
      },
    });

  const acceptedFilesItems =
    acceptedFiles &&
    acceptedFiles.map((file: any) => (
      <li key={file.path}>
        {file.path} - {file.size} bytes
      </li>
    ));

  const rejectedFilesItems =
    fileRejections &&
    fileRejections.map((file: any) => (
      <li key={file.path}>
        {file.path} - {file.size} bytes
      </li>
    ));

  return (
    <section className="container">
      <div {...getRootProps({ className: "dropzone" })}>
        <input {...getInputProps()} />
        <p>Drag n drop some files here, or click to select files</p>
        <em>(Only *.jpeg and *.png images will be accepted)</em>
      </div>
      <aside>
        <h4>Accepted files</h4>
        <ul>{acceptedFilesItems}</ul>
        <h4>Rejected files</h4>
        <ul>{rejectedFilesItems}</ul>
      </aside>
    </section>
  );
};
export default SpecificFileTypes;
