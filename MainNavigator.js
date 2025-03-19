import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import styles from "./styles"; // 스타일 파일 불러오기

const MainNavigator = ({ screen, setScreen, navigateTo, navigateBack }) => {
  console.log("📌 MainNavigator에서 전달된 screen 값:", screen); // ✅ 추가된 로그
  
  return (
    <View style={styles.container}>
      {/* 🏠 홈 화면 */}
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
            <TouchableOpacity style={styles.button} onPress={() => navigateTo("magnet")}>
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
            <TouchableOpacity style={styles.button} onPress={() => navigateTo("AutoSampler")} disabled={selectedProbes.length === 0}><Text style={styles.buttonText}>Next</Text></TouchableOpacity>
          </View>
        )}

        {screen === "AutoSampler" && (
          <View>
            <Text style={styles.title}>AutoSampler</Text>
            {["Sample Case 24","Sample Case Plus","Sample Case Heated & Cooled","Sample Jet", "BCU",].map(item => (
              <TouchableOpacity key={item} style={styles.menuItem} onPress={() => toggleSelection(item, selectedAutoSampler, setSelectedAutoSampler)}>
                <Text style={[styles.menuText, selectedAutoSampler.includes(item) ? styles.selected : null]}>{item}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.button} onPress={navigateBack}><Text style={styles.buttonText}>Back</Text></TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={() => navigateTo("CPPandCRP")} disabled={selectedAutoSampler.length === 0}><Text style={styles.buttonText}>Next</Text></TouchableOpacity>
          </View>
        )}

        {screen === "CPPandCRP" && (
          <View>
            <Text style={styles.title}>CPPandCRP</Text>
            {["Prodigy","LN2dewar","CU","Outdoor", "indoor","Water Cooled"].map(item => (
              <TouchableOpacity key={item} style={styles.menuItem} onPress={() => toggleSelection(item, selectedCPPandCRP, setSelectedCPPandCRP)}>
                <Text style={[styles.menuText, selectedCPPandCRP.includes(item) ? styles.selected : null]}>{item}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.button} onPress={navigateBack}><Text style={styles.buttonText}>Back</Text></TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={() => navigateTo("utilities")} disabled={selectedCPPandCRP.length === 0}><Text style={styles.buttonText}>Next</Text></TouchableOpacity>
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

                    {/* 🔹 DynamicTable로 통합 */}
                    {magnetData.length > 0 && stepScreens[currentStep] === "magnet" && (
                      <DynamicTable title="Magnet Data" data={magnetData} />
                    )}
                    {consoleData.length > 0 && stepScreens[currentStep] === "console" && (
                      <DynamicTable title="Console Data" data={consoleData} />
                    )}
                    {autoSamplerData.length > 0 && stepScreens[currentStep] === "AutoSampler" && (
                      <DynamicTable title="AutoSampler Data" data={autoSamplerData} />
                    )}
                    {cppcrpData.length > 0 && stepScreens[currentStep] === "cppandcrp" && (
                      <DynamicTable title="CPP and CRP Data" data={cppcrpData} />
                    )}

                    {/* 🔹 Next / Prev 버튼 추가 */}
                    <View style={{ flexDirection: "row", justifyContent: "space-between", width: "80%", marginTop: 20 }}>
                      {currentStep > 0 && (
                        <TouchableOpacity
                          style={styles.Sbutton}
                          onPress={() => setCurrentStep(currentStep - 1)}
                        >
                          <Text style={styles.buttonText}>Prev</Text>
                        </TouchableOpacity>
                      )}

                      {currentStep < stepScreens.length - 1 && (
                        <TouchableOpacity
                          style={styles.Sbutton}
                          onPress={() => setCurrentStep(currentStep + 1)}
                        >
                          <Text style={styles.buttonText}>Next</Text>
                        </TouchableOpacity>
                      )}
                    </View>

                    {/* 🔥 magnetData 업데이트 감지 */}
                    {console.log(`📌 Final 화면의 ${stepScreens[currentStep]} Data: `, summaryData[stepScreens[currentStep]])}

                    <View>
                        {console.log(`📌 Final 화면에서 ${stepScreens[currentStep]} Data 상태 확인:`, JSON.stringify(summaryData[stepScreens[currentStep]], null, 2))}

                        {/* ✅ 현재 step에 맞는 데이터 가져오기 */}
                        {summaryData[stepScreens[currentStep]]?.length > 0 && 
                            Object.entries(summaryData[stepScreens[currentStep]][0] || {}).map(([key, value], index) => (
                                <View key={index} style={styles.row}>
                                    <Text style={[styles.cellHeader, { flex: 2, borderRightWidth: 1, borderRightColor: "#ddd", paddingRight: 10 }]}>{key}</Text>
                                    <Text style={[styles.cell, { flex: 3, paddingLeft: 10 }]}>{value}</Text>
                                </View>
                            ))
                        }

                        {/* 데이터 없을 경우 메시지 */}
                        {summaryData[stepScreens[currentStep]]?.length === 0 && <Text>No Data Available</Text>}
                    </View>


                    {/* 🔥 Restart 버튼 */}
                    <TouchableOpacity
                        style={styles.Sbutton}
                        onPress={() => {
                            setSelectedMagnet(null);
                            setSelectedConsole(null);
                            setSelectedProbes([]);
                            setSelectedAutoSampler([]);
                            setSelectedCPPandCRP([]);
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
};

export default MainNavigator;
