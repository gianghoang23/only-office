import { DocumentEditor } from "@onlyoffice/document-editor-react";
import { useEffect, useRef } from "react";

import { v4 as uuidv4 } from "uuid";
import { saveAs } from "file-saver";
const onLoadComponentError = function (
  errorCode: number,
  errorDescription: string
) {
  switch (errorCode) {
    case -1: // Unknown error loading component
      console.log(errorDescription);
      break;

    case -2: // Error load DocsAPI from http://documentserver/
      console.log(errorDescription);
      break;

    case -3: // DocsAPI is not defined
      console.log(errorDescription);
      break;
  }
};

export default function App() {
  const connectorRef = useRef<any>();
  const iframeRef = useRef(null);
  const getFile = () => {
    connectorRef.current.executeMethod(
      "GetFileToDownload",
      ["docx"],
      async function (fileUrl: string) {
        console.log(fileUrl);

        try {
          saveAs(fileUrl, "Thisisapen.docx");
        } catch (error) {
          console.error("Error downloading the file", error);
        }
      }
    );
  };

  const replaceText = () => {
    connectorRef.current.executeMethod("RemoveSelectedContent");
    return;
    connectorRef.current.executeMethod("SearchAndReplace", [
      {
        searchString: "This is a pen.",
        replaceString: "text2",
        matchCase: true,
      },
    ]);
  };

  const onDocumentReady = () => {
    const editor = window.DocEditor.instances["docxEditor"];
    const connector = editor.createConnector();
    connectorRef.current = connector;
    console.log(connectorRef.current);
    // add option to context menu
    connectorRef.current.attachEvent(
      "onContextMenuShow",
      function (options: { type: string }) {
        if (!options) return;
        if (options.type === "Selection") {
          connectorRef.current.executeMethod("AddContextMenuItem", [
            {
              guid: connectorRef.current.guid,
              items: [
                {
                  id: "onClickCustomItem",
                  text: "Do something",
                },
              ],
            },
          ]);
        }
      }
    );

    // attach event handler to custom context menu item

    connectorRef.current.attachContextMenuClickEvent(
      "onClickCustomItem",
      function () {
        // !currently not working
        console.log("onClickCustomItem");
        connectorRef.current.executeMethod("InputText", [
          "clicked: onClickItem2",
        ]);
      }
    );
  };
  const getSelectedText = async () => {
    connectorRef.current.executeMethod(
      "GetSelectedText",
      [],
      function (selectedText: string) {
        console.log(selectedText);
      }
    );
  };

  const id = uuidv4();

  return (
    <div style={{ display: "flex" }}>
      <div style={{ width: "80%", height: "100vh", position: "relative" }}>
        <DocumentEditor
          id="docxEditor"
          documentServerUrl="http://172.21.16.1:82/"
          config={{
            document: {
              fileType: "docx",
              key: id,
              title: "Example Document Title",
              url: "http://192.168.1.179:7002/Pat01_JE.docx",
            },
            editorConfig: {
              plugins: {},
              user: {
                id: id,
                name: "User",
              },
              customization: {
                compactToolbar: true,
                hideRulers: true,
                features: {
                  spellcheck: {
                    mode: false,
                  },
                },
              },
            },
          }}
          events_onDocumentReady={onDocumentReady}
          onLoadComponentError={onLoadComponentError}
        />

        {/* {
          <div
            style={{
              width: "100%",
              height: "50px",
              background: "#7e22ce",
              position: "absolute",
              top: 0,
            }}
          ></div>
        } */}
      </div>

      <div style={{ width: "20%" }}>
        <button
          style={{ background: "royalBlue", color: "white", margin: "30px" }}
          onClick={getFile}
        >
          Download Document
        </button>
        <button onClick={getSelectedText}>Get Selected text</button>

        <button
          onClick={() => {
            connectorRef.current.executeMethod("InputText", [
              "ONLYOFFICE Plugins",
              "ONLYOFFICE for developers",
            ]);
          }}
        >
          Click
        </button>
      </div>
    </div>
  );
}
