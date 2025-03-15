const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const multer = require("multer"); // 파일 업로드
const XLSX = require("xlsx");
const basicAuth = require('express-basic-auth'); // 기본 인증 추가

const app = express();
const PORT = 5000;

// 비밀번호 인증 설정
app.use(basicAuth({
  users: { 'BBIOK': 'Bruker_2025' },  // 사용자명과 비밀번호 설정
  challenge: true,  // 브라우저에서 로그인 요청
  unauthorizedResponse: 'Unauthorized'  // 인증 실패 시 응답 메시지
}));

// 📌 CORS 설정 (모든 도메인 허용)
app.use(cors());
app.use(express.json());

// 📌 정적 파일 제공 (엑셀 파일 포함)
app.use("/assets", express.static(path.join(__dirname, "public/assets")));

// 📌 요청 로그 출력 (디버깅용)
app.use((req, res, next) => {
  console.log("📢 요청 받은 URL:", req.url);
  next();
});

// 📌 엑셀 파일 제공 API
app.get("/assets/site.xlsx", (req, res) => {
  const filePath = path.join(__dirname, "public", "assets", "site.xlsx");
  if (fs.existsSync(filePath)) {
    console.log("✅ 파일 존재:", filePath);
    res.sendFile(filePath);
  } else {
    console.error("❌ 파일이 존재하지 않음:", filePath);
    res.status(404).send("File not found");
  }
});

// 📌 ⏬ 새로운 기능: 엑셀 파일 업로드 & JSON 변환 추가! ⏬

// 파일 업로드를 위한 multer 설정
const upload = multer({ dest: "uploads/" });

// 📌 엑셀 파일 업로드 & JSON 변환 API
app.post("/upload", upload.single("file"), (req, res) => {
  try {
    const filePath = req.file.path;
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(sheet);

    // 파일 삭제 (서버 저장 X, 데이터만 전송)
    fs.unlinkSync(filePath);

    console.log("✅ 업로드된 엑셀 파일 처리 완료!");
    res.json(jsonData);
  } catch (error) {
    console.error("❌ 파일 처리 중 오류 발생:", error);
    res.status(500).json({ error: "파일 처리 중 오류 발생" });
  }
});

// 📌 서버 실행
app.listen(5000, "0.0.0.0", () => console.log("🚀 Server running on http://0.0.0.0:5000"));

