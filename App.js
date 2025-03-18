import React, { useState, useEffect } from "react";
import { Text, View, TouchableOpacity, StyleSheet, StatusBar, ScrollView, Platform } from "react-native"; // ✅ 여기 포함됨!
import { Asset } from "expo-asset";
import * as FileSystem from "expo-file-system";
import * as XLSX from "xlsx";
import api from './api'; // 🔥 여기서 올바르게 import해야 함!
import { Alert } from 'react-native';
import * as Updates from "expo-updates";
import axios from 'axios';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Buffer } from "buffer";  // 🔥 `react-native-quick-base64` 대신 `buffer` 사용
import * as DocumentPicker from "expo-document-picker";
import { pickFile } from './fileUtils'; // 파일 경로 확인 필요

const username = "BBIOK";
const password = "Bruker_2025";
const encodedAuth = Buffer.from(`${username}:${password}`).toString("base64");  // 🔥 수정됨!


console.log("📂 FileSystem 모듈:", FileSystem);

const FILE_URL = "https://bkh-app.onrender.com/download/site.xlsx"; // 🔥 인증이 필요한 경로로 수정

const checkFileInfo = async () => {
  if (Platform.OS === "web") {
      console.warn("⚠️ 웹 환경에서는 파일 정보를 확인할 수 없습니다.");
      return;  // 웹에서는 실행되지 않도록 차단
  }

  try {
      const fileInfo = await FileSystem.getInfoAsync(FILE_PATH);
      console.log("📂 저장된 파일 정보:", fileInfo);
      
      if (!fileInfo.exists || fileInfo.size < 1000) {
      console.error("❌ 다운로드된 파일이 손상됨! (파일 크기 너무 작음)");
    }
    
  } catch (error) {
      console.error("❌ 파일 정보 가져오기 실패:", error);
  }
};
if (Platform.OS !== "web") {
  checkFileInfo();
}
console.log("📢 현재 디바이스 정보:", Device);
console.log("📢 Expo Notifications 지원 여부:", Notifications);

const testDownload = async () => {
  try {
    console.log("🔍 파일 다운로드 테스트 시작...");

    const response = await fetch(FILE_URL);
    console.log("🛠 응답 상태 코드:", response.status);

    if (!response.ok) {
      throw new Error(`서버 응답 오류: ${response.status}`);
    }

    console.log("✅ 파일 다운로드 응답 성공");
  } catch (error) {
    console.error("❌ 파일 다운로드 요청 실패:", error);
  }
};
const checkForUpdates = async () => {
  try {
    console.log("🔍 업데이트 확인 중...");

    const update = await Updates.checkForUpdateAsync();
    console.log("📢 업데이트 가능 여부:", update.isAvailable);

    if (update.isAvailable) {
      Alert.alert(
        "업데이트 가능", 
        "새로운 버전이 있습니다. 업데이트하시겠습니까?",
        [
          { text: "취소", style: "cancel", onPress: () => console.log("❌ 업데이트 취소됨") },
          { text: "업데이트", onPress: async () => {
              console.log("⬇️ 업데이트 다운로드 시작...");
              try {
                await Updates.fetchUpdateAsync();
                console.log("✅ 업데이트 다운로드 완료!");

                console.log("🔄 앱 재시작 중...");
                await Updates.reloadAsync();
              } catch (fetchError) {
                console.error("❌ 업데이트 다운로드 중 오류 발생:", fetchError);
              }
          }}
        ]
      );
    } else {
      console.log("🚀 최신 상태입니다! 업데이트 필요 없음.");
    }
  } catch (error) {
    console.error("❌ 업데이트 확인 실패:", error);
  }
};

useEffect(() => {
  checkForUpdates();
}, []);

// 앱 실행 시 업데이트 확인
useEffect(() => {
  checkForUpdates();
}, []);


