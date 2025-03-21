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
import MainNavigator from "./MainNavigator";  // ✅ 올바른지 확인!
import styles from "./styles";
console.log("🔥 App.js 실행됨!");
const [screen, setScreen] = useState("home");
const [prevScreens, setPrevScreens] = useState([]);
const [selectedMagnet, setSelectedMagnet] = useState(null);
const [selectedConsole, setSelectedConsole] = useState(null);
const [selectedProbes, setSelectedProbes] = useState([]);
const [selectedAutoSampler, setSelectedAutoSampler] = useState([]);
const [selectedCPPandCRP, setSelectedCPPandCRP] = useState([]);
const [selectedUtilities, setSelectedUtilities] = useState([]);
const [magnetData, setMagnetData] = useState([]);
const [consoleData, setConsoleData] = useState([]);
const [autoSamplerData, setAutoSamplerData] = useState([]);
const [cppandcrpData, setCPPandCRPData] = useState([]);
const [summaryData, setSummaryData] = useState({
    Magnet: selectedMagnet,
    Console: selectedConsole,
    Probes: selectedProbes,
    AutoSampler: selectedAutoSampler,
    CPPandCRP: selectedCPPandCRP,
    Utilities: selectedUtilities,
});
 
console.log("📌 초기 screen 값:", screen);

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

