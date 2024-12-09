import { useMemo, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { saveAs } from "file-saver";
import OnlyOfficeEditor from "./OnlyOfficeEditor";
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
  const fileUrl = "http://192.168.1.179:7002/translated_aimedical.docx";
  const mouseRef = useRef<any>();
  const connectorRef = useRef<any>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [originalText, setOriginalText] = useState<string>("");
  const fileRef = useRef("");
  const handleGetDocumentType = (docUrl: string) => {
    return docUrl.substring(docUrl.lastIndexOf(".") + 1);
  };

  const id = useMemo(() => uuidv4(), []);

  const getFile = async () => {
    saveAs(fileUrl, "Thisisapen.docx");
    return;
    if (isLoading) return;
    setIsLoading(true);
    // await axios
    //   .post("http://192.168.1.179:86/coauthoring/CommandService.ashx", {
    //     c: "forcesave",
    //     key: id,
    //   })
    console.log(Asc);
    connectorRef.current.executeMethod(
      "GetFileToDownload",
      ["docx"],
      function (fileUrl: string) {
        saveAs(fileUrl, "Thisisapen.docx");
      }
    );
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
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
          console.log(options);
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
                  const endOfSentenceSymbols = [
                    ".",
                    "!",
                    "?",
                    "。",
                    "\n",
                    "\r",
                    "\r\n",
                    "\t",
                  ];
                  const oDocument = Api.GetDocument();
                  let oRangeSelected = oDocument.GetRangeBySelect();
                  if (!oRangeSelected) {
                    oDocument.SelectCurrentWord();
                    oRangeSelected = oDocument.GetRangeBySelect();
                  }
                  oDocument.RemoveSelection();
                  const startContext = oRangeSelected.Start;
                  const endContext = oRangeSelected.End;
                  let i = 0;
                  let j = 0;
                  while (
                    !endOfSentenceSymbols.includes(
                      oDocument
                        .GetRange(startContext - i - 1, startContext - i)
                        .GetText(Asc.scope?.textCondition)
                    ) &&
                    startContext - i >= 0 &&
                    oDocument
                      .GetRange(startContext - i - 1, startContext - i)
                      .GetText(Asc.scope?.textCondition).length <= 1
                  ) {
                    console.log(
                      oDocument
                        .GetRange(startContext - i - 1, startContext - i)
                        .GetText(Asc.scope?.textCondition)
                    );
                    i++;
                    console.log(
                      oDocument
                        .GetRange(startContext - i - 1, startContext - i)
                        .GetText(Asc.scope?.textCondition)
                    );
                  }
                  while (
                    !endOfSentenceSymbols.includes(
                      oDocument
                        .GetRange(endContext + j, endContext + j + 1)
                        .GetText(Asc.scope.textCondition)
                    ) &&
                    !endOfSentenceSymbols.includes(
                      oDocument
                        .GetRange(endContext - 1, endContext)
                        .GetText(Asc.scope.textCondition)
                    ) &&
                    oDocument
                      .GetRange(endContext + j, endContext + j + 1)
                      .GetText(Asc.scope.textCondition).length <= 1
                  ) {
                    j++;
                  }

                  const cleanText = (text: string) =>
                    text.replace(/\n/g, "").replace(/\t/g, "");
                  const context = cleanText(
                    oDocument
                      .GetRange(startContext - i, endContext + j)
                      .GetText(Asc.scope.textCondition)
                  );
                  console.log(oRangeSelected.GetText(Asc.scope.textCondition));
                  const selectedText = cleanText(
                    oRangeSelected.GetText(Asc.scope.textCondition)
                  );
                  const extendedRange = context.split(selectedText);
                  console.log("hightlightRange:", {
                    start: oRangeSelected.Start - extendedRange[0].length,
                    end: oRangeSelected.End + extendedRange[1].length,
                  });
                  console.log(
                    oDocument
                      .GetRange(
                        oRangeSelected.Start - extendedRange[0].length,
                        oRangeSelected.End + extendedRange[1].length
                      )
                      .GetText(Asc.scope.textCondition)
                  );
                  oDocument
                    .GetRange(
                      oRangeSelected.Start - extendedRange[0].length,
                      oRangeSelected.End + extendedRange[1].length
                    )
                    .SetHighlight("yellow");
                });
                break;
              }
              case "xlsx": {
                connectorRef.current.callCommand(() => {
                  const oRange = Api.GetSelection();
                  oRange.SetFillColor(Api.CreateColorFromRGB(211, 211, 211));
                });

                break;
              }

              case "pptx": {
                connectorRef.current.callCommand(() => {
                  const oPresentation = Api.GetPresentation();
                  const oSlide = oPresentation.GetCurrentSlide();
                  const aShapes = oSlide.GetAllShapes();
                  for (const aShape of aShapes) {
                    const oDocContent = aShape.GetDocContent();
                    const aParagraphs = oDocContent.GetAllParagraphs();
                    for (const aPara of aParagraphs) {
                      const aParagraphs = aPara.GetText();
                      console.log(aParagraphs);
                      console.log("first");
                    }
                  }
                });

                break;
              }
              default:
                console.log("Invalid file type");
            }
            break;
          }
          case "onDoSomething":
            connectorRef.current.callCommand();

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

  return (
    <div style={{ display: "flex" }}>
      <div style={{ width: "80%", height: "100vh", position: "relative" }}>
        <OnlyOfficeEditor
          fileUrl={fileUrl}
          keyFile={id}
          fileName={"thisisapen"}
          fileType={handleGetDocumentType(fileUrl)}
          onDocumentReady={onDocumentReady}
          onLoadComponentError={() => onLoadComponentError}
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
          disabled={isLoading}
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
        <div className="relative group">
          <button className="px-4 py-2 bg-blue-500 text-white rounded">
            Hover me
          </button>
          <div className="invisible absolute left-1/2 -translate-x-1/2 mt-2 w-32 p-2 bg-gray-800 text-white text-sm rounded shadow-lg group-hover:visible">
            This is a tooltip
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full w-3 h-3 bg-gray-800 rotate-45" />
          </div>
        </div>
      </div>
    </div>
  );
}
