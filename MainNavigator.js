import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import styles from "./styles"; // 스타일 불러오기

// ✅ props를 직접 받아서 확인하는 부분 수정
const MainNavigator = (props) => {
  console.log("📌 MainNavigator가 받은 props:", props); // props가 undefined인지 확인

  if (!props) {
    console.error("❌ props가 undefined 입니다!");
    return <Text style={styles.title}>오류: props가 없습니다!</Text>;
  }

  const { screen, setScreen, navigateTo, navigateBack } = props;
  console.log("📌 MainNavigator에서 전달된 screen 값:", screen);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>현재 화면: {screen}</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigateTo("sitePlan")}
      >
        <Text style={styles.buttonText}>시작하기</Text>
      </TouchableOpacity>
    </View>
  );
};

export default MainNavigator;