// ✅ ArrayBuffer → Base64 변환 함수
const arrayBufferToBase64 = (buffer) => {
  return Buffer.from(new Uint8Array(buffer)).toString('base64');
};
const checkForFileUpdate = async () => {
  let fileUri = FileSystem.documentDirectory + "site.xlsx";

  try {
    console.log("🔍 서버에서 최신 파일 정보 확인 중...");

    const response = await fetch(FILE_URL, {
      method: "HEAD",  // ✅ 파일 내용을 가져오지 않고, 헤더 정보만 확인
      headers: { "Authorization": `Basic ${encodedAuth}` },
    });

    if (!response.ok) {
      console.error("❌ 서버에서 파일 정보를 가져오지 못함!", response.status);
      return;
    }

    // 🔥 서버의 최신 수정 날짜 확인
    const serverLastModified = response.headers.get("Last-Modified");
    console.log("📅 서버 파일 최종 수정 날짜:", serverLastModified);

    // 🔍 로컬 파일 정보 확인
    const fileInfo = await FileSystem.getInfoAsync(fileUri);
    if (fileInfo.exists) {
      const localLastModified = new Date(fileInfo.modificationTime).toUTCString();
      console.log("📅 로컬 파일 최종 수정 날짜:", localLastModified);

      // ✅ 최신 파일이면 다운로드하지 않음
      if (serverLastModified && new Date(serverLastModified) <= new Date(localLastModified)) {
        console.log("✅ 로컬 파일이 최신 상태입니다. 다운로드 불필요!");
        return;
      }
    }

    // 🔥 서버 파일이 더 최신이면 다운로드 실행!
    console.log("📥 새로운 파일 다운로드 중...");
    await downloadFile();

  } catch (error) {
    console.error("❌ 파일 업데이트 확인 중 오류 발생:", error);
  }
};
useEffect(() => {
  checkForFileUpdate();  // 앱 시작 시 파일 업데이트 여부 확인
}, []);

const downloadFile = async () => {
  console.log("🚀✅ downloadFile() 함수 실행됨!");

  if (Platform.OS === "web") {
    console.warn("⚠️ 웹 환경에서는 파일 다운로드 기능을 사용할 수 없습니다.");
    return null;
  }

  try {
    console.log("📥 파일 다운로드 시작...");
    console.log("🔑 Encoded Auth:", encodedAuth);

    let fileUri = FileSystem.documentDirectory + "site.xlsx";  // ✅ 저장할 파일 경로
    console.log("📂 저장할 파일 경로:", fileUri);

    console.log("🚀 fetch() 실행 전: 서버에서 파일 요청을 보냅니다.");
    const response = await fetch(FILE_URL, {
      method: "GET",
      headers: {
        "Authorization": `Basic ${encodedAuth}`,
        "Accept": "*/*"
      }
    });
    console.log("✅ fetch() 실행 후: 서버 응답을 받았습니다.");

    // ✅ 서버 응답 복사하여 텍스트 변환 (원본 응답 유지)
    const responseClone = response.clone(); // ✅ 응답 복사
    const responseText = await responseClone.text(); 
    console.log("📂 서버 응답 데이터 (앞 500자):", responseText.substring(0, 500));

    // 🔥 Blob 데이터 변환 시도
    const fileData = await response.blob();
    console.log("📂 다운로드된 Blob 데이터 크기:", fileData.size);

    // ✅ 응답이 XLSX 파일인지 확인
    console.log("📂 응답 데이터 타입 확인:", response.headers.get("content-type"));
    if (response.headers.get("content-type")?.includes("spreadsheet")) {
      console.log("✅ 서버에서 XLSX 파일 응답을 받았습니다!");
    } else {
      console.warn("⚠️ 예상치 못한 응답을 받음! 서버에서 다른 타입의 데이터를 보냄.");
      return;
    }

    // ✅ 응답이 정상인지 확인 (에러 응답 처리)
    if (!response.ok) {
      console.error("❌ 파일 다운로드 실패 (서버 응답 오류):", response.status);
      return;
    }
   
    if (!fileData || fileData.size === 0) {
      console.error("❌ 다운로드된 파일이 비어 있음 (blob 변환 실패)");
      return;
    }

    // 🔥 Base64 변환 및 저장 시도
    console.log("📂 파일을 Base64로 변환 시작...");
    const reader = new FileReader();

    reader.onload = () => {
      const binaryStr = reader.result;
      const workbook = XLSX.read(binaryStr, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const parsedData = XLSX.utils.sheet_to_json(sheet);

      // ✅ 여기에서 데이터 저장!
      setMagnetData(parsedData);
      console.log("📌 setMagnetData 호출됨! 저장할 데이터:", parsedData);
    };

    reader.readAsBinaryString(fileData); // ✅ `readAsBinaryString` 사용!

    reader.onloadend = async () => {
      const base64Data = reader.result.split(",")[1];

      if (!base64Data) {
        console.error("❌ Base64 변환 실패: 데이터가 비어 있음.");
        return;
      }

      console.log("📂 Base64 변환 완료, 파일 저장 시도...");
      try {
        await FileSystem.writeAsStringAsync(fileUri, base64Data, { encoding: FileSystem.EncodingType.Base64 });
        console.log("✅ 파일 저장 성공:", fileUri);

        const fileInfo = await FileSystem.getInfoAsync(fileUri);
        console.log("📂 저장된 파일 정보:", fileInfo);
      } catch (error) {
        console.error("❌ 파일 저장 실패:", error);
      }
    };

    reader.readAsDataURL(fileData);
    return fileUri;  // ✅ 다운로드된 파일 경로 반환

  } catch (error) {
    console.error("❌ 파일 다운로드 실패:", error);
    return null;
  }
};


// ✅ `useEffect`로 컴포넌트가 처음 마운트될 때 `downloadFile()` 실행
useEffect(() => {
  console.log("🚀✅ useEffect 실행됨, downloadFile() 호출 시도!");
  downloadFile();
}, []);

// 📌 기존 downloadExcel 유지 (downloadFile 호출)
const downloadExcel = async () => {
  try {
    console.log("⚡ [React Native] downloadExcel 함수 실행됨!");

    if (Platform.OS === "web") {
      console.warn("⚠️ 웹 환경에서는 다운로드 기능을 사용할 수 없습니다.");
      return;
    }

    console.log("📂 ✅ downloadFile() 함수가 실행되었습니다!");  
    const fileUri = await downloadFile();
    console.log("📂 ✅ downloadFile() 함수 실행 완료! 결과:", fileUri);


    if (!fileUri) {
      console.error("❌ 파일 다운로드 실패: fileUri가 없음");
      return;
    }

    await FileSystem.writeAsStringAsync(fileUri, base64Data, { encoding: FileSystem.EncodingType.Base64 });
    console.log("✅ 파일 저장 성공!");

    // 🔥 저장된 Base64 데이터 확인
    const base64 = await FileSystem.readAsStringAsync(fileUri, { encoding: FileSystem.EncodingType.Base64 });
    console.log("📂 저장된 Base64 데이터 (첫 100자):", base64.substring(0, 100));

    const fileInfo = await FileSystem.getInfoAsync(fileUri);
    console.log("📂 저장된 파일 정보:", fileInfo);


    if (!fileInfo.exists) {
      throw new Error("❌ 다운로드한 파일이 존재하지 않습니다.");
    }

    console.log("✅ [React Native] downloadExcel 실행 완료!");
  } catch (error) {
    console.error("❌ [React Native] downloadExcel 실패:", error);
  }
};

export const uploadExcel = async (file) => {
  const formData = new FormData();
  formData.append('file', {
      uri: file.uri,
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      name: 'site.xlsx',
  });

  try {
      const response = await api.post('/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
      });

      console.log('업로드 성공:', response.data);
      return response.data;
  } catch (error) {
      console.error('업로드 실패:', error);
      throw error;
  }
};
export const testApiCall = async () => {
  try {
      const response = await api.get('/assets/site.xlsx', { responseType: 'blob' });
      console.log('응답:', response);
      return response.data;
  } catch (error) {
      console.error('API 요청 실패:', error.response ? error.response.data : error.message);
      throw error;
  }
};
// 엑셀 파일을 내부 저장소로 복사하는 함수
const FILE_PATH = FileSystem.documentDirectory + "site.xlsx";  // ✅ 로컬 저장 경로

