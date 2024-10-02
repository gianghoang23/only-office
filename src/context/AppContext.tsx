import {
  createContext,
  Dispatch,
  SetStateAction,
  useMemo,
  useState,
} from "react";

type AppContextProps = {
  targetFile?: File;
  setTargetFile: Dispatch<SetStateAction<File | undefined>>;
};
export const AppContext = createContext<AppContextProps>({
  targetFile: undefined,
  setTargetFile: () => {},
});

export const AppDataProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [targetFile, setTargetFile] = useState<File>();

  const contextValue = useMemo(
    () => ({ targetFile, setTargetFile }),
    [targetFile]
  );
  return (
    <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
  );
};
