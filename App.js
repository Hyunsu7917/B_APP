import React, { useState, useEffect } from "react";
import { Text, View, TouchableOpacity, StyleSheet, StatusBar, ScrollView, Platform } from "react-native"; // ✅ 여기 포함됨!
import { Asset } from "expo-asset";
import * as FileSystem from "expo-file-system";
import * as XLSX from "xlsx";
import api from './api'; // 🔥 여기서 올바르게 import해야 함!
import { Alert } from 'react-native';
import * as Updates from "expo-updates";
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

useEffect(() => {
  testDownload(); // API 요청이 정상적으로 되는지 확인하는 함수 실행
}, []);

const checkForUpdates = async () => {
  try {
    const update = await Updates.checkForUpdateAsync();
    if (update.isAvailable) {
      Alert.alert(
        "업데이트 가능", 
        "새로운 버전이 있습니다. 업데이트하시겠습니까?",
        [
          { text: "취소", style: "cancel" },
          { text: "업데이트", onPress: async () => {
              await Updates.fetchUpdateAsync();
              await Updates.reloadAsync();
          }}
        ]
      );
    }
  } catch (error) {
    console.error("업데이트 확인 실패:", error);
  }
};

// 앱 실행 시 업데이트 확인
useEffect(() => {
  checkForUpdates();
}, []);


// ✅ ArrayBuffer → Base64 변환 함수
const arrayBufferToBase64 = (buffer) => {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};
const FILE_URL = "https://bkh-app.onrender.com/download/site.xlsx"; // 🔥 인증이 필요한 경로로 수정

import { encode as base64Encode } from "react-native-quick-base64"; // 🔹 Base64 인코딩 라이브러리 추가

const downloadExcel = async () => {
  try {
    const username = "BBIOK";  // 사용자 아이디
    const password = "Bruker_2025"; // 사용자 비밀번호
    const encodedAuth = btoa(`${username}:${password}`); // Base64 인코딩

    console.log("🔍 [React Native] Authorization 헤더:", `Basic ${encodedAuth}`);
    console.log("📌 [React Native] 요청 URL:", FILE_URL);


    const response = await axios.get(FILE_URL, {
      responseType: 'arraybuffer',
      headers: {
        'Accept': '*/*',
        'Authorization': `Basic ${encodedAuth}`
      }
    });


    if (response.status !== 200) {
      throw new Error(`서버 응답 오류: ${response.status}`);
    }

    console.log("✅ [React Native] 서버 응답 성공:", response);
  } catch (error) {
    console.error("❌ [React Native] 파일 다운로드 요청 실패:", error);
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
  try {
    const fileUri = FileSystem.documentDirectory + "site.xlsx";
    console.log("📁 저장될 파일 경로:", fileUri);

    const fileExists = await FileSystem.getInfoAsync(fileUri);
    if (!fileExists.exists) {
      console.log("📂 엑셀 파일이 존재하지 않음, 다운로드 시작...");

      await FileSystem.downloadAsync(FILE_URL, fileUri);
      console.log("✅ 엑셀 파일 다운로드 완료:", fileUri);
    } else {
      console.log("✅ 기존 엑셀 파일이 이미 존재함:", fileUri);
    }

    return fileUri;
  } catch (error) {
    console.error("❌ 엑셀 파일 로드 실패:", error);
    return null;
  }
};


// 엑셀 데이터 로드 함수
const loadExcelData = async (magnetName, setMagnetData) => {
  try {
    console.log("🔍 선택된 Magnet:", magnetName);

    // 📌 fileUri를 정확히 받아오기
    const fileUri = await copyExcelToLocal();
    if (!fileUri) {
      console.error("❌ 파일을 찾을 수 없습니다.");
      return;
    }

    console.log("✅ 로컬 저장된 엑셀 파일 경로:", fileUri);

    const fileContent = await FileSystem.readAsStringAsync(fileUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const workbook = XLSX.read(fileContent, { type: "base64" });
    const sheetName = "Magnet";

    const sheet = workbook.Sheets[sheetName];
    if (!sheet) {
      console.error(`❌ 시트 '${sheetName}'을 찾을 수 없습니다.`);
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

    const filteredData = rows.filter(row => row["magnet"]?.trim() === magnetName);

    console.log("✅ 필터링된 데이터:", filteredData);
    setMagnetData(filteredData);
  } catch (error) {
    console.error("❌ Excel 파일 로딩 중 오류:", error);
  }
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

            const response = await fetch("https://bkh-app.onrender.com/assets/site.xlsx", {
              method: "GET",
              headers: {
                "Authorization": "Basic " + btoa("BBIOK:Bruker_2025"),  // 인증 추가
                "Content-Type": "application/octet-stream"
              }
            });
            
                     

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

            {console.log("Final 화면의 magnetData: ", magnetData)}

            {magnetData.length > 0 ? (
              <View style={[styles.table, { width: "80%", maxWidth: 500, maxheight: 600, alignSelf: "center"}]}>
                {/* ✅ 내부 ScrollView에 flex 설정 및 nestedScrollEnabled 추가 */}
                <ScrollView style={{ flex: 1 }} nestedScrollEnabled={true}>
                  {Object.entries(magnetData[0]).map(([key, value], index) => (
                    <View key={index} style={styles.row}>
                      <Text style={[styles.cellHeader, { flex: 2, borderRightWidth: 1, borderRightColor: "#ddd", paddingRight: 10 }]}>{key}</Text>
                      <Text style={[styles.cell, { flex: 3, paddingLeft: 10 }]}>{value}</Text>
                    </View>
                  ))}
                </ScrollView>
              </View>
            ) : (
              <Text>No Data Available</Text>
            )}

            <TouchableOpacity style={styles.Sbutton} onPress={() => setScreen("home")}>
              <Text style={styles.buttonText}>Restart</Text>
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