// ✅ useEffect로 실행 시점 조정
useEffect(() => {
  if (Platform.OS !== "web") {
    checkFileInfo();
  }
}, []);

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
    const fetchUpdates = async () => {
      await checkForUpdates();
    };
  
    fetchUpdates();
  }, []);
  
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
  
      if (typeof downloadFile === "function") {
        await downloadFile(); // ✅ downloadFile()이 정의되어 있는지 확인 후 실행
      } else {
        console.error("❌ downloadFile 함수가 정의되지 않았습니다!");
      }
  
    } catch (error) {
      console.error("❌ 파일 업데이트 확인 중 오류 발생:", error);
    }
  };
  useEffect(() => {
    const fetchFileUpdate = async () => {
      await checkForFileUpdate();
    };
  
    fetchFileUpdate();
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
        const sheet = workbook.Sheets[sheetName];
        const parsedData = XLSX.utils.sheet_to_json(sheet);
  
        // ✅ 여기에서 데이터 저장!
        setMagnetData(parsedData);
        console.log("📌 setMagnetData 호출됨! 저장할 데이터:", parsedData);
      };
  
      reader.readAsArrayBuffer(fileData); // ✅ `readAsBinaryString` 사용!
  
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
    useEffect(() => {
      console.log("📌 useEffect 실행됨! (엑셀 데이터 로드 관련)");
    }, []);
    
  // ✅ `useEffect`로 컴포넌트가 처음 마운트될 때 `downloadFile()` 실행
    useEffect(() => {
        console.log("🚀✅ useEffect 실행됨, downloadFile() 호출 시도!");
        downloadFile();
    }, []);
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
    const handleFileUpload = (file, sheetName, setData = () => {}) => {  // 기본값 설정
        if (!file) {
          console.error("❌ 파일이 선택되지 않았습니다.");
          return;
        }
      
        if (!sheetName) {
          console.error("❌ 선택된 시트가 없습니다. 데이터 로드를 중단합니다.");
          return;
        }
      
        console.log("📂 파일 업로드 시작:", file.name);
        console.log(`🔎 현재 선택된 시트: ${sheetName}`);
      
        const reader = new FileReader();
      
        reader.onload = (e) => {
          const binaryStr = e.target.result;
          console.log("📂 변환된 Base64 데이터 (앞부분 100자):", binaryStr.substring(0, 100));
      
          const workbook = XLSX.read(binaryStr, { type: "binary" });
      
          console.log(`📖 엑셀 파일 (${sheetName}) 로드 완료!`, workbook);
      
          if (typeof setData === "function") {
            processExcelData(workbook, sheetName, setData);
          } else {
            console.error(`❌ setData가 정의되지 않았습니다! (${sheetName} 데이터 업데이트 불가능)`);
          }
        };
      
        reader.readAsArrayBuffer(file);
      };
      
      
      // ✅ loadExcelData 함수에서 웹 환경에서는 `getInfoAsync()`를 실행하지 않도록 수정
    const loadExcelData = async (sheetName, selectedItem, setData = () => {}) => {  // ✅ 기본값 추가
    console.log(`🔵 선택된 시트: ${sheetName}, 항목: ${selectedItem}`);
    
    
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
        input.type = "file";
        input.accept = ".xlsx";
        input.style.display = "none";
        input.onchange = async (event) => {
            const file = event.target.files[0];
            if (!file) {
                console.error("❌ 선택된 파일이 없습니다.");
                return;
            }
    
            const reader = new FileReader();
            reader.readAsArrayBuffer(file);
    
            reader.onload = () => {
                const workbook = XLSX.read(reader.result, { type: "binary" });
                processExcelData(workbook, sheetName, setData);
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
    
        if (!fileContent) {
            console.error(`❌ 파일을 읽어오지 못함: ${fileUri}`);
            return;
        }
    
        console.log(`📂 저장된 파일(Base64) 첫 100자 (${sheetName}):`, fileContent.substring(0, 100));
    
        const workbook = XLSX.read(fileContent, { type: "base64" });
    
        if (typeof processExcelData === "function") {
            processExcelData(workbook, sheetName, selectedItem, setData); 
        } else {
            console.error("❌ processExcelData가 정의되지 않았습니다.");
        }
    
    } catch (error) {
        console.error(`❌ 엑셀 파일 로딩 중 오류 (${sheetName}):`, error);
    }
    };
    const processExcelData = (workbook, sheetName, selectedItem, setData = () => {}) => {  // ✅ 기본값 추가
        const sheet = workbook.Sheets[sheetName];
      
        console.log("📂 sheet 데이터 확인:", sheet);
        if (!sheet) { 
          console.error("❌ 시트를 찾을 수 없습니다.");
          return; 
        }


        if (!jsonData || !Array.isArray(jsonData) || jsonData.length === 0) { 
          console.error("❌ 엑셀 데이터가 비어 있거나 잘못된 형식입니다.");
        }
        
        
        const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 }) || [];
        console.log("📂 변환된 엑셀 데이터:", jsonData);
        if (!Array.isArray(jsonData) || jsonData.length === 0) {
          console.error("❌ jsonData 변환 실패 또는 빈 배열!");
          return;
        }


        const headers = jsonData[0];
        const rows = jsonData.slice(1).map(row =>
          Object.fromEntries(headers.map((h, i) => [h, row[i]]))
        );
      
        const filteredData = rows?.filter(row => (row[sheetName] ?? "").trim() === selectedItem) || []; // ✅ 기본값 빈 배열 추가
        console.log("✅ 필터링된 데이터:", filteredData);
        
        if (filteredData.length === 0) { 
          console.warn(`⚠️ 필터링된 데이터가 없음. (${sheetName})`); 
          return;
        }
        
        setData(filteredData);
      };    
    export default function App() {
    const [screen, setScreen] = useState("home");
    const [prevScreens, setPrevScreens] = useState([]);
    const [selectedMagnet, setSelectedMagnet] = useState(null);
    const [selectedConsole, setSelectedConsole] = useState(null);
    const [selectedProbes, setSelectedProbes] = useState([]);
    const [selectedAutoSampler, setSelectedAutoSampler] = useState([]);
    const [selectedCPPandCRP, setSelectedCPPandCRP] = useState([]);
    const [selectedUtilities, setSelectedUtilities] = useState([]);
    const [magnetData, setMagnetData] = useState([]);
    const [consoleData, setConsoleData] = useState([]);
    const [autosamplerData, setAutoSamplerData] = useState([]);
    const [cppandcrpData, setCPPandCRPData] = useState([]);
    const [summaryData, setSummaryData] = useState({
        Magnet: selectedMagnet,
        Console: selectedConsole,
        Probes: selectedProbes,
        AutoSampler: selectedAutoSampler,
        CPPandCRP: selectedCPPandCRP,
        Utilities: selectedUtilities,
    });
    
    console.log("🔥 초기 screen 값:", screen); // ✅ 초기 screen 상태 확인
    
    
    useEffect(() => {
        if (screen === undefined || screen === null) {
        console.error("❌ screen 값이 undefined 또는 null입니다!");
        } else {
        console.log("✅ 정상적인 screen 값:", screen);
        }
    }, [screen]);
    
    // ✅ navigateTo 함수 추가
    const navigateTo = (nextScreen) => {
        console.log("📌 현재 화면(screen):", screen);
        console.log("🔄 저장되는 prevScreens 값:", [...prevScreens, screen]);
    
        setPrevScreens([...prevScreens, screen]); // 🔹 현재 화면을 이전 화면 목록에 추가
        setScreen(nextScreen);
    };
    
    // ✅ navigateBack 함수 추가
    const navigateBack = () => {
        if (prevScreens.length > 0) {
        const lastScreen = prevScreens[prevScreens.length - 1]; // 🔄 pop() 대신 직접 접근
        console.log("🔙 이전 화면으로 이동:", lastScreen);
        setScreen(lastScreen);
        setPrevScreens(prevScreens.slice(0, -1)); // 마지막 항목 제거
        }
    };
    
    console.log("🚀 App.js에서 MainNavigator로 보내는 props:", {
        screen,
        setScreen,
        navigateTo,
        navigateBack,
        selectedMagnet,
        setSelectedMagnet,
        setSelectedConsole,
        setSelectedProbes,
        setSelectedAutoSampler,
        setSelectedUtilities
    });
    
    return (
        <View style={styles.container}>
        <MainNavigator
            screen={screen}
            setScreen={setScreen}
            navigateTo={navigateTo}
            navigateBack={navigateBack}
            selectedMagnet={selectedMagnet}
            setSelectedMagnet={setSelectedMagnet}
            selectedConsole={selectedConsole}
            setSelectedConsole={setSelectedConsole}
            selectedProbes={selectedProbes}
            setSelectedProbes={setSelectedProbes}
            selectedAutoSampler={selectedAutoSampler}
            setSelectedAutoSampler={setSelectedAutoSampler}
            selectedCPPandCRP={selectedCPPandCRP}
            setSelectedCPPandCRP={setSelectedCPPandCRP}
            selectedUtilities={selectedUtilities}
            setSelectedUtilities={setSelectedUtilities}
            magnetData={magnetData}
            setMagnetData={setMagnetData}
            consoleData={consoleData}
            setconsoleData={setConsoleData}
            autosamplerData={autosamplerData}
            setautosamplerData={setAutoSamplerData}
            cppandcrpData={cppandcrpData}
            setcppandcrpData={setCPPandCRPData}
            summaryData={summaryData}
            setSummaryData={setSummaryData}
        />
        </View>
    );
    }
    useEffect(() => {
    setSummaryData({
        Magnet: selectedMagnet,
        Console: selectedConsole,
        Probes: selectedProbes.join(", "), // 배열을 문자열로 변환
        AutoSampler: selectedAutoSampler.join(", "),
        CPPandCRP: selectedCPPandCRP.join(", "),
        Utilities: selectedUtilities.join(", "),
    });
    }, [selectedMagnet, selectedConsole, selectedProbes, selectedAutoSampler, selectedCPPandCRP, selectedUtilities]);
    useEffect(() => {
    setSummaryData((prevData) => ({
        ...prevData,
        Magnet: magnetData,
    }));
    }, [magnetData]);
    
    useEffect(() => {
    setSummaryData((prevData) => ({
        ...prevData,
        Console: consoleData,
    }));
    }, [consoleData]);
    
    useEffect(() => {
    setSummaryData((prevData) => ({
        ...prevData,
        AutoSampler: autoSamplerData,
    }));
    }, [autoSamplerData]);
    
    useEffect(() => {
    setSummaryData((prevData) => ({
        ...prevData,
        CPPandCRP: cppandcrpData,
    }));
    }, [cppandcrpData]);
    
    const [currentStep, setCurrentStep] = useState(0);
    
      console.log("🚀 초기 screen 상태:", screen); // ✅ 초기값 확인용
      useEffect(() => {
        console.log("📂 Final 화면의 magnetData: ", magnetData);
      }, [magnetData]);  // ✅ magnetData가 변경될 때마다 로그 출력
    
      useEffect(() => {
        if (selectedMagnet && fileContent) {
          console.log("📢 Magnet 변경 감지! 데이터 다시 불러오기...");
          loadExcelData(selectedMagnet, setMagnetData);
        }
      }, [selectedMagnet]); // 🔥 selectedMagnet 변경 감지하여 실행
     
      useEffect(() => {
        if (!screen) {
          console.warn("⚠️ screen 값이 정의되지 않음!");
          return;
        }
      
        if (screen === "final") {
          console.log("🔄 useEffect 실행됨! (Final 화면)");
      
          if (selectedMagnet?.length > 0) {
            console.log("📌 선택된 Magnet:", selectedMagnet);
            loadExcelData("Magnet", selectedMagnet, setMagnetData);
          }
          if (selectedConsole?.length > 0) {
            console.log("📌 선택된 Console:", selectedConsole);
            loadExcelData("Console", selectedConsole, setConsoleData);
          }
          if (selectedAutoSampler?.length > 0) {
            console.log("📌 선택된 AutoSampler:", selectedAutoSampler);
            loadExcelData("AutoSampler", selectedAutoSampler, setAutoSamplerData);
          }
          if (selectedCPPandCRP?.length > 0) {
            console.log("📌 선택된 CPPandCRP:", selectedCPPandCRP);
            loadExcelData("CPP&CRP", selectedCPPandCRP, setCPPandCRPData);
          }
        }
      }, [screen, selectedMagnet, selectedConsole, selectedAutoSampler, selectedCPPandCRP]);
      