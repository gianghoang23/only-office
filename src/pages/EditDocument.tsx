import React, { useRef, useEffect, useContext } from "react";
import WebViewer, { WebViewerInstance } from "@pdftron/webviewer";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
const EditDocument = () => {
  const viewer = useRef<HTMLDivElement>(null);
  const instanceRef = useRef<WebViewerInstance>();
  const { targetFile, setTargetFile } = useContext(AppContext);
  const navigate = useNavigate();

  //define webviewer
  useEffect(() => {
    WebViewer.WebComponent(
      {
        path: "/webviewer/lib",
        enableOfficeEditing: true,
        loadAsPDF: true,
        licenseKey:
          "demo:1727425813883:7e35c6a80300000000a04db2b84ad65fc302d059a10b8e9974aff3ae1a",
      },
      viewer.current as HTMLDivElement
    ).then(async (instance) => {
      const { documentViewer } = instance.Core;
      instance.UI.setToolbarGroup(instance.UI.ToolbarGroup.EDIT);
      instance.UI.enableFeatures([instance.UI.Feature.ContentEdit]);
      const contentEditManager = documentViewer.getContentEditManager();
      contentEditManager.startContentEditMode();
      instance.UI.disableElements([
        "toolbarGroup-View",
        "toolbarGroup-Annotate",
        "toolbarGroup-Insert",
        "toolbarGroup-FillAndSign",
        "toolbarGroup-Forms",
        "toolbarGroup-Shapes",
        "toolbarGroup-Edit",
      ]);
      if (targetFile) {
        instance.UI.loadDocument(targetFile);
      }
      instanceRef.current = instance;
    });
  }, [targetFile]);

  const saveFile = async () => {
    if (instanceRef.current && targetFile) {
      const { documentViewer, annotationManager } = instanceRef.current.Core;
      const doc = documentViewer.getDocument();
      const xfdfString = await annotationManager.exportAnnotations();
      const data = await doc.getFileData({
        xfdfString,
      });
      const arr = new Uint8Array(data);
      const blob = new Blob([arr], { type: "application/office" });
      const newFile = new File([blob], targetFile.name, {
        type: "application/office",
      });
      setTargetFile(newFile);
      navigate("/");
    }
  };
  return (
    <div style={{ display: "flex", flexDirection: "row" }}>
      <div>
        <button onClick={() => navigate("/")}>Cancel</button>
        <button onClick={saveFile}>Save File</button>
      </div>
      <div style={{ width: "100%", height: "100vh" }} ref={viewer}></div>
    </div>
  );
};
export default EditDocument;
