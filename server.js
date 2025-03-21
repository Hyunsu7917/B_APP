const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const multer = require("multer"); // 파일 업로드
const XLSX = require("xlsx");
const basicAuth = require("express-basic-auth"); // 기본 인증 추가

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ CORS 설정
app.use(cors({
  origin: ["http://localhost:8081", "https://bkh-app.onrender.com"], // 허용할 도메인
  methods: ["GET", "POST"], // 허용할 HTTP 메서드
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

// ✅ 비밀번호 인증 설정 (Basic Auth)
app.use(basicAuth({
  users: { "BBIOK": "Bruker_2025" }, // 사용자명과 비밀번호 설정
  challenge: true,
  unauthorizedResponse: "Unauthorized"
}));

// ✅ 서버 정상 동작 확인
app.get("/", (req, res) => {
  res.send("🚀 서버가 정상적으로 작동 중입니다!");
});

// ✅ 정적 파일 제공 (엑셀 파일 포함)
app.use("/assets", express.static(path.join(__dirname, "assets")));

// ✅ 엑셀 파일 다운로드 API (인증 포함)
app.get('/download/site.xlsx', (req, res) => {
  const authHeader = req.headers.authorization;
  console.log("🔍 [Server] Received Authorization Header:", authHeader); // 서버에서 받은 헤더 로그 출력

  if (!authHeader || authHeader !== "Basic " + Buffer.from("BBIOK:Bruker_2025").toString("base64")) {
      return res.status(401).send("Unauthorized");
  }

  const filePath = path.join(__dirname, 'assets', 'site.xlsx');
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename="site.xlsx"');
  res.sendFile(filePath);
});




// ✅ 엑셀 파일 업로드 & JSON 변환 API
const upload = multer({ dest: "uploads/" });

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

// ✅ 서버 실행
app.listen(PORT, () => {
  console.log(`🚀 서버 실행 중: http://localhost:${PORT}`);
});
