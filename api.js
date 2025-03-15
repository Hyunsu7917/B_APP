import axios from 'axios';

// Axios 인스턴스 생성 (공통 설정)
const api = axios.create({
  baseURL: 'https://bkh-app.onrender.com', // 백엔드 서버 주소
  headers: {
    'Content-Type': 'application/json',
  },
  auth: {
    username: 'BBIOK',       // 아이디
    password: 'Bruker_2025', // 비밀번호
  },
});

export default api;

import api from './api';
import { useEffect } from 'react';
import { Alert } from 'react-native';
import * as FileSystem from 'expo-file-system';

const downloadExcel = async () => {
  try {
    const response = await api.get('/assets/site.xlsx', { responseType: 'blob' });

    const fileUri = `${FileSystem.documentDirectory}site.xlsx`;
    await FileSystem.writeAsStringAsync(fileUri, response.data, { encoding: FileSystem.EncodingType.Base64 });

    Alert.alert('다운로드 완료!', '파일이 저장되었습니다.');
  } catch (error) {
    console.error('엑셀 다운로드 실패:', error);
    Alert.alert('다운로드 실패', '엑셀 파일을 가져오지 못했습니다.');
  }
};

useEffect(() => {
  downloadExcel();
}, []);

const uploadExcel = async (file) => {
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
    } catch (error) {
      console.error('업로드 실패:', error);
    }
  };
  