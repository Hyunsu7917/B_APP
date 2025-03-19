import { StyleSheet } from "react-native";

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
  