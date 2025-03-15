import axios from 'axios';

// Axios 인스턴스 생성
const api = axios.create({
    baseURL: process.env.NODE_ENV === 'development'
        ? 'http://10.0.2.2:5000'  // 개발 환경 (에뮬레이터)
        : 'https://bkh-app.onrender.com', // 배포 환경 (온라인 서버)
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + btoa('BBIOK:Bruker_2025') // 인증 추가
    }
});

export default api; // ✅ 올바르게 export