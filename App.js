import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";

export default function App() {
  const [screen, setScreen] = useState("home");  // ✅ 기본 state 설정

  console.log("🔥 현재 screen 값:", screen); // ✅ 실행 시 로그 확인

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>현재 화면: {screen}</Text>
      <TouchableOpacity onPress={() => setScreen("nextScreen")}>
        <Text>다음 화면으로 이동</Text>
      </TouchableOpacity>
    </View>
  );
}
