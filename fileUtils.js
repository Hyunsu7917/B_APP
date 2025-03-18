import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import { Platform } from "react-native";
import * as XLSX from "xlsx";

/**
 * 파일 선택 및 읽기 함수
 */
export const pickFile = async (setMagnetData, magnetName) => {
    try {
        if (Platform.OS === "web") {
            // 🌐 웹 환경: input 요소를 사용하여 파일 선택
            const input = document.createElement("input");
            input.type = "file";
            input.accept = ".xlsx";

            return new Promise((resolve) => {
                input.onchange = async (event) => {
                    const file = event.target.files[0];
                    if (!file) {
                        console.error("❌ 선택된 파일이 없습니다.");
                        resolve(null);
                        return;
                    }

                    // 파일 읽기
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        const data = new Uint8Array(e.target.result);
                        const workbook = XLSX.read(data, { type: "array" });
                        processExcelData(workbook, magnetName, setMagnetData);
                        resolve(workbook);
                    };
                    reader.readAsArrayBuffer(file);
                };
                input.click();
            });
        } else {
            // 📱 React Native (Expo) 환경: expo-document-picker 사용
            const result = await DocumentPicker.getDocumentAsync({
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                copyToCacheDirectory: true,
            });

            if (result.canceled) {
                console.log("❌ 파일 선택 취소됨");
                return null;
            }

            console.log("📂 모바일에서 선택한 파일:", result);

            // 파일 경로에서 데이터를 읽어오기
            const fileUri = result.uri;
            const fileContent = await FileSystem.readAsStringAsync(fileUri, { encoding: FileSystem.EncodingType.Base64 });

            // 바이너리 데이터를 ArrayBuffer로 변환
            const binaryData = Buffer.from(fileContent, "base64");
            const workbook = XLSX.read(binaryData, { type: "buffer" });

            processExcelData(workbook, magnetName, setMagnetData);
            return workbook;
        }
    } catch (error) {
        console.error("❌ 파일 선택 중 오류 발생:", error);
        return null;
    }
};
