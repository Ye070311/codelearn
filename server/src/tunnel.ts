import localtunnel from "localtunnel"

const PORT = 3001
const SUBDOMAIN = "codelearn" + Math.random().toString(36).slice(2, 6)

console.log("正在创建公网隧道...")

try {
  const tunnel = await localtunnel({ 
    port: PORT, 
    subdomain: SUBDOMAIN,
    host: "https://localtunnel.me"
  })
  
  console.log("")
  console.log("╔══════════════════════════════════════════╗")
  console.log("║          🎉 CodeLearn v0.1 已上线       ║")
  console.log("╠══════════════════════════════════════════╣")
  console.log(`║  公网地址: ${tunnel.url.padEnd(28)} ║`)
  console.log(`║  本地地址: http://localhost:${PORT}${" ".repeat(15)} ║`)
  console.log("╚══════════════════════════════════════════╝")
  console.log("")
  console.log("任何人打开上面的公网地址就能访问你的 App！")
  console.log("按 Ctrl+C 关闭隧道")
  
  tunnel.on("close", () => {
    console.log("隧道已关闭")
    process.exit(0)
  })
  
  tunnel.on("error", (err) => {
    console.error("隧道错误:", err.message)
  })
} catch (err) {
  console.error("隧道创建失败:", err.message)
  console.log("正在尝试备用方案...")
  
  try {
    const tunnel = await localtunnel({ port: PORT })
    console.log("")
    console.log("╔═══════════════════════════════════╗")
    console.log("║     🎉 公网地址 (备用)            ║")
    console.log("╠═══════════════════════════════════╣")
    console.log(`║  ${tunnel.url}  ║`)
    console.log("╚═══════════════════════════════════╝")
  } catch (err2) {
    console.error("所有隧道方案均失败:", err2.message)
    console.log("请尝试手动部署到云平台 (见下方说明)")
  }
}