const copyExcelToLocal = async () => {
  console.log("📂 copyExcelToLocal 함수 실행됨!");

  if (Platform.OS === "web") {
      console.warn("⚠️ 웹 환경에서는 `getInfoAsync()`와 `downloadAsync()` 실행 불가. 파일을 직접 업로드해야 합니다.");

      // 기존 버튼이 존재하는지 확인 후 추가
      let uploadButton = document.getElementById("uploadButton");
      if (!uploadButton) {
          uploadButton = document.createElement("button");
          uploadButton.id = "uploadButton";
          uploadButton.innerText = "📂 엑셀 파일 업로드";
          uploadButton.style = "padding: 10px; margin-top: 10px; display:block;";

          const pickFile = async () => {
            try {
              if (Platform.OS === "web") {
                // 🌐 웹 환경: input 요소를 사용
                const input = document.createElement("input");
                input.type = "file";
                input.accept = ".xlsx";
                input.onchange = (event) => {
                  const file = event.target.files[0];
                  if (!file) {
                    console.log("❌ 선택된 파일이 없습니다.");
                    return;
                  }
                  console.log("📂 웹에서 선택한 파일:", file);
                  handleFileUpload(file);
                };
                input.click();
              } else {
                // 📱 React Native 환경: expo-document-picker 사용
                const result = await DocumentPicker.getDocumentAsync({
                  type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                  copyToCacheDirectory: true,
                });
          
                if (result.canceled) {
                  console.log("❌ 파일 선택 취소됨");
                  return;
                }
          
                console.log("📂 모바일에서 선택한 파일:", result);
                handleFileUpload(result.uri);
              }
            } catch (error) {
              console.error("❌ 파일 선택 중 오류 발생:", error);
            }
          };

          document.body.appendChild(uploadButton);
          console.log("✅ 파일 업로드 버튼이 추가되었습니다.");
      } else {
          console.log("🔹 파일 업로드 버튼이 이미 존재합니다.");
      }

      return "nullsite.xlsx"; // 웹에서는 자동 다운로드 X, 파일 업로드 필요
  }

  const fileUri = FileSystem.documentDirectory + "site.xlsx";
  console.log("📂 저장될 파일 경로:", fileUri);

  let fileInfo = await FileSystem.getInfoAsync(fileUri);
  console.log("📁 파일 존재 여부:", fileInfo);

  if (!fileInfo.exists) {
      console.log("⬇️ 엑셀 파일이 존재하지 않음, 다운로드 시작...");
      try {
          await FileSystem.downloadAsync(FILE_URL, fileUri);
          console.log("✅ 엑셀 파일 다운로드 완료:", fileUri);
      } catch (error) {
          console.error("❌ 파일 다운로드 실패:", error);
          return null;
      }
  } else {
      console.log("✅ 기존 엑셀 파일이 이미 존재함:", fileUri);
  }

  return fileUri;
};

