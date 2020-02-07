import React, { Fragment, useState } from "react";
import axios from "axios";
import { saveAs } from "file-saver";
const xlsx = require("xlsx");

export default function FileUpload(props) {
  const [file, setFile] = useState("");
  const [filename, setFilename] = useState("Choose File");
  const [conversionType, setConversionType] = useState(true);
  const [conversionApiPath, setConversionApiPath] = useState("/excelToJson");
  const [downloadApiPath, setDownloadApiPath] = useState("/downloadJson");
  const [showDownloadBtn, setShowDownloadBtn] = useState(false);

  const onFileChange = e => {
    if (e.target.files[0] !== undefined) {
      setShowDownloadBtn(false);
      setFile(e.target.files[0]);
      setFilename(e.target.files[0].name);
    } else {
      setFilename("Choose File");
    }
  };

  const selectionChange = type => {
    const returnValue = conversionType ? false : true;
    setShowDownloadBtn(false);
    setConversionType(returnValue);
    setFilename("Choose File");
    switch (type) {
      case "toJson":
        setConversionApiPath("/excelToJson");
        setDownloadApiPath("/downloadJson");
        break;
      case "toXlsx":
        setConversionApiPath("/jsonToExcel");
        setDownloadApiPath("/downloadExcel");
        break;
      default:
        setConversionApiPath("/excelToJson");
        setDownloadApiPath("/downloadJson");
        break;
    }
  };

  const onSubmit = async event => {
    event.preventDefault();
    const formData = new FormData();
    formData.append("docs", file);
    try {
      const res = await axios.post(
        `${props.apiUrl}${conversionApiPath}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        }
      );
      window.alert(res.data.message);
      setShowDownloadBtn(true);
    } catch (error) {
      window.alert("Server responded with an error");
    }
  };

  const download = async () => {
    const formData = new FormData();
    let blob;
    formData.append("filename", filename);
    const res = await axios.post(
      `${props.apiUrl}${downloadApiPath}`,
      formData,
      {
        headers: {
          "Content-Type": "application/json"
        }
      }
    );
    if (downloadApiPath === "/downloadJson") {
      blob = new Blob([JSON.stringify(res.data)], {
        type: "application/json,"
      });
      saveAs(blob, `${filename.split(".")[0]}.json`);
    } else if (downloadApiPath === "/downloadExcel") {
      const keys = Object.keys(res.data);
      keys.forEach(item => {
        const jsonData = res.data[item];
        const newWb = xlsx.utils.book_new();
        const newWs = xlsx.utils.json_to_sheet(jsonData);
        xlsx.utils.book_append_sheet(newWb, newWs, item);
        xlsx.writeFileSync(newWb, `${filename.split(".")[0]}.xlsx`);
      });
    }
  };

  let button;
  if (showDownloadBtn) {
    const buttonTitle = conversionType
      ? `Download ${filename.split(".")[0]}.json`
      : `Download ${filename.split(".")[0]}.xlsx`;
    button = (
      <input
        type="submit"
        value={buttonTitle}
        className="btn btn-primary btn-block mt-4"
        onClick={() => {
          download();
        }}
      ></input>
    );
  }

  return (
    <Fragment>
      <form onSubmit={onSubmit}>
        <div className="custom-file">
          <input
            type="file"
            onChange={onFileChange}
            className="custom-file-input"
            id="customFile"
          />
          <label className="custom-file-label" htmlFor="customFile">
            {filename}
          </label>
        </div>
        <div className="mt-2">
          <input
            type="radio"
            checked={conversionType}
            value={conversionType}
            onChange={() => selectionChange("toJson")}
          />{" "}
          Excel -> Json
          <input
            className="ml-5"
            type="radio"
            value={!conversionType}
            checked={!conversionType}
            onChange={() => selectionChange("toXlsx")}
          />{" "}
          Json -> Excel
        </div>
        <input
          type="submit"
          value="Convert"
          className="btn btn-primary btn-block mt-4"
        ></input>
      </form>
      {button}
    </Fragment>
  );
}
