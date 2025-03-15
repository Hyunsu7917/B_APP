import axios from 'axios';

// 기본 Axios 인스턴스 생성
const api = axios.create({
    baseURL: 'https://bkh-app.onrender.com', // 🔹 Render 서버를 바라보도록 설정
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + btoa('BBIOK:Bruker_2025') // 🔹 인증 추가 (필요시)
    }
});

  
export default api;

import api from './api';
import { useEffect } from 'react';
import { Alert } from 'react-native';
import * as FileSystem from 'expo-file-system';

 

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
  const testApiCall = async () => {
    try {
      const response = await api.get('/assets/site.xlsx', { responseType: 'blob' });
      console.log('응답:', response);
    } catch (error) {
      console.error('API 요청 실패:', error.response ? error.response.data : error.message);
    }
  };
  
  useEffect(() => {
    testApiCall();
  }, []);
  