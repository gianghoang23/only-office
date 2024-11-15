import { DocumentEditor } from "@onlyoffice/document-editor-react";
import { useEffect, useRef, useState } from "react";

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
  const fileUrl =
    "http://192.168.1.179:7002/result_ef Description of the Drawings_30_53_transed.docx";
  const mouseRef = useRef<any>();
  const connectorRef = useRef<any>();
  const [originalText, setOriginalText] = useState<string>("");
  useEffect(() => {
    window.addEventListener("message", function (event) {
      if (event.data.type === "mousePosition") {
        const mouseX = event.data.x;
        const mouseY = event.data.y;
        console.log(
          `Mouse position received from iframe: X: ${mouseX}, Y: ${mouseY}`
        );
      }
    });
  }, []);

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

  const onDocumentReady = () => {
    const editor = window.DocEditor.instances["docxEditor"];
    const connector = editor.createConnector();
    connectorRef.current = connector;
    console.log(connector);
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
                  const endOfSentenceSymbols = [".", "!", "?", "。", "\r\n"];
                  const oDocument = Api.GetDocument();
                  const oRangeSelected = oDocument.GetRangeBySelect();
                  console.log(oRangeSelected);
                  const startSentence = oRangeSelected.Start;
                  const endSentence = oRangeSelected.End;
                  let i = 0;
                  let j = 0;
                  while (
                    !endOfSentenceSymbols.includes(
                      oDocument
                        .GetRange(startSentence - i, startSentence - i + 1)
                        .GetText(Asc.scope.textCondition)
                    ) &&
                    startSentence - i > 0
                  ) {
                    // console.log(
                    //   oDocument
                    //     .GetRange(startSentence - i, startSentence - i + 1)
                    //     .GetText(Asc.scope.textCondition) === "\r\n"
                    // );
                    i++;
                  }
                  while (
                    !endOfSentenceSymbols.includes(
                      oDocument
                        .GetRange(endSentence + j, endSentence + j + 1)
                        .GetText(Asc.scope.textCondition)
                    ) &&
                    !endOfSentenceSymbols.includes(
                      oDocument
                        .GetRange(endSentence - 1, endSentence)
                        .GetText(Asc.scope.textCondition)
                    )
                  ) {
                    j++;
                  }
                  oDocument
                    .GetRange(
                      startSentence - i >= 0 ? startSentence - i : 0,
                      endSentence + j
                    )
                    .SetHighlight("lightGray");
                });
                break;
              }
              case "xlsx": {
                connectorRef.current.executeMethod(
                  "GetSelectedText",
                  [],
                  function (selectedText: string) {
                    Asc.scope.selectedText = selectedText;
                    connectorRef.current.callCommand(() => {
                      const oRange = Api.GetSelection();
                      console.log(Asc.scope.selectedText);
                      console.log(oRange.Value);
                      const oRange2 = Api.GetRange("A1:C1");
                      console.log(oRange2);
                    });
                  }
                );

                break;
              }

              case "pptx": {
                connectorRef.current.callCommand(() => {
                  const oPresentation =
                    connectorRef.current.Api.GetPresentation();
                });

                break;
              }
              default:
                console.log("Invalid file type");
            }
            break;
          }
          case "onDoSomething":
            connectorRef.current.callCommand(
              async () => {
                const result = 3;
                console.log(result);
                return { data: result };
              },
              (result: any) => {
                console.log(result);
              }
            );

            break;

          case "onRemoveSelected":
            console.log(Asc);
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
          documentServerUrl="http://localhost:86/"
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

      <div style={{ width: "20%" }} id="left-content">
        <canvas
          id="myCanvas"
          width="500"
          height="500"
          style={{ border: "1px solid black" }}
        ></canvas>

        <button
          style={{ background: "royalBlue", color: "white", margin: "30px" }}
          onClick={getFile}
        >
          Download Document
        </button>
        <button onClick={getSelectedText}>Get Selected text</button>
        <button
          onClick={() => {
            connectorRef.current.executeMethod(
              "GetCurrentSentence",
              ["entirely"],
              function (res: string) {
                console.log(res);
              }
            );
          }}
        >
          Get Current Sentence
        </button>
        <button
          onClick={() => {
            connectorRef.current.executeMethod("MouseMoveWindow", [
              connectorRef.current.editorInfo.guid,
              70,
              40,
            ]);
          }}
        >
          Mouse Move
        </button>
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
