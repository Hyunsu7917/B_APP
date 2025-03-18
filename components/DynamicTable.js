import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";

const DynamicTable = ({ title, data }) => {
  if (!data || data.length === 0) {
    return <Text style={styles.noData}>No Data Available</Text>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <ScrollView style={styles.tableContainer}>
        {Object.entries(data[0] || {}).map(([key, value], index) => (
          <View key={index} style={styles.row}>
            <Text style={[styles.cellHeader, styles.cell]}>{key}</Text>
            <Text style={styles.cell}>{value}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "90%",
    maxWidth: 500,
    marginVertical: 10,
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 8,
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  tableContainer: {
    maxHeight: 400,
  },
  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    paddingVertical: 8,
  },
  cellHeader: {
    fontWeight: "bold",
    backgroundColor: "#f4f4f4",
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  cell: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  noData: {
    textAlign: "center",
    fontSize: 16,
    color: "#888",
    marginVertical: 20,
  },
});

export default DynamicTable;
