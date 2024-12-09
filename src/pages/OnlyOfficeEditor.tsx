import { DocumentEditor } from "@onlyoffice/document-editor-react";
import { memo } from "react";

type OnlyOfficeEditorProps = {
  fileUrl: string;
  keyFile: string;
  fileName: string;
  fileType: string;
  onDocumentReady: () => void;
  onLoadComponentError: () => void;
};
function OnlyOfficeEditor({
  fileUrl,
  fileType,
  keyFile,
  fileName,
  onDocumentReady,
  onLoadComponentError,
}: OnlyOfficeEditorProps) {
  return (
    <DocumentEditor
      id="docxEditor"
      documentServerUrl={'http://localhost:86/'}
      config={{
        document: {
          fileType,
          key: keyFile,
          title: fileName,
          url: fileUrl,
        },
        editorConfig: {
          plugins: {},
          user: {
            id: keyFile,
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
  );
}

export default memo(OnlyOfficeEditor);
