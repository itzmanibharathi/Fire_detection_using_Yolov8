import asyncio
from telegram import Bot

TOKEN = "7963928332:AAEWcA8kHcFCkEv9tNoAj7l_sBh5rordzYI"
CHANNEL = "@firedetection_syntaxsquad"  # Or use chat_id like "-1001234567890"

bot = Bot(token=TOKEN)

async def main():
    message = await bot.send_message(chat_id=CHANNEL, text="🚨 Fire detection test message")
    print("✅ Message sent!")
    print("Chat Title:", message.chat.title)
    print("Chat ID:", message.chat.id)

asyncio.run(main())
