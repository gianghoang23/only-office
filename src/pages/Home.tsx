import { DocumentEditor } from "@onlyoffice/document-editor-react";
import { useRef } from "react";

import { v4 as uuidv4 } from "uuid";
import { saveAs } from "file-saver";
import axios from "axios";
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
  const fileUrl = "http://192.168.1.179:7002/Thisisapen.docx";

  const connectorRef = useRef<any>();

  const handleGetDocumentType = (docUrl: string) => {
    return docUrl.substring(docUrl.lastIndexOf(".") + 1);
  };

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
    // add option to context menu
    connectorRef.current.attachEvent(
      "onContextMenuShow",
      function (options: { type: string }) {
        if (!options) return;
        if (options.type) {
          connectorRef.current.executeMethod("AddContextMenuItem", [
            {
              guid: connectorRef.current.guid,
              items: [
                {
                  id: "onRemoveSelected",
                  text: "Remove selected content",
                },
                {
                  id: "onDoSomething",
                  text: "Do something",
                },
                {
                  id: "onDisplayBeforeTranslation",
                  text: "Display before translation",
                },
              ],
            },
          ]);
        }
      }
    );

    // attach event handler to custom context menu item

    connectorRef.current.attachEvent(
      "onContextMenuClick",
      function (id: string) {
        switch (id) {
          case "onDisplayBeforeTranslation": {
            const fileType = handleGetDocumentType(fileUrl);
            Asc.scope = {
              fileType,
              connectorRef: connectorRef.current,
              textCondition: {
                Numbering: true,
                Math: true,
                NewLineSeparator: "\r",
                TabSymbol: "\t",
                NewLineParagraph: true,
                TableCellSeparator: "\t",
                TableRowSeparator: "\r\n",
                ParaSeparator: "\r\n",
              },
            };

            switch (fileType) {
              case "docx": {
                connectorRef.current.callCommand(() => {
                  const oDocument = Api.GetDocument();
                  console.log(oDocument);
                  const oRangeSelected = oDocument.GetRangeBySelect();
                  const selectedText = oRangeSelected.GetText(
                    Asc.scope.textCondition
                  );
                  const oRangeSentence = oDocument.GetRange(
                    oRangeSelected.Start - 20 > 0
                      ? oRangeSelected.Start - 20
                      : 0,
                    oRangeSelected.End
                  );
                  const sentenceText = oRangeSentence.GetText(
                    Asc.scope.textCondition
                  );
                  oRangeSentence.SetHighlight("lightGray");

                  console.log(selectedText);
                  console.log(sentenceText);
                });
                break;
              }
              case "xlsx": {
                connectorRef.current.callCommand(() => {
                  const oWorksheet = Api.GetActiveSheet();
                  const oRange = oWorksheet.GetRange("B1");
                  const oCharacters = oRange.GetCharacters();
                  const oFont = oCharacters.GetFont();
                  const oColor = Api.CreateColorFromRGB(26, 171, 127);
                  oFont.SetColor(oColor);
                });
                break;
              }

              case "pptx": {
                connectorRef.current.callCommand(() => {
                  const oPresentation = Api.GetPresentation();
                });

                break;
              }
              default:
                console.log("Invalid file type");
            }
            break;
          }
          case "onDoSomething":
            connectorRef.current.executeMethod("InputText", [
              "clicked on Do something",
            ]);
            break;
          default:
            console.log(id);
        }
      }
    );

    // connectorRef.current.attachEvent(
    //   "onEnableMouseEvent",
    //   function (isEnable: boolean) {
    //     console.log(isEnable);
    //     const _frames = document.getElementsByTagName("iframe");
    //     if (_frames && _frames[0]) {
    //       _frames[0].style.pointerEvents = isEnable ? "auto" : "none";
    //     }
    //   }
    // );
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
          documentServerUrl="http://172.21.16.1:86/"
          config={{
            document: {
              fileType: handleGetDocumentType(fileUrl),
              key: id,
              title: "Example Document Title",
              url: fileUrl,
            },
            editorConfig: {
              user: {
                id: id,
                name: "User",
              },
              customization: {
                compactToolbar: true,
                hideRulers: true,
                hideRightMenu: true,
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