// 📌 파일 업로드 처리 함수
const [fileContent, setFileContent] = useState(null);
const handleFileUpload = (file, magnetName, setMagnetData) => {
  if (!file) {
    console.error("❌ 파일이 선택되지 않았습니다.");
    return;
  }

  if (!magnetName) {
    console.error("❌ 선택된 Magnet이 없습니다. 데이터 로드를 중단합니다.");
    return;
  }

  console.log("📂 파일 업로드 시작:", file.name);
  console.log("🔎 현재 선택된 Magnet:", magnetName);

  const reader = new FileReader();

  reader.onload = (e) => {
    const binaryStr = e.target.result;
    console.log("📂 변환된 Base64 데이터 (앞부분 100자):", binaryStr.substring(0, 100)); // 일부만 출력

    const workbook = XLSX.read(binaryStr, { type: "binary" });

    console.log("📖 엑셀 파일 로드 완료!", workbook);

    if (setMagnetData) {
      processExcelData(workbook, magnetName, setMagnetData);
    } else {
      console.error("❌ setMagnetData 함수가 정의되지 않았습니다!");
    }
  };

  reader.readAsDataURL(fileData);

};



// ✅ loadExcelData 함수에서 웹 환경에서는 `getInfoAsync()`를 실행하지 않도록 수정
const loadExcelData = async (magnetName, setMagnetData) => {
  console.log("🔵 선택된 Magnet:", magnetName);

  let fileUri = await copyExcelToLocal();
  console.log("📂 읽어올 파일 경로:", fileUri);

  if (!fileUri || fileUri === "nullsite.xlsx") {
      console.warn("⚠️ 파일을 직접 업로드해야 합니다.");
      return;
  }

  if (Platform.OS !== "web") {
      const fileExists = await FileSystem.getInfoAsync(fileUri);
      console.log("✅ 파일 존재 여부:", fileExists);

      if (!fileExists.exists) {
          console.error("❌ 파일이 존재하지 않습니다:", fileUri);
          return;
      }
  } else {
      console.warn("⚠️ 웹 환경에서는 `readAsStringAsync()` 실행 불가능. 파일을 직접 업로드해야 합니다.");

      const input = document.createElement("input");
      <input
        type="file"
        id="fileInput"
        style={{ display: "none" }}
        onChange={handleFileUpload}
      />
      input.accept = ".xlsx";
      input.onchange = async (event) => {
          const file = event.target.files[0];
          if (!file) {
              console.error("❌ 선택된 파일이 없습니다.");
              return;
          }

          const reader = new FileReader();
          reader.readAsArrayBuffer(file); // 🔥 기존 readAsBinaryString() 대신 사용

          reader.onload = () => {
              const workbook = XLSX.read(reader.result, { type: "binary" });
              processExcelData(workbook, magnetName, setMagnetData);
          };
          reader.onerror = (error) => {
              console.error("❌ 파일 읽기 오류:", error);
          };
      };
      input.click();
      return;
  }
    
  try {
      const fileContent = await FileSystem.readAsStringAsync(fileUri, { encoding: FileSystem.EncodingType.Base64 });
      console.log("📂 저장된 파일(Base64) 첫 100자:", fileContent.substring(0, 100));
    
      console.log("📖 엑셀 파일 읽기 성공!");

      const workbook = XLSX.read(fileContent, { type: "base64" });
      processExcelData(workbook, magnetName, setMagnetData);
  } catch (error) {
      console.error("❌ 엑셀 파일 로딩 중 오류:", error);
  }
};


