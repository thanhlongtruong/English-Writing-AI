# ✍ Website luyện Writing - English

## 🛠️ Chức năng | Functions

- Đăng nhập, đăng kí.
- Đăng bài, comment, xóa bài, edit bài.
- Luyện Writing, AI gợi ý đoạn văn tiếng Việt theo yêu cầu, AI sửa và nhận xét bài làm.
- AI kiểm duyệt nội dung đăng bài và comment.

## 🔗 [Demo Website](https://english-writing-fruit-v1.vercel.app/)

## ⚙ Công nghệ được sử dụng

- Front-end: React + TailwindCSS
- Back-end: Node.js + Express
- Database: MongoDB
- JWT Authentication

## 🚀 Setup

- Front-end:
  - Step 1: npx create-vite@latest my-project --template react-ts
  - Step 2: cd my-project
  - Step 3: npm install
  - Step 4: npm run dev

## 📦 Thư viện | node package manager

- Front-end

  - [axios](https://www.npmjs.com/package/axios)
  - [jwt-decode](https://www.npmjs.com/package/jwt-decode)
  - [react-error-boundary](https://www.npmjs.com/package/react-error-boundary)
  - [react-hook-form](https://react-hook-form.com/get-started)
  - [@tanstack/react-query](https://tanstack.com/query/latest/docs/framework/react/installation)

  - [...Xem thêm (More)](./Client/package.json)

- Back-end

  - [openai](https://www.npmjs.com/package/openai)
  - [zod](https://www.npmjs.com/package/zod)
  - [@types/jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken)
  - [mongoose](https://www.npmjs.com/package/mongoose)
  - [@types/nodemailer](https://www.npmjs.com/package/@types/nodemailer)
  - [express](https://www.npmjs.com/package/express)

  - [...Xem thêm (More)](./Server/package.json)

## 🔑 .env example

- Front-end

  - VITE_BACKEND_URL="your-url-server"

- Back-end
  - PORT="2020"
  - MONGO_URI_ENGLISH="mongodb://localhost:27017"
  - JWT_SECRET="your-secret"
  - AUTH_EMAIL="your-email"
  - AUTH_EMAIL_PASSWORD="your-email-password"
  - OPENAI_API_KEY="your-api-key"
  - CLIENT_URL="http://localhost:5173"

## 📧 Liên hệ

- travfruit@gmail.com
