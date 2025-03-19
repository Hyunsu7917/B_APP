import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import styles from "./styles"; // 스타일 파일 불러오기

const MainNavigator = ({ screen, setScreen, navigateBack }) => {
  return (
    <View style={styles.container}>
      {/* 🏠 홈 화면 */}
      {screen === "home" && (
        <View>
          <Text style={styles.title}>BBIOK App</Text>
          <TouchableOpacity style={styles.Sbutton} onPress={() => setScreen("sitePlan")}>
            <Text style={styles.buttonText}>시작하기</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* 📌 사이트 플랜 화면 */}
      {screen === "sitePlan" && (
        <View>
          <Text style={styles.title}>Site Plan</Text>
          <TouchableOpacity style={styles.button} onPress={navigateBack}>
            <Text style={styles.buttonText}>Back</Text>
          </TouchableOpacity>
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
            <TouchableOpacity key={item} style={styles.menuItem} onPress={() => setScreen("console")}>
              <Text style={styles.menuText}>{item}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={styles.button} onPress={navigateBack}>
            <Text style={styles.buttonText}>Back</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default MainNavigator;
