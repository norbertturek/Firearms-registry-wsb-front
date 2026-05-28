import dotenv from "dotenv";
import ngrok from "@ngrok/ngrok";

dotenv.config();

const port = Number(process.env.NGROK_PORT ?? process.env.PORT ?? 5173);

if (!process.env.NGROK_AUTHTOKEN) {
  console.error(`
Brak NGROK_AUTHTOKEN.

1. Załóż darmowe konto: https://dashboard.ngrok.com/signup
2. Skopiuj token: https://dashboard.ngrok.com/get-started/your-authtoken
3. Dodaj do .env w katalogu projektu:

   NGROK_AUTHTOKEN=twój_token

4. Uruchom ponownie: pnpm dev:mobile
`);
  process.exit(1);
}

const listener = await ngrok.forward({
  addr: port,
  authtoken_from_env: true,
});

const base = listener.url()?.replace(/\/$/, "") ?? "";

console.log("");
console.log("  ngrok HTTPS (telefon):  ", base);
console.log("  Sklep — skan:           ", `${base}/shop/verify`);
console.log("  Obywatel — QR:          ", `${base}/promises`);
console.log("  Login:                  ", `${base}/`);
console.log("");
console.log("  Zatrzymaj: Ctrl+C");
console.log("");

const shutdown = async () => {
  await listener.close();
  process.exit(0);
};

process.on("SIGINT", () => void shutdown());
process.on("SIGTERM", () => void shutdown());

// Keep tunnel process alive until Ctrl+C
setInterval(() => {}, 60_000);
