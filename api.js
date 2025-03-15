import axios from 'axios';

// Axios 인스턴스 생성
const api = axios.create({
    baseURL: 'https://bkh-app.onrender.com', // Render 서버 사용
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + btoa('BBIOK:Bruker_2025') // 인증 추가
    }
});
export default api; // ✅ 올바르게 export