import React from "react";
import { View, Text, TouchableOpacity } from "react-native";

const MainNavigator = ({ screen, setScreen }) => {
  console.log("📌 MainNavigator에서 받은 screen:", screen); // ✅ 로그 확인

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>현재 화면: {screen}</Text>
      <TouchableOpacity onPress={() => setScreen("sitePlan")}>
        <Text>사이트 플랜으로 이동</Text>
      </TouchableOpacity>
    </View>
  );
};

export default MainNavigator;
