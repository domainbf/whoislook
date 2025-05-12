import React, { useState, useRef, useEffect } from "react";
import extractDomainInfo from "../utils/extractDomainInfo";

// 状态映射
const statusMap = {
  "clientDeleteProhibited": "客户端禁止删除",
  // 其他状态映射...
};

const gradientTextStyle = {
  background: "linear-gradient(90deg,#1d88fa,#06c 80%)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  fontWeight: 700
};

const dynamicBgStyle = {
  width: "100vw",
  minHeight: "100vh",
  background: "linear-gradient(120deg, #e0eafc 0%, #f5f7fa 100%)",
  backgroundSize: "200% 200%",
  animation: "main-bg-move 8s ease-in-out infinite",
  display: "flex",
  flexDirection: "column",
  position: "relative"
};

// 示例内容...
