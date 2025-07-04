const express = require("express");
require("dotenv").config();
const app = express();
const database = require("./config/database");
const cookieParser = require("cookie-parser");
const port = process.env.PORT || 3000;

const cors = require("cors");

// Kết nối database
database.connect();

// Middleware để đọc body từ client, không cần body-parser nâng cao
app.use(express.json()); // Đọc JSON từ client (axios/fetch gửi lên)
app.use(express.urlencoded({ extended: true })); // Nếu dùng form HTML gửi lên

app.use(cookieParser());

//  Cho phép CORS
app.use(
  cors({
    origin: ["http://localhost:3000", "https://project-it-job-react.vercel.app"], // ✅ Chỉ cho phép React app
    credentials: true, //Cho phéo gửi request với cookie, phải có
  })
); //  cấu hình mặc định: cho phép tất cả origin
const routesApiV1 = require("./api/v1/routes/index.route");
routesApiV1(app);
// Tương lai: thêm v2
//const routesApiV2 = require("./api/v2/routes/index.route");  // 👉 index.route.js
//routesApiV2(app);

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