// 🟢 엑셀 데이터를 처리하는 함수 (웹/모바일 공통 사용)
const processExcelData = (workbook, magnetName, setMagnetData) => {
  const sheetName = "Magnet";
  const sheet = workbook.Sheets[sheetName];

  if (!sheet) {
      console.error(`❌ 시트 '${sheetName}'를 찾을 수 없습니다.`);
      return;
  }

  const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
  console.log("📊 변환된 엑셀 데이터:", jsonData);

  if (jsonData.length === 0) {
      console.error("❌ 엑셀 데이터가 비어 있습니다.");
      return;
  }

  const headers = jsonData[0];
  const rows = jsonData.slice(1).map(row =>
      Object.fromEntries(headers.map((h, i) => [h, row[i]]))
  );

  // ✅ undefined 값 방지 (row["magnet"]가 undefined면 빈 문자열 ""로 처리)
  const filteredData = rows.filter(row => (row["magnet"] ?? "").trim() === magnetName);
  console.log("✅ 필터링된 데이터:", filteredData);

  setMagnetData(filteredData);
};



export default function App() {
  const [screen, setScreen] = useState("home");
  const [prevScreens, setPrevScreens] = useState([]);  // 🔹 여러 개의 이전 화면을 저장
  const [selectedMagnet, setSelectedMagnet] = useState(null);
  const [selectedConsole, setSelectedConsole] = useState(null);
  const [selectedProbes, setSelectedProbes] = useState([]);
  const [selectedAccessories, setSelectedAccessories] = useState([]);
  const [selectedUtilities, setSelectedUtilities] = useState([]);
  const [magnetData, setMagnetData] = useState([]);
  const [summaryData, setSummaryData] = useState({
    Magnet: selectedMagnet,
    Console: selectedConsole,
    Probes: selectedProbes,
    Accessories: selectedAccessories,
    Utilities: selectedUtilities,
  });
  useEffect(() => {
    console.log("📂 Final 화면의 magnetData: ", magnetData);
  }, [magnetData]);  // ✅ magnetData가 변경될 때마다 로그 출력

  useEffect(() => {
    if (selectedMagnet && fileContent) {
      console.log("📢 Magnet 변경 감지! 데이터 다시 불러오기...");
      loadExcelData(selectedMagnet, setMagnetData);
    }
  }, [selectedMagnet]); // 🔥 selectedMagnet 변경 감지하여 실행
 
  const toggleSelection = (item, selectedList, setSelectedList) => {
    if (selectedList.includes(item)) {
      setSelectedList(selectedList.filter(i => i !== item));
    } else {
      setSelectedList([...selectedList, item]);
    }
  };

  const navigateTo = (nextScreen) => {
    console.log("📌 현재 화면(screen):", screen);
    console.log("🔄 저장되는 prevScreens 값:", [...prevScreens, screen]);

    setPrevScreens([...prevScreens, screen]); // 🔹 현재 화면을 이전 화면 목록에 추가
    setScreen(nextScreen);
  };


// ✅ navigateBack 함수 추가
  const navigateBack = () => {
    if (prevScreens.length > 0) {
        const lastScreen = prevScreens[prevScreens.length - 1]; // 🔹 마지막으로 저장된 화면 가져오기
        console.log("🔙 이전 화면으로 이동:", lastScreen);
        
        setScreen(lastScreen);
        setPrevScreens(prevScreens.slice(0, -1)); // 🔹 가장 최근의 화면을 제거하여 이전 화면 목록 업데이트
    }
  };

  useEffect(() => {
    console.log("🟢 useEffect 실행됨: downloadExcel() 호출");

    const downloadExcel = async () => {
        try {
            console.log("🟢 Excel 파일 다운로드 시작");

            console.log("🚀 fetch() 실행 전: 서버에서 파일 요청을 보냅니다.");
            const response = await fetch(FILE_URL, {
              method: "GET",
              headers: {
                "Authorization": `Basic ${encodedAuth}`,
                "Accept": "*/*"
              }
            });
            console.log("✅ fetch() 실행 후: 서버 응답을 받았습니다.");

            
                     

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "site.xlsx"; // 파일명 설정
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);

            console.log("✅ Excel 파일 다운로드 성공!");
        } catch (error) {
            console.error("❌ Excel 파일 다운로드 실패:", error);
        }
    };

    downloadExcel(); // ✅ 여기서 downloadExcel 실행

  }, []);


  const magnets = ["400core", "400evo", "500evo", "600evo", "700evo"];
  useEffect(() => {
    if (screen === "final") {
        console.log("🔄 useEffect 실행됨! (Final 화면)");
        console.log("📌 선택된 Magnet:", selectedMagnet);  // 선택된 Magnet 확인

        loadExcelData(selectedMagnet, setMagnetData);  // ❌ selectedMagnet이 정확히 전달되는지 확인

        console.log("📊 Final 화면의 magnetData: ", magnetData);
    }
}, [screen]);

  useEffect(() => {
    setSummaryData({
      Magnet: selectedMagnet,
      Console: selectedConsole,
      Probes: selectedProbes.join(", "), // 배열을 문자열로 변환
      Accessories: selectedAccessories.join(", "),
      Utilities: selectedUtilities.join(", "),
    });
  }, [selectedMagnet, selectedConsole, selectedProbes, selectedAccessories, selectedUtilities]);
  
  const API_URL = "http://192.168.1.13:5000/assets/site.xlsx";

  const uploadFile = async () => {
    try {
      const formData = new FormData();
      formData.append("file", {
        uri: "파일 경로",
        name: "test.xlsx",
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      console.log("📂 🚀 fetch() 요청을 실행합니다! (파일 다운로드 시작)");
      const response = await fetch(API_URL, {
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const jsonData = await response.json();
      console.log("📂 업로드된 데이터:", jsonData);
    } catch (error) {
      console.error("❌ 파일 업로드 실패:", error);
    }
  };

  return (
    <View style={styles.container}>
    
      {/* 🏠 시작 화면 */}
      {screen === "home" && (
        <View>
          <Text style={styles.title}>BBIOK App</Text>
            <TouchableOpacity
              style={styles.Sbutton}
              onPress={() => navigateTo("sitePlan")} // 🔥 "sitePlan"으로 이동
    >
              <Text style={styles.buttonText}>시작하기</Text>
            </TouchableOpacity>
        </View>
      )}

      {/* 📌 사이트 플랜 화면 */}
      {screen === "sitePlan" && (
        <View>
          <Text style={styles.title}>Site Plan</Text>
          <TouchableOpacity style={styles.button} onPress={navigateBack}><Text style={styles.buttonText}>Back</Text></TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => setScreen("magnet")}>
            <Text style={styles.buttonText}>자석</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* 🔄 개별 항목 선택 화면 */}
      {screen === "magnet" && (
        <View>
          <Text style={styles.title}>Magnet</Text>
          {["400core", "400evo", "500evo", "600evo", "700evo"].map(item => (
            <TouchableOpacity key={item} style={styles.menuItem} onPress={() => setSelectedMagnet(item)}>
              <Text style={[styles.menuText, selectedMagnet === item ? styles.selected : null]}>{item}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={styles.button} onPress={navigateBack}><Text style={styles.buttonText}>Back</Text></TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => navigateTo("console")} disabled={!selectedMagnet}><Text style={styles.buttonText}>Next</Text></TouchableOpacity>
        </View>
      )}

      {screen === "console" && (
        <View>
          <Text style={styles.title}>Console</Text>
          {["Nanobay", "Onebay", "Twobay"].map(item => (
            <TouchableOpacity key={item} style={styles.menuItem} onPress={() => setSelectedConsole(item)}>
              <Text style={[styles.menuText, selectedConsole === item ? styles.selected : null]}>{item}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={styles.button} onPress={navigateBack}><Text style={styles.buttonText}>Back</Text></TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => navigateTo("probe")} disabled={!selectedConsole}><Text style={styles.buttonText}>Next</Text></TouchableOpacity>
        </View>
      )}

      {screen === "probe" && (
        <View>
          <Text style={styles.title}>Probe</Text>
          {["Liquid", "Solid", "HR-MAS", "Prodigy", "CryoProbe"].map(item => (
            <TouchableOpacity key={item} style={styles.menuItem} onPress={() => toggleSelection(item, selectedProbes, setSelectedProbes)}>
              <Text style={[styles.menuText, selectedProbes.includes(item) ? styles.selected : null]}>{item}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={styles.button} onPress={navigateBack}><Text style={styles.buttonText}>Back</Text></TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => navigateTo("accessories")} disabled={selectedProbes.length === 0}><Text style={styles.buttonText}>Next</Text></TouchableOpacity>
        </View>
      )}

      {screen === "accessories" && (
        <View>
          <Text style={styles.title}>Accessories</Text>
          {["Autosampler", "BCU", "CPP&CRP"].map(item => (
            <TouchableOpacity key={item} style={styles.menuItem} onPress={() => toggleSelection(item, selectedAccessories, setSelectedAccessories)}>
              <Text style={[styles.menuText, selectedAccessories.includes(item) ? styles.selected : null]}>{item}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={styles.button} onPress={navigateBack}><Text style={styles.buttonText}>Back</Text></TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => navigateTo("utilities")} disabled={selectedAccessories.length === 0}><Text style={styles.buttonText}>Next</Text></TouchableOpacity>
        </View>
      )}

      {screen === "utilities" && (
        <View>
          <Text style={styles.title}>Utilities</Text>
          {["UPS", "Compressor", "Dryer"].map(item => (
            <TouchableOpacity key={item} style={styles.menuItem} onPress={() => toggleSelection(item, selectedUtilities, setSelectedUtilities)}>
              <Text style={[styles.menuText, selectedUtilities.includes(item) ? styles.selected : null]}>{item}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={styles.button} onPress={navigateBack}><Text style={styles.buttonText}>Back</Text></TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => navigateTo("summary")} disabled={selectedUtilities.length === 0}><Text style={styles.buttonText}>Next</Text></TouchableOpacity>
        </View>
      )}

      {/* 🛠 Summary 화면 */}
      {screen === "summary" && (
        <View>
          <Text style={styles.title}>Summary</Text>
          <View style={styles.summaryTable}>
            {Object.entries(summaryData).map(([key, value], index) => (
              <View key={index} style={styles.row}>
              <Text style={[styles.cellSummaryHeader, { flex: 3, borderRightWidth: 1, borderRightColor: "#ddd", paddingRight: 10 }]}>{key}</Text>
              <Text style={[styles.cellSummary, { flex: 3, paddingLeft: 10 }]}>{value}</Text>
            </View>
            ))}
          </View>
          <TouchableOpacity style={styles.button} onPress={navigateBack}>
            <Text style={styles.buttonText}>Back</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => navigateTo("final")}>
            <Text style={styles.buttonText}>Next</Text>
          </TouchableOpacity>
      
        </View>
      )}


      {/* 🛠 Final 화면 - 엑셀 데이터 표 출력 */}
        
      {screen === "final" && selectedMagnet && (
          <View style={{ flex: 1, width: "100%" }}>
              <ScrollView 
                  style={{ flex: 1, width: "100%" }}
                  contentContainerStyle={{
                      flexGrow: 1,
                      alignItems: "center",
                      justifyContent: "flex-start",
                      paddingVertical: 20,
                  }}
              >
                  <Text style={styles.title}>Final Data</Text>

                  {/* 🔥 magnetData 업데이트 감지 */}
                  {console.log("📌 Final 화면의 magnetData: ", magnetData)}

                  {/* ✅ magnetData가 undefined일 경우 대비 */}
                  <View>
                      {console.log("📌 Final 화면에서 magnetData 상태 확인:", JSON.stringify(magnetData, null, 2))}
                      {magnetData.length > 0 && Object.entries(magnetData[0] || {}).map(([key, value], index) => (
                          <View key={index} style={styles.row}>
                              <Text style={[styles.cellHeader, { flex: 2, borderRightWidth: 1, borderRightColor: "#ddd", paddingRight: 10 }]}>{key}</Text>
                              <Text style={[styles.cell, { flex: 3, paddingLeft: 10 }]}>{value}</Text>
                          </View>
                      ))}
                      {/* 데이터 없을 경우 메시지 */}
                      {magnetData.length === 0 && <Text>No Data Available</Text>}
                  </View>

                  {/* 🔥 Restart 버튼 */}
                  <TouchableOpacity
                      style={styles.Sbutton}
                      onPress={() => {
                          setSelectedMagnet(null);
                          setSelectedConsole(null);
                          setSelectedProbes([]);
                          setSelectedAccessories([]);
                          setSelectedUtilities([]);
                          setMagnetData([]);  // 엑셀 데이터도 초기화
                          setScreen("home");  // 홈 화면으로 이동
                      }}
                  >
                      <Text style={styles.buttonText}>Restart</Text>
                  </TouchableOpacity>

                  {/* 🔥 파일 불러오기 버튼 */}
                  <TouchableOpacity
                      style={styles.Sbutton}
                      onPress={async () => {
                          const file = await pickFile();
                          if (file) {
                              console.log("📂 선택된 파일:", file);
                          }
                      }}
                  >
                      <Text style={styles.buttonText}>파일 불러오기</Text>
                  </TouchableOpacity>
              
              </ScrollView>
          </View>
      )}





    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: "linear-gradient(to bottom, #1E3A8A, #000000)" // 위쪽 네이비 → 아래쪽 블랙
  },
  title: {
    textAlign : "center",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#007bff",
    paddingVertical: 10,  // 기존보다 줄이기
    paddingHorizontal: 40,  // 기존보다 줄이기
    borderRadius: 5,
    marginVertical: 10,
    width: 150,  // 기존보다 줄이기 (50% → 30%)
    maxWidth: 300, // 버튼이 너무 크지 않도록 제한
    alignItems: "center",
  },  
  Sbutton: {
    backgroundColor: "#007bff",
    paddingVertical: 10,  // 기존보다 줄이기
    paddingHorizontal: 40,  // 기존보다 줄이기
    borderRadius: 5,
    marginVertical: 10,
    width: 180,  // 기존보다 줄이기 (50% → 30%)
    maxWidth: 300, // 버튼이 너무 크지 않도록 제한
    alignItems: "center",
  },  
  Sitebutton: {
    backgroundColor: "#007bff",
    paddingVertical: 10,  // 기존보다 줄이기
    paddingHorizontal: 40,  // 기존보다 줄이기
    borderRadius: 5,
    marginVertical: 10,
    width: 180,  // 기존보다 줄이기 (50% → 30%)
    maxWidth: 300, // 버튼이 너무 크지 않도록 제한
    alignItems: "center",
  }, 
  magnetButton: {
    backgroundColor: "#007bff",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginVertical: 5,
    alignItems: "center",
    width: "50%",  // 버튼 크기 줄이기
    maxWidth: 300, // 버튼이 너무 커지지 않도록 제한
    alignSelf: "center", // 중앙 정렬
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  table: {
    borderWidth: 1,
    borderColor: "#007bff",
    borderRadius: 8,
    padding: 12,
    width: "80%", // 현재 비율
    maxWidth: 400, // 최대 크기 제한 (원하는 값으로 조정 가능)
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },
  summaryTable: {
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 8,
    padding: 10,
    width: "90%", // 크기를 summary에 맞게 조절
    backgroundColor: "#f5f5f5", // 연한 배경색 추가
    alignSelf: "center",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    paddingVertical: 10,
    width: "100%",
    paddingHorizontal: 15,
  },
  cellHeader: {
    fontWeight: "bold",
    fontSize: 16,
    textAlign: "center",
    paddingVertical: 5,
    borderRightWidth: 1, // ✅ 헤더와 값 사이 구분선 추가
    borderRightColor: "#ddd",
    paddingRight: 10,
  },
  cellSummaryHeader: {
    fontWeight: "bold",
    fontSize: 16,
    textAlign: "center",
    paddingVertical: 5,
    borderRightWidth: 1, // ✅ 헤더와 값 사이 구분선 추가
    borderRightColor: "#ddd",
    paddingRight: 10,
  },
  cell: {
    fontSize: 14,
    textAlign: "center",
    paddingVertical: 5,
    paddingLeft: 10,
  },
  cellSummary: {
    fontSize: 14,
    textAlign: "center",
    paddingVertical: 5,
    paddingLeft: 10,
  },
  menuItem: {
    backgroundColor: "#ffffff", // 기본 버튼 색상
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginVertical: 5,
    alignItems: "center",
    width: 150,
    alignSelf: "center",
  },
  selectedMenuItem: {
    backgroundColor: "#0056b3", // 선택된 버튼 색상 (어두운 파란색)
  },
  menuText: {
    color: "#000000",
    fontSize: 16,
    fontWeight: "bold",
  },
  selected: {
    backgroundColor: "#ffffff", // ✅ 선택된 버튼 색상 변경
    borderColor: "#003d82",
    borderWidth: 4,
  },
  
  selectedText: {
    color: "#fff", // ✅ 선택된 텍스트 색상 강조
    fontWeight: "bold",
  },
  scrollContainer: {
    flexGrow: 1, 
    alignItems: "center",
    paddingBottom: 20,  // ✅ 아래쪽 공간 추가 (버튼이 너무 붙지 않도록)
  },
});




