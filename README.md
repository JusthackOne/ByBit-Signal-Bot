# ByBit Signal Bot 📈

This bot in telegram sends "signals" to the user, according to the settings that the user sets in the bot. There are four types of signals in total - `PUMP`, `DUMP`, `OPEN INTEREST` and `LIQUIDATION`. The user can change the price in percent, as well as track certain cryptocurrency pairs. If a change occurs (which is tracked in real time), the bot sends a notification about it. This bot will be useful for people who are engaged in trading, so they can quickly, automatically track all the patterns they are interested in and make successful transactions.

## Stack 📚

- Telegraf
- Axios (Web-Socket)
- Bybit-api
- MongoDB

## Commands and .env Configuration 🔧

- Run `npm start` to start the client server.

Configure your `.env` in root folder with:<br><br>
`BOT_TOKEN` (Bot telegram token)<br>
`DATABASE_HOST` (Mongo DB host)<br>
`ADMIN_TG_ID` (User id, who can use bot)<br>

## Some Snapshots 📸
### Open Interest change message
![Снимок](https://github.com/user-attachments/assets/529362c3-d4d3-445f-ab4a-bb51d271627d)
### DUMP message
![Снивывывмок](https://github.com/user-attachments/assets/43e04472-7b85-478c-8216-1e87b2201a12)
### PUMP message
![Снвыцвывимок](https://github.com/user-attachments/assets/c1cc4221-e673-4438-90dd-4b83c784dd68)
### Main keyboard
![вывывPNG](https://github.com/user-attachments/assets/0065242e-b5ba-4962-8acb-fb60fb44f22a)
### PUMP and DUMP info and changing
![Снимвывыок](https://github.com/user-attachments/assets/027f37f6-4c48-4944-93af-97ab9cfa9ea2)
